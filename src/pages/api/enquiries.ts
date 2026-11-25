import type { APIRoute } from 'astro';
import { createEnquiryReference, parseEnquiry } from '../../lib/enquiries';
import { sendEnquiryEmails } from '../../lib/mailer';

export const prerender = false;

const MAX_BODY_BYTES = 64 * 1024;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 5;
const requestLog = new Map<string, number[]>();

const json = (body: Record<string, unknown>, status: number) => new Response(JSON.stringify(body), {
  status,
  headers: {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
  },
});

const requestIp = (request: Request) => request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  || request.headers.get('x-real-ip')
  || 'unknown';

const rateLimited = (key: string) => {
  const now = Date.now();
  const recent = (requestLog.get(key) || []).filter((timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS);
  if (recent.length >= RATE_LIMIT_MAX_REQUESTS) return true;
  if (!requestLog.has(key) && requestLog.size >= 10_000) {
    const oldestKey = requestLog.keys().next().value;
    if (oldestKey) requestLog.delete(oldestKey);
  }
  recent.push(now);
  requestLog.set(key, recent);
  return false;
};

const hasAllowedOrigin = (request: Request) => {
  const origin = request.headers.get('origin');
  if (!origin) return false;
  try {
    const originUrl = new URL(origin);
    const forwardedHost = request.headers.get('x-forwarded-host')?.split(',')[0]?.trim();
    const requestHost = forwardedHost || request.headers.get('host') || new URL(request.url).host;
    return originUrl.host === requestHost;
  } catch {
    return false;
  }
};

export const POST: APIRoute = async ({ request }) => {
  if (!hasAllowedOrigin(request)) {
    return json({ message: 'This submission could not be verified.' }, 403);
  }
  if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) {
    return json({ message: 'Submit the form as JSON.' }, 415);
  }
  const contentLength = Number(request.headers.get('content-length') || 0);
  if (!Number.isFinite(contentLength) || contentLength > MAX_BODY_BYTES) {
    return json({ message: 'The submission is too large.' }, 413);
  }
  const ip = requestIp(request);
  if (rateLimited(ip)) {
    return json({ message: 'Too many submissions. Please wait before trying again.' }, 429);
  }

  let body: unknown;
  try {
    const rawBody = await request.text();
    if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
      return json({ message: 'The submission is too large.' }, 413);
    }
    body = JSON.parse(rawBody);
  } catch {
    return json({ message: 'The submission could not be read.' }, 400);
  }
  const result = parseEnquiry(body);
  if (!result.success) return json({ message: result.message }, 422);

  const reference = createEnquiryReference();
  try {
    await sendEnquiryEmails(result.enquiry, reference);
  } catch {
    console.error(`[enquiries] Email delivery failed for ${reference}.`);
    return json({ message: 'We could not send your enquiry right now. Please try again or contact us by telephone.' }, 503);
  }

  return json({ message: 'Your enquiry has been sent.', reference }, 200);
};

export const ALL: APIRoute = () => json({ message: 'Method not allowed.' }, 405);
