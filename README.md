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
node dist/server/entry.mjs
```

Static pages and the server endpoint are generated in `dist/`. Production hosting must run the generated Node server so `/api/enquiries` can deliver form submissions.

## Form email configuration

Copy `.env.example` to `.env` and replace its sample values. For Google SMTP, enable two-step verification on the sending account and use a Google App Password for `SMTP_APP_PASSWORD`; do not use the account password. `MAIL_FROM_ADDRESS` should be the authenticated Google account or an address it is authorized to send as.

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
