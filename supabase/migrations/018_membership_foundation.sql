-- Levitaeo: Membership Phase 1 database foundation
-- Safe to run in the Supabase SQL Editor after migration 017.
--
-- Adds:
--   - products.membership_eligible (default false)
--   - user_billing (stable Supabase user ↔ Stripe Customer mapping)
--   - membership_subscriptions (Stripe subscription state per user)
--
-- Does NOT modify orders, order_items, entitlements, product_download_files,
-- or any purchase fulfillment RPCs. One-time edition purchases are unchanged.

-- ---------------------------------------------------------------------------
-- membership_subscription_status
-- Values align with Stripe Subscription.status for webhook sync.
-- Expired access is derived from status + current_period_end (no extra enum).
-- ---------------------------------------------------------------------------

create type public.membership_subscription_status as enum (
  'trialing',
  'active',
  'past_due',
  'canceled',
  'unpaid',
  'incomplete',
  'incomplete_expired',
  'paused'
);

-- ---------------------------------------------------------------------------
-- products.membership_eligible
-- ---------------------------------------------------------------------------

alter table public.products
  add column if not exists membership_eligible boolean not null default false;

comment on column public.products.membership_eligible is
  'When true, an active Levitaeo Membership grants download access while subscribed. Individual purchase entitlements remain separate and permanent. Originals and limited editions should stay false unless explicitly enabled.';

-- ---------------------------------------------------------------------------
-- user_billing
-- Stable Supabase user ↔ Stripe Customer relationship.
-- Created on first Stripe interaction; reused for membership, portal, and checkout.
-- ---------------------------------------------------------------------------

create table public.user_billing (
  user_id uuid primary key references auth.users (id) on delete cascade,
  stripe_customer_id text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_billing_stripe_customer_id_unique unique (stripe_customer_id),
  constraint user_billing_stripe_customer_id_not_empty check (
    char_length(trim(stripe_customer_id)) > 0
  )
);

comment on table public.user_billing is
  'Maps each Supabase user to one Stripe Customer. Browser clients may read their own row only. All writes use service-role code.';

create trigger user_billing_set_updated_at
before update on public.user_billing
for each row
execute function public.set_updated_at();

alter table public.user_billing enable row level security;

create policy "Users can read own billing record"
on public.user_billing
for select
to authenticated
using (user_id = auth.uid());

revoke all on table public.user_billing from anon, authenticated;

grant select on table public.user_billing to authenticated;

-- No INSERT, UPDATE, or DELETE grants for browser roles.

-- ---------------------------------------------------------------------------
-- membership_subscriptions
-- One row per Supabase user; updated by server-side Stripe webhook code.
-- stripe_price_id identifies the commercial plan (e.g. founding vs standard).
-- Stripe Customer is resolved via user_billing, not duplicated here.
-- ---------------------------------------------------------------------------

create table public.membership_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  stripe_subscription_id text not null,
  stripe_price_id text not null,
  status public.membership_subscription_status not null,
  current_period_start timestamptz not null,
  current_period_end timestamptz not null,
  cancel_at_period_end boolean not null default false,
  canceled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint membership_subscriptions_user_id_unique unique (user_id),
  constraint membership_subscriptions_stripe_subscription_id_unique unique (stripe_subscription_id),
  constraint membership_subscriptions_stripe_subscription_id_not_empty check (
    char_length(trim(stripe_subscription_id)) > 0
  ),
  constraint membership_subscriptions_stripe_price_id_not_empty check (
    char_length(trim(stripe_price_id)) > 0
  ),
  constraint membership_subscriptions_period_order check (
    current_period_end >= current_period_start
  )
);

create index membership_subscriptions_status_idx
  on public.membership_subscriptions (status);

create index membership_subscriptions_current_period_end_idx
  on public.membership_subscriptions (current_period_end desc);

comment on table public.membership_subscriptions is
  'Levitaeo Membership subscription state synced from Stripe. Browser clients may read their own row only. All writes use service-role webhook/admin code. Does not create purchase entitlements. Resolve Stripe Customer via user_billing.';

create trigger membership_subscriptions_set_updated_at
before update on public.membership_subscriptions
for each row
execute function public.set_updated_at();

alter table public.membership_subscriptions enable row level security;

-- ---------------------------------------------------------------------------
-- membership_subscriptions RLS
-- ---------------------------------------------------------------------------

create policy "Users can read own membership subscription"
on public.membership_subscriptions
for select
to authenticated
using (user_id = auth.uid());

revoke all on table public.membership_subscriptions from anon, authenticated;

grant select on table public.membership_subscriptions to authenticated;

-- No INSERT, UPDATE, or DELETE grants for browser roles.
-- service_role bypasses RLS and maintains subscription state via webhooks.

-- ---------------------------------------------------------------------------
-- Extend public product column grants (see 006, 012, 017)
-- ---------------------------------------------------------------------------

revoke all on table public.products from anon, authenticated;

grant select (
  id,
  collection_id,
  volume_id,
  slug,
  title,
  subtitle,
  description,
  price_cents,
  currency,
  image_url,
  thumbnail_url,
  edition,
  resolution,
  file_type,
  status,
  is_featured,
  stripe_price_id,
  sort_order,
  seo_title,
  seo_description,
  preview_alt_text,
  membership_eligible,
  created_at
) on table public.products to anon, authenticated;

comment on table public.products is
  'Catalog products. Browser roles may SELECT public catalog columns only. Private delivery metadata and all writes use server-only service-role code after admin or entitlement checks.';
