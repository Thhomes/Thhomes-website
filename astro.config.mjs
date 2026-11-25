// @ts-check
import node from '@astrojs/node';
import { defineConfig, envField } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  adapter: node({ mode: 'standalone' }),
  env: {
    schema: {
      SMTP_HOST: envField.string({ context: 'server', access: 'secret', default: 'smtp.gmail.com' }),
      SMTP_PORT: envField.number({ context: 'server', access: 'secret', default: 465 }),
      SMTP_SECURE: envField.boolean({ context: 'server', access: 'secret', default: true }),
      SMTP_USER: envField.string({ context: 'server', access: 'secret', optional: true }),
      SMTP_APP_PASSWORD: envField.string({ context: 'server', access: 'secret', optional: true }),
      MAIL_FROM_NAME: envField.string({ context: 'server', access: 'secret', default: 'TH Homes Projects' }),
      MAIL_FROM_ADDRESS: envField.string({ context: 'server', access: 'secret', optional: true }),
      MAIL_TO_ADDRESS: envField.string({ context: 'server', access: 'secret', optional: true }),
      MAIL_REPLY_TO_ADDRESS: envField.string({ context: 'server', access: 'secret', optional: true }),
      MAIL_ASSET_BASE_URL: envField.string({ context: 'server', access: 'secret', optional: true }),
    },
  },
});
