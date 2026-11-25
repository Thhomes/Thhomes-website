import { parsePhoneNumberFromString, type CountryCode } from 'libphonenumber-js';

export const enquiryServices = [
  'Architecture & design',
  'Construction',
  'Property development',
  'Project management',
  'Investment & partnerships',
] as const;

export const contactSubjects = [
  'General enquiry',
  'Project enquiry',
  'Partnership',
  'Careers',
  'Press and media',
] as const;

export type ContactEnquiry = {
  type: 'contact';
  name: string;
  email: string;
  subject: (typeof contactSubjects)[number];
  message: string;
};

export type ConsultationEnquiry = {
  type: 'consultation';
  service: (typeof enquiryServices)[number];
  fullName: string;
  email: string;
  phoneCountry: string;
  phone: string;
  country: string;
  state: string;
  city: string;
  projectLocation: string;
  landOwnership: string;
  budget: string;
  startDate: string;
  description: string;
};

export type Enquiry = ContactEnquiry | ConsultationEnquiry;

type ParseResult =
  | { success: true; enquiry: Enquiry }
  | { success: false; message: string };

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const stringValue = (value: unknown, maximum: number) =>
  typeof value === 'string' ? value.trim().slice(0, maximum) : '';

const oneOf = <T extends readonly string[]>(value: unknown, values: T): T[number] | null => {
  const candidate = stringValue(value, 100);
  return values.includes(candidate) ? candidate as T[number] : null;
};

const validEmail = (value: string) => value.length <= 254 && emailPattern.test(value);

export function parseEnquiry(input: unknown): ParseResult {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { success: false, message: 'Submit the form again with valid details.' };
  }

  const data = input as Record<string, unknown>;
  if (stringValue(data.website, 200)) {
    return { success: false, message: 'Unable to process this submission.' };
  }

  const type = stringValue(data.type, 20);
  if (type === 'contact') {
    const name = stringValue(data.name, 120);
    const email = stringValue(data.email, 254).toLowerCase();
    const subject = oneOf(data.subject, contactSubjects);
    const message = stringValue(data.message, 5_000);
    if (name.length < 2 || !validEmail(email) || !subject || message.length < 20) {
      return { success: false, message: 'Check the highlighted details and try again.' };
    }
    return { success: true, enquiry: { type, name, email, subject, message } };
  }

  if (type === 'consultation') {
    const service = oneOf(data.service, enquiryServices);
    const fullName = stringValue(data.fullName, 120);
    const email = stringValue(data.email, 254).toLowerCase();
    const phoneCountry = stringValue(data.phoneCountry, 3).toUpperCase();
    const phone = stringValue(data.phone, 40);
    const country = stringValue(data.country, 3).toUpperCase();
    const state = stringValue(data.state, 120);
    const city = stringValue(data.city, 120);
    const projectLocation = stringValue(data.projectLocation, 240);
    const landOwnership = stringValue(data.landOwnership, 80);
    const budget = stringValue(data.budget, 80);
    const startDate = stringValue(data.startDate, 10);
    const description = stringValue(data.description, 8_000);
    const dateValid = /^\d{4}-\d{2}-\d{2}$/.test(startDate)
      && !Number.isNaN(Date.parse(startDate))
      && startDate >= new Date().toISOString().slice(0, 10);
    const phoneValid = !phone || (/^[A-Z]{2}$/.test(phoneCountry)
      && Boolean(parsePhoneNumberFromString(phone, phoneCountry as CountryCode)?.isValid()));

    if (!service || fullName.length < 2 || !validEmail(email) || !/^[A-Z]{2}$/.test(country)
      || !state || !city || !projectLocation || !landOwnership || !budget || !dateValid
      || !phoneValid || description.length < 40) {
      return { success: false, message: 'Check the highlighted details and try again.' };
    }

    return {
      success: true,
      enquiry: {
        type,
        service,
        fullName,
        email,
        phoneCountry,
        phone,
        country,
        state,
        city,
        projectLocation,
        landOwnership,
        budget,
        startDate,
        description,
      },
    };
  }

  return { success: false, message: 'Unknown enquiry type.' };
}

export function createEnquiryReference(now = new Date()) {
  const date = now.toISOString().slice(0, 10).replaceAll('-', '');
  const suffix = crypto.randomUUID().replaceAll('-', '').slice(0, 6).toUpperCase();
  return `THH-${date}-${suffix}`;
}
