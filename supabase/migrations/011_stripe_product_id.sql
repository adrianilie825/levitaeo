-- Levitaeo: persist Stripe Product ID separately from Price ID.
-- stripe_price_id remains the checkout line-item reference.
-- stripe_product_id is admin-only metadata (not granted to anon/authenticated).

alter table public.products
  add column if not exists stripe_product_id text;

comment on column public.products.stripe_product_id is
  'Stripe Product ID (prod_...) for admin-managed catalog sync. Server-only; not exposed to browser catalog reads.';
