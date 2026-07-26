# Stripe setup for Levitaeo

This guide covers Stripe Checkout in **test mode** for one-time digital artwork purchases.

## 1. Create or open the Levitaeo Stripe account in test mode

Use the Stripe Dashboard in test mode for all local development.

## 2. Create one Product per sellable Levitaeo edition

Create a Product for each edition you intend to sell, for example:

- Originals No. 01
- Originals No. 02

## 3. Create a one-time EUR Price for each Product

Each Product needs a one-time Price in EUR. Copy the resulting `price_...` ID for each edition.

## 4. Copy each Price ID into `.env.local`

Example:

```bash
STRIPE_PRICE_ORIGINALS_NO_01=price_replace_me
STRIPE_PRICE_ORIGINALS_NO_02=price_replace_me
STRIPE_PRICE_ORIGINALS_NO_03=price_replace_me
```

Only configure Price IDs for editions that are actually available for purchase.

## 5. Add the Stripe secret key to `.env.local`

```bash
STRIPE_SECRET_KEY=sk_test_replace_me
```

`STRIPE_SECRET_KEY` is **server-only** and must never be exposed to the browser or prefixed with `NEXT_PUBLIC_`.

## 6. Set the local site URL

```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

This is used for Stripe success and cancel redirects.

## 7. Install and authenticate the Stripe CLI

Follow Stripe’s CLI installation guide, then log in:

```bash
stripe login
```

## 8. Run local webhook forwarding

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## 9. Copy the webhook signing secret

The CLI prints a `whsec_...` value. Add it to `.env.local`:

```bash
STRIPE_WEBHOOK_SECRET=whsec_replace_me
```

`STRIPE_WEBHOOK_SECRET` comes from Stripe CLI locally, or from Stripe Workbench in production.

## 10. Restart the Next.js development server

Restart `npm run dev` after changing environment variables.

## 11. Test checkout with a Stripe test card

Use:

```text
4242 4242 4242 4242
```

With:

- any future expiry date
- any three-digit CVC
- any postal code

## 12. Production requirements

Before going live, configure:

- live-mode Products and Prices
- live secret key
- production webhook endpoint
- production webhook signing secret
- `NEXT_PUBLIC_SITE_URL=https://levitaeo.com`

Never commit real credentials to git.

## Production webhook events

Register these events in Stripe Workbench for production:

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `checkout.session.async_payment_failed`
- `checkout.session.expired`

Fulfillment should be triggered from **verified webhook data** and persisted in Supabase. The success page confirms payment for the customer, but it must not be treated as the sole source of fulfillment truth.
