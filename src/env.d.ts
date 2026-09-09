/// <reference types="astro/client" />

type RuntimeEnv = {
  DB: D1Database;
  PRODUCTS_BUCKET: R2Bucket;
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  RESEND_API_KEY: string;
  TURNSTILE_SECRET_KEY: string;
  ADMIN_PASSWORD: string;
  PUBLIC_SITE_URL: string;
};

declare namespace App {
  interface Locals { runtime: { env: RuntimeEnv } }
}
