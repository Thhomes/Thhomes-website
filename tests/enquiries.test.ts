import assert from 'node:assert/strict';
import test from 'node:test';
import { customerConfirmationTemplate } from '../src/lib/email-templates.ts';
import { createEnquiryReference, parseEnquiry } from '../src/lib/enquiries.ts';

test('parses a valid contact enquiry', () => {
  const result = parseEnquiry({
    type: 'contact',
    name: 'Ada Okafor',
    email: 'ADA@example.com',
    subject: 'Project enquiry',
    message: 'I would like to discuss a residential project in Abuja.',
    website: '',
  });

  assert.equal(result.success, true);
  if (result.success) assert.equal(result.enquiry.email, 'ada@example.com');
});

test('rejects a honeypot submission', () => {
  const result = parseEnquiry({
    type: 'contact',
    name: 'Automated Sender',
    email: 'bot@example.com',
    subject: 'General enquiry',
    message: 'This otherwise looks like a sufficiently long valid message.',
    website: 'https://spam.example.com',
  });

  assert.equal(result.success, false);
});

test('parses a valid consultation enquiry', () => {
  const result = parseEnquiry({
    type: 'consultation',
    service: 'Architecture & design',
    fullName: 'Ada Okafor',
    email: 'ada@example.com',
    phoneCountry: 'NG',
    phone: '08108302395',
    country: 'NG',
    state: 'FC',
    city: 'Abuja',
    projectLocation: 'Asokoro',
    landOwnership: 'Yes, land secured',
    budget: '₦250–500 million',
    startDate: '2027-02-01',
    description: 'A considered residential development with a clear landscape and interior brief.',
    website: '',
  });

  assert.equal(result.success, true);
});

test('creates a non-identifying enquiry reference', () => {
  const reference = createEnquiryReference(new Date('2026-11-25T10:00:00.000Z'));
  assert.match(reference, /^THH-20261125-[A-F0-9]{6}$/);
});

test('escapes submitted content in the HTML email', () => {
  const result = parseEnquiry({
    type: 'contact',
    name: '<script>alert(1)</script>',
    email: 'ada@example.com',
    subject: 'General enquiry',
    message: 'I would like to ask a sufficiently detailed general question.',
    website: '',
  });
  assert.equal(result.success, true);
  if (!result.success) return;

  const email = customerConfirmationTemplate({
    enquiry: result.enquiry,
    reference: 'THH-20261125-ABC123',
    logoUrl: 'https://example.com/logo.png',
  });
  assert.doesNotMatch(email.html, /<script>/);
  assert.match(email.html, /&lt;script&gt;/);
  assert.match(email.html, /please do not reply to this email/i);
  assert.match(email.text, /please do not reply to this email/i);
});
