# TH Homes Website

Corporate website for TH Homes Projects, an architecture, construction and property development company based in Abuja, Nigeria.

## Development

```sh
npm install
npm run dev -- --background
```

The local site is available at `http://localhost:4321`.

Manage the background development server with:

```sh
npx astro dev status
npx astro dev logs
npx astro dev stop
```

## Production build

```sh
npm run build
```

The site uses Astro’s Vercel adapter. Static pages and the `/api/enquiries` serverless function are generated in `.vercel/output/`. Configure the variables from `.env.example` in the Vercel project settings for Production, Preview and Development as appropriate.

## Form email configuration

Copy `.env.example` to `.env` and replace its sample values. For Google SMTP, enable two-step verification on the sending account and use a Google App Password for `SMTP_APP_PASSWORD`; do not use the account password. `MAIL_FROM_ADDRESS` is `no-reply@th-homes.com` and must be configured as an authorized sender for the authenticated Google Workspace account.

The enquiry endpoint sends a full internal notification to `MAIL_TO_ADDRESS` and a branded confirmation to the customer. Keep all SMTP variables server-side and out of variables prefixed with `PUBLIC_`.

## Routes

- `/`
- `/about`
- `/services`
- `/services/architecture-design`
- `/services/construction`
- `/services/property-development`
- `/services/project-management`
- `/projects`
- `/global-presence`
- `/contact`
- `/consultation`
