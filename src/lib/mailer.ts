import nodemailer from 'nodemailer';
import {
  MAIL_ASSET_BASE_URL,
  MAIL_FROM_ADDRESS,
  MAIL_FROM_NAME,
  MAIL_REPLY_TO_ADDRESS,
  MAIL_TO_ADDRESS,
  SMTP_APP_PASSWORD,
  SMTP_HOST,
  SMTP_PORT,
  SMTP_SECURE,
  SMTP_USER,
} from 'astro:env/server';
import type { Enquiry } from './enquiries';
import { customerConfirmationTemplate, internalNotificationTemplate } from './email-templates';

type MailConfiguration = {
  fromAddress: string;
  recipientAddress: string;
  replyToAddress: string;
  logoUrl: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function requiredConfiguration(): MailConfiguration {
  const fromAddress = MAIL_FROM_ADDRESS || SMTP_USER;
  const recipientAddress = MAIL_TO_ADDRESS;
  const replyToAddress = MAIL_REPLY_TO_ADDRESS || recipientAddress;
  if (!SMTP_USER || !SMTP_APP_PASSWORD || !fromAddress || !recipientAddress || !replyToAddress || !MAIL_ASSET_BASE_URL) {
    throw new Error('SMTP email delivery is not fully configured.');
  }
  if (![SMTP_USER, fromAddress, recipientAddress, replyToAddress].every((value) => emailPattern.test(value))) {
    throw new Error('SMTP email delivery contains an invalid email address.');
  }

  let assetBaseUrl: URL;
  try {
    assetBaseUrl = new URL(MAIL_ASSET_BASE_URL);
  } catch {
    throw new Error('MAIL_ASSET_BASE_URL must be an absolute URL.');
  }
  if (!['http:', 'https:'].includes(assetBaseUrl.protocol)) {
    throw new Error('MAIL_ASSET_BASE_URL must use HTTP or HTTPS.');
  }

  return {
    fromAddress,
    recipientAddress,
    replyToAddress,
    logoUrl: new URL('/Images/logo/thhome-white-logo.png', assetBaseUrl).toString(),
  };
}

const transporter = SMTP_USER && SMTP_APP_PASSWORD
  ? nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_SECURE,
      auth: { user: SMTP_USER, pass: SMTP_APP_PASSWORD.replaceAll(' ', '') },
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 20_000,
    })
  : null;

export async function sendEnquiryEmails(enquiry: Enquiry, reference: string) {
  const config = requiredConfiguration();
  if (!transporter) throw new Error('SMTP email delivery is not configured.');

  const customer = customerConfirmationTemplate({ enquiry, reference, logoUrl: config.logoUrl });
  const internal = internalNotificationTemplate({ enquiry, reference, logoUrl: config.logoUrl });
  const customerAddress = enquiry.email;
  const from = { name: MAIL_FROM_NAME, address: config.fromAddress };

  await transporter.sendMail({
    from,
    to: config.recipientAddress,
    replyTo: customerAddress,
    subject: internal.subject,
    html: internal.html,
    text: internal.text,
  });

  await transporter.sendMail({
    from,
    to: customerAddress,
    replyTo: config.replyToAddress,
    subject: customer.subject,
    html: customer.html,
    text: customer.text,
  });
}
