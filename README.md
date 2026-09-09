# Transfer Chick Clothing

Astro + Tailwind ecommerce storefront for quirky printed t-shirts, designed for Cloudflare Pages, Pages Functions, D1, R2, Stripe Checkout, Resend and Turnstile.

## Included

- Mobile-first home, collection, product, cart and order-confirmation pages.
- Filterable shop by category, size, colour and maximum price.
- Client-side localStorage cart with quantity controls.
- Server-side Stripe Checkout Session creation with D1 stock/price validation.
- Stripe webhook signature verification, order persistence, stock decrementing and Resend confirmation email.
- Order lookup endpoint that verifies the Stripe payment state when the webhook has not finished yet.
- Turnstile verification endpoint for the contact form.
- Simple password-gated admin order view at `/admin`.
- D1 schema + sample seed data.
- R2-ready product image keys; demo SVG artwork is included so the site works before R2 upload.
- GitHub Actions CI and Codespaces configuration.

## Local development

```bash
npm install
cp .env.example .env
npm run dev
```

Astro runs at `http://localhost:4321`.

For a local D1 database:

```bash
npx wrangler d1 create transferchickclothing
# put the returned database id in wrangler.toml
npm run db:migrate
npm run db:seed
```

The storefront deliberately falls back to the same sample catalog when no D1 binding/data is available, which makes visual work fast in Codespaces.

## Stripe test mode

Use Stripe test-mode credentials in `.env` for local work. The checkout endpoint creates inline `price_data` for variants whose D1 `stripe_price_id` is blank. That means the initial seed needs no Stripe catalog sync. Once you create Stripe Prices for production, store their IDs in `variants.stripe_price_id` and the same endpoint will use them.

For local webhook development, run a Stripe listener that forwards to:

```text
http://localhost:4321/api/webhooks/stripe
```

The webhook must have the `checkout.session.completed` event enabled.

## Resend

Set `RESEND_API_KEY` and replace the example sender address in `src/pages/api/webhooks/stripe.ts` with a sender on your verified domain. Do the same for the contact recipient and sender in `src/pages/api/contact.ts`.

## Turnstile

Create a Turnstile widget for your production hostname. Add its public site key to the contact page and keep `TURNSTILE_SECRET_KEY` server-side. The current page has an obvious placeholder block so the integration boundary is clear before final branding/domain configuration.

## Cloudflare Pages

1. Push this repository to GitHub and create a Cloudflare Pages project connected to `DanOrm94/transferchickclothing`.
2. Use the Astro build command `npm run build` and output directory `dist`.
3. Create a D1 database and update `wrangler.toml` with the database ID. Create the binding as `DB`.
4. Create an R2 bucket named `transferchickclothing-products` and bind it as `PRODUCTS_BUCKET`.
5. Apply the migration to the remote database: `npx wrangler d1 migrations apply DB --remote` and then seed with `npx wrangler d1 execute DB --remote --file=./scripts/seed.sql` when ready.
6. Add Pages project secrets: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `RESEND_API_KEY`, `TURNSTILE_SECRET_KEY`, `ADMIN_PASSWORD`.
7. Add `PUBLIC_SITE_URL` as an environment variable using the production Pages/custom-domain URL.
8. Upload production product images to R2 using the `product_images.r2_key` values and update the image URL helper when you expose the bucket behind your chosen image-resizing/domain route.
9. In Stripe Dashboard, register `https://YOUR_DOMAIN/api/webhooks/stripe` and subscribe to `checkout.session.completed`.
10. Keep test keys/webhook endpoint in Stripe test mode until checkout, webhook, email and stock decrementing have all been exercised end-to-end.

Cloudflare Pages deployments are connected to GitHub by the Pages project; the repository's GitHub Actions workflow also runs `npm run check` and `npm run build` on pushes to `main` and pull requests.

## R2 image delivery

The code stores immutable R2 keys in D1. For production, put Cloudflare's image transformation/resizing layer or a dedicated image proxy in front of R2 and change the `ProductCard`/product-page URL helper to point to that public path. Do not expose private bucket credentials to the browser.

## Admin-lite

`/admin` is intentionally small: a cookie-backed password gate plus a D1 order table. The v1 surface is intended for order visibility rather than a full CMS. Product changes can initially be made through D1/seed scripts. Before production, consider replacing the shared password with Cloudflare Access or another stronger operator authentication layer.

## Important pre-launch edits

Replace the example email addresses/domains, final legal copy on `/privacy`, `/terms` and `/shipping-returns`, production Turnstile site-key wiring, and the placeholder D1/R2 IDs. Add your actual product artwork to R2 and verify that every active variant has valid stock and pricing.
