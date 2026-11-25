import type { Enquiry } from './enquiries';

type TemplateOptions = {
  enquiry: Enquiry;
  reference: string;
  logoUrl: string;
};

const escapeHtml = (value: string) => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const displayName = (enquiry: Enquiry) => enquiry.type === 'contact' ? enquiry.name : enquiry.fullName;
const displayService = (enquiry: Enquiry) => enquiry.type === 'contact' ? enquiry.subject : enquiry.service;
const displayLocation = (enquiry: Enquiry) => enquiry.type === 'contact'
  ? 'Not provided'
  : `${enquiry.projectLocation}, ${enquiry.city}`;

const emailShell = (content: string, logoUrl: string, preview: string) => `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${escapeHtml(preview)}</title></head>
<body style="margin:0;padding:0;background:#eeeae2;color:#1c2738;font-family:sans-serif;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preview)}</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background:#eeeae2;"><tr><td align="center" style="padding:40px 16px;">
<table role="presentation" width="640" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:640px;background:#fff;">
<tr><td style="padding:30px 36px;background:#09172d;border-bottom:4px solid #b89a5e;"><img src="${escapeHtml(logoUrl)}" width="180" alt="TH Homes Projects" style="display:block;width:180px;max-width:100%;height:auto;border:0;"></td></tr>
${content}
<tr><td style="padding:32px 44px;background:#09172d;"><p style="margin:0 0 12px;color:#fff;font-size:14px;font-weight:bold;">TH Homes Projects</p><p style="margin:0;color:#c4cedc;font-size:13px;line-height:1.9;">Telephone: <a href="tel:+2348108302395" style="color:#dbc895;text-decoration:none;">0810 830 2395</a><br>WhatsApp: <a href="https://wa.me/2348166338805" style="color:#dbc895;text-decoration:none;">0816 633 8805</a><br>Plot 1004, No. 9 Kofi Annan Street, Asokoro</p></td></tr>
<tr><td style="padding:22px 44px;background:#061122;color:#8f9bad;font-size:11px;line-height:1.65;">This message was generated from the TH Homes Projects website enquiry form.</td></tr>
</table></td></tr></table></body></html>`;

const summaryRow = (label: string, value: string, strong = false) => `<tr><td style="padding:13px 24px;color:#697180;font-size:13px;border-top:1px solid #e2dccf;">${escapeHtml(label)}</td><td align="right" style="padding:13px 24px;color:#09172d;font-size:13px;${strong ? 'font-weight:bold;' : ''}border-top:1px solid #e2dccf;">${escapeHtml(value)}</td></tr>`;

export function customerConfirmationTemplate({ enquiry, reference, logoUrl }: TemplateOptions) {
  const name = displayName(enquiry);
  const service = displayService(enquiry);
  const enquiryDescription = enquiry.type === 'contact' ? 'enquiry' : `${service.toLowerCase()} enquiry`;
  const summaryRows = `${summaryRow('Reference', reference, true)}${summaryRow(enquiry.type === 'contact' ? 'Enquiry type' : 'Service', service)}${enquiry.type === 'consultation' ? summaryRow('Project location', displayLocation(enquiry)) : ''}`;
  const content = `<tr><td style="padding:52px 44px 26px;">
<h1 style="max-width:500px;margin:0 0 22px;color:#09172d;font-family:Georgia,'Times New Roman',serif;font-size:38px;font-weight:normal;line-height:1.14;letter-spacing:-.02em;">We’ve received your enquiry.</h1>
<p style="margin:0 0 18px;color:#3e4858;font-size:16px;line-height:1.75;">Hello ${escapeHtml(name)},</p>
<p style="margin:0 0 18px;color:#3e4858;font-size:16px;line-height:1.75;">Thank you for contacting TH Homes Projects. Your ${escapeHtml(enquiryDescription)} has been received and will be reviewed by our team.</p>
<p style="margin:0;color:#3e4858;font-size:16px;line-height:1.75;">We’ll contact you using the details you provided. This is an automated confirmation from an unmonitored inbox, so please do not reply to this email.</p>
</td></tr><tr><td style="padding:10px 44px 42px;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background:#f7f4ed;border:1px solid #ded7c8;">
<tr><td colspan="2" style="padding:22px 24px 16px;color:#09172d;font-size:14px;font-weight:bold;">Enquiry summary</td></tr>
${summaryRows}
</table></td></tr>`;

  return {
    subject: `We’ve received your enquiry — ${reference}`,
    html: emailShell(content, logoUrl, 'Your enquiry has been received by TH Homes Projects.'),
    text: `Hello ${name},\n\nThank you for contacting TH Homes Projects. We received your ${enquiryDescription}.\n\nReference: ${reference}\n${enquiry.type === 'consultation' ? `Project location: ${displayLocation(enquiry)}\n` : ''}\nOur team will review your enquiry and contact you using the details provided. This is an automated confirmation from an unmonitored inbox, so please do not reply to this email.\n\nTH Homes Projects\nTelephone: 0810 830 2395\nWhatsApp: 0816 633 8805\nPlot 1004, No. 9 Kofi Annan Street, Asokoro`,
  };
}

const detailRow = (label: string, value: string) => `<tr><td valign="top" style="width:34%;padding:12px 18px;color:#697180;font-size:13px;border-top:1px solid #e2dccf;">${escapeHtml(label)}</td><td style="padding:12px 18px;color:#09172d;font-size:13px;line-height:1.6;border-top:1px solid #e2dccf;white-space:pre-wrap;">${escapeHtml(value || 'Not provided')}</td></tr>`;

export function internalNotificationTemplate({ enquiry, reference, logoUrl }: TemplateOptions) {
  const rows = enquiry.type === 'contact'
    ? [
        ['Name', enquiry.name], ['Email', enquiry.email], ['Subject', enquiry.subject], ['Message', enquiry.message],
      ]
    : [
        ['Name', enquiry.fullName], ['Email', enquiry.email], ['Phone', `${enquiry.phoneCountry} ${enquiry.phone}`.trim()],
        ['Service', enquiry.service], ['Country', enquiry.country], ['State / region', enquiry.state], ['City', enquiry.city],
        ['Project location', enquiry.projectLocation], ['Land ownership', enquiry.landOwnership], ['Budget', enquiry.budget],
        ['Expected commencement', enquiry.startDate], ['Project description', enquiry.description],
      ];
  const content = `<tr><td style="padding:46px 44px 22px;"><h1 style="margin:0 0 14px;color:#09172d;font-family:Georgia,'Times New Roman',serif;font-size:34px;font-weight:normal;line-height:1.2;">New ${escapeHtml(enquiry.type)} enquiry</h1><p style="margin:0;color:#566071;font-size:14px;line-height:1.7;">Reference ${escapeHtml(reference)} · Reply directly to contact ${escapeHtml(displayName(enquiry))}.</p></td></tr>
<tr><td style="padding:12px 44px 42px;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background:#f7f4ed;border:1px solid #ded7c8;">${rows.map(([label, value]) => detailRow(label, value)).join('')}</table></td></tr>`;
  const textDetails = rows.map(([label, value]) => `${label}: ${value || 'Not provided'}`).join('\n');

  return {
    subject: `[${reference}] New website enquiry — ${displayService(enquiry)}`,
    html: emailShell(content, logoUrl, `New website enquiry from ${displayName(enquiry)}.`),
    text: `New TH Homes website enquiry\n\nReference: ${reference}\n${textDetails}`,
  };
}
