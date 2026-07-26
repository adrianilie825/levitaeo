# Supabase setup for Levitaeo orders and entitlements

This guide connects the verified Stripe webhook to Supabase for persistent orders and provisional digital-art entitlements.

## 1. Create a Supabase project

Create or open your Levitaeo Supabase project.

## 2. Run the migration

Open the Supabase SQL Editor and run:

`supabase/migrations/001_orders_and_entitlements.sql`

This creates:

- `stripe_events`
- `orders`
- `order_items`
- `entitlements`
- transactional RPC functions for fulfillment and status updates
- RLS on all four tables

## 3. Copy project credentials

From Supabase **Project Settings → API**, copy:

1. **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
2. **Publishable / anon key** → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (needed in the next Auth sprint)
3. **Secret / service-role key** → `SUPABASE_SECRET_KEY`

The legacy name `SUPABASE_SERVICE_ROLE_KEY` is also supported if `SUPABASE_SECRET_KEY` is not set.

## 4. Add environment variables locally

Add to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_replace_me
SUPABASE_SECRET_KEY=sb_secret_replace_me
```

Do not commit real credentials.

## 5. Restart the Next.js development server

Environment variables are read at startup.

## 6. Start Stripe webhook forwarding

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copy the generated `whsec_...` value into `STRIPE_WEBHOOK_SECRET`.

## 7. Complete a Stripe test payment

Use test card `4242 4242 4242 4242` with any future expiry, any CVC, and any postal code.

## 8. Verify database rows

Run in the SQL Editor:

```sql
select * from public.stripe_events order by processed_at desc;
select * from public.orders order by created_at desc;
select * from public.order_items order by created_at desc;
select * from public.entitlements order by created_at desc;
```

You should see one event, one paid order, one order item, and one active entitlement.

## 9. Verify idempotency

Replay the same Stripe event from the Stripe CLI or Workbench and confirm no duplicate records are created.

Example duplicate checks:

```sql
select stripe_checkout_session_id, count(*)
from public.orders
group by stripe_checkout_session_id
having count(*) > 1;

select order_item_id, count(*)
from public.entitlements
group by order_item_id
having count(*) > 1;

select id, count(*)
from public.stripe_events
group by id
having count(*) > 1;
```

All three queries should return no rows.

## 11. Authentication

Run the auth migration in the SQL Editor:

`supabase/migrations/002_auth_and_purchase_linking.sql`

This adds:

- `link_customer_purchases_to_user()` for provisional email ownership linking
- RLS read policies for authenticated customers on `orders`, `order_items`, and `entitlements`

### Supabase Dashboard — Auth settings

1. Enable **Email** authentication in Supabase Auth.
2. Decide whether email confirmation is required for your environment.
3. Configure **Site URL** locally:
   `http://localhost:3000`
4. Add local redirect URL:
   `http://localhost:3000/auth/callback`
5. Add production Site URL:
   `https://levitaeo.com`
6. Add production redirect URL:
   `https://levitaeo.com/auth/callback`

The callback URL must preserve Supabase’s PKCE code flow. Do not hardcode email templates in the application; configure them in Supabase Auth.

### Recommended Magic Link email copy

**Subject:** Access your Levitaeo collection

**Body concept:** Use this secure link to access your Levitaeo account and purchased editions.

### Local auth setup

1. Add public Supabase variables to `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_replace_me
   SUPABASE_SECRET_KEY=sb_secret_replace_me
   ```
2. Restart the Next.js development server.
3. Open `/login` and request a Magic Link.
4. Open the link in the same browser.
5. Confirm redirect to `/account`.
6. Confirm auth cookies exist.
7. Confirm prior matching-email entitlements receive `user_id`.
8. Confirm a different authenticated user cannot read those orders or entitlements.

Supabase’s default email service is appropriate only for initial development and testing.

**Production TODO:** Configure custom SMTP before launch. See `docs/auth-launch-checklist.md`.

## 12. Security model

- All four tables have **RLS enabled**.
- Customer read policies on `orders`, `order_items`, and `entitlements` allow authenticated users to read only their own rows (`user_id = auth.uid()`).
- `stripe_events` remains server-only with no browser-facing policies.
- The server secret/service-role key bypasses RLS and must **never** be exposed to the browser.
- Webhook writes use the server-only Supabase admin client.
- Magic Link auth uses the publishable key with RLS on the server SSR client and in the browser.

## 13. Next sprint

The next sprint will add:

- Customer library UI for purchased editions
- Secure artwork file delivery
- Refund webhook handling

## Refund preparation

The schema supports `refunded` and `partially_refunded` order statuses and `revoked` / `refunded` entitlement statuses.

Future webhook events to implement:

- `charge.refunded`
- `refund.created`
- `refund.updated`

Do not revoke entitlements without a verified refund event.

## Production checklist

- Run the migration in production Supabase
- Use production Stripe webhook endpoint
- Store production `STRIPE_WEBHOOK_SECRET`
- Keep `SUPABASE_SECRET_KEY` server-only
- Register Stripe production webhook events:
  - `checkout.session.completed`
  - `checkout.session.async_payment_succeeded`
  - `checkout.session.async_payment_failed`
  - `checkout.session.expired`

Fulfillment must be triggered from verified webhook data persisted in Supabase, not solely from the success page redirect.
