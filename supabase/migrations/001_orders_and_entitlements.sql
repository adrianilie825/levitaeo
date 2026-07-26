-- Levitaeo: Stripe orders, order items, entitlements, and webhook idempotency.
-- Safe to run in the Supabase SQL Editor.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

create type public.order_status as enum (
  'pending',
  'paid',
  'failed',
  'expired',
  'refunded',
  'partially_refunded'
);

create type public.entitlement_status as enum (
  'active',
  'revoked',
  'refunded'
);

-- ---------------------------------------------------------------------------
-- stripe_events
-- ---------------------------------------------------------------------------

create table public.stripe_events (
  id text primary key,
  event_type text not null,
  livemode boolean not null default false,
  stripe_created_at timestamptz,
  processed_at timestamptz not null default now(),
  payload jsonb,
  processing_error text
);

create index stripe_events_event_type_idx on public.stripe_events (event_type);
create index stripe_events_processed_at_idx on public.stripe_events (processed_at desc);

alter table public.stripe_events enable row level security;

-- ---------------------------------------------------------------------------
-- orders
-- ---------------------------------------------------------------------------

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  stripe_checkout_session_id text not null unique,
  stripe_payment_intent_id text unique,
  stripe_customer_id text,
  customer_email text,
  status public.order_status not null default 'pending',
  currency text not null,
  amount_subtotal integer not null default 0,
  amount_total integer not null default 0,
  amount_discount integer not null default 0,
  amount_tax integer not null default 0,
  payment_status text,
  purchase_type text not null default 'digital-artwork',
  livemode boolean not null default false,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint orders_amount_subtotal_non_negative check (amount_subtotal >= 0),
  constraint orders_amount_total_non_negative check (amount_total >= 0),
  constraint orders_amount_discount_non_negative check (amount_discount >= 0),
  constraint orders_amount_tax_non_negative check (amount_tax >= 0),
  constraint orders_currency_lowercase check (currency = lower(currency)),
  constraint orders_purchase_type_not_empty check (char_length(trim(purchase_type)) > 0)
);

create index orders_customer_email_idx on public.orders (customer_email);
create index orders_user_id_idx on public.orders (user_id);
create index orders_status_idx on public.orders (status);
create index orders_created_at_idx on public.orders (created_at desc);

alter table public.orders enable row level security;

-- ---------------------------------------------------------------------------
-- order_items
-- ---------------------------------------------------------------------------

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_slug text not null,
  product_title text not null,
  product_edition text,
  collection text,
  stripe_price_id text,
  quantity integer not null default 1,
  unit_amount integer not null default 0,
  currency text not null,
  created_at timestamptz not null default now(),
  constraint order_items_quantity_positive check (quantity > 0),
  constraint order_items_unit_amount_non_negative check (unit_amount >= 0),
  constraint order_items_product_slug_not_empty check (char_length(trim(product_slug)) > 0),
  constraint order_items_currency_lowercase check (currency = lower(currency)),
  constraint order_items_order_product_unique unique (order_id, product_slug)
);

create index order_items_order_id_idx on public.order_items (order_id);
create index order_items_product_slug_idx on public.order_items (product_slug);

alter table public.order_items enable row level security;

-- ---------------------------------------------------------------------------
-- entitlements
-- ---------------------------------------------------------------------------

create table public.entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  customer_email text,
  order_id uuid not null references public.orders (id) on delete cascade,
  order_item_id uuid not null references public.order_items (id) on delete cascade,
  product_slug text not null,
  status public.entitlement_status not null default 'active',
  granted_at timestamptz not null default now(),
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint entitlements_owner_present check (
    user_id is not null or customer_email is not null
  ),
  constraint entitlements_order_item_unique unique (order_item_id)
);

create index entitlements_user_id_idx on public.entitlements (user_id);
create index entitlements_customer_email_idx on public.entitlements (customer_email);
create index entitlements_product_slug_idx on public.entitlements (product_slug);
create index entitlements_status_idx on public.entitlements (status);

alter table public.entitlements enable row level security;

-- ---------------------------------------------------------------------------
-- updated_at trigger
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger orders_set_updated_at
before update on public.orders
for each row
execute function public.set_updated_at();

create trigger entitlements_set_updated_at
before update on public.entitlements
for each row
execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- fulfill_stripe_checkout
-- Atomically claims a Stripe event and fulfills a paid digital-art purchase.
-- ---------------------------------------------------------------------------

create or replace function public.fulfill_stripe_checkout(
  p_stripe_event_id text,
  p_event_type text,
  p_livemode boolean,
  p_stripe_created_at timestamptz,
  p_sanitized_event_payload jsonb,
  p_stripe_checkout_session_id text,
  p_stripe_payment_intent_id text,
  p_stripe_customer_id text,
  p_customer_email text,
  p_currency text,
  p_amount_subtotal integer,
  p_amount_total integer,
  p_amount_discount integer,
  p_amount_tax integer,
  p_payment_status text,
  p_paid_at timestamptz,
  p_purchase_type text,
  p_product_slug text,
  p_product_title text,
  p_product_edition text,
  p_collection_name text,
  p_stripe_price_id text,
  p_quantity integer,
  p_unit_amount integer
)
returns table (
  processed boolean,
  already_processed boolean,
  order_id uuid,
  entitlement_id uuid
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_claimed_event_id text;
  v_order_id uuid;
  v_order_item_id uuid;
  v_entitlement_id uuid;
  v_normalized_email text;
begin
  v_normalized_email := nullif(lower(trim(coalesce(p_customer_email, ''))), '');

  insert into public.stripe_events (
    id,
    event_type,
    livemode,
    stripe_created_at,
    payload
  )
  values (
    p_stripe_event_id,
    p_event_type,
    p_livemode,
    p_stripe_created_at,
    p_sanitized_event_payload
  )
  on conflict (id) do nothing
  returning id into v_claimed_event_id;

  if v_claimed_event_id is null then
    select o.id
    into v_order_id
    from public.orders o
    where o.stripe_checkout_session_id = p_stripe_checkout_session_id;

    if v_order_id is not null then
      select e.id
      into v_entitlement_id
      from public.entitlements e
      join public.order_items oi on oi.id = e.order_item_id
      where oi.order_id = v_order_id
        and oi.product_slug = p_product_slug
      limit 1;
    end if;

    return query
    select false, true, v_order_id, v_entitlement_id;
    return;
  end if;

  insert into public.orders (
    stripe_checkout_session_id,
    stripe_payment_intent_id,
    stripe_customer_id,
    customer_email,
    status,
    currency,
    amount_subtotal,
    amount_total,
    amount_discount,
    amount_tax,
    payment_status,
    purchase_type,
    livemode,
    paid_at
  )
  values (
    p_stripe_checkout_session_id,
    p_stripe_payment_intent_id,
    p_stripe_customer_id,
    v_normalized_email,
    'paid',
    lower(p_currency),
    p_amount_subtotal,
    p_amount_total,
    p_amount_discount,
    p_amount_tax,
    p_payment_status,
    p_purchase_type,
    p_livemode,
    p_paid_at
  )
  on conflict (stripe_checkout_session_id) do update
  set
    stripe_payment_intent_id = coalesce(excluded.stripe_payment_intent_id, orders.stripe_payment_intent_id),
    stripe_customer_id = coalesce(excluded.stripe_customer_id, orders.stripe_customer_id),
    customer_email = coalesce(excluded.customer_email, orders.customer_email),
    status = 'paid',
    currency = excluded.currency,
    amount_subtotal = excluded.amount_subtotal,
    amount_total = excluded.amount_total,
    amount_discount = excluded.amount_discount,
    amount_tax = excluded.amount_tax,
    payment_status = excluded.payment_status,
    purchase_type = excluded.purchase_type,
    livemode = excluded.livemode,
    paid_at = coalesce(excluded.paid_at, orders.paid_at),
    updated_at = now()
  returning id into v_order_id;

  insert into public.order_items (
    order_id,
    product_slug,
    product_title,
    product_edition,
    collection,
    stripe_price_id,
    quantity,
    unit_amount,
    currency
  )
  values (
    v_order_id,
    p_product_slug,
    p_product_title,
    p_product_edition,
    p_collection_name,
    p_stripe_price_id,
    p_quantity,
    p_unit_amount,
    lower(p_currency)
  )
  on conflict (order_id, product_slug) do update
  set
    product_title = excluded.product_title,
    product_edition = excluded.product_edition,
    collection = excluded.collection,
    stripe_price_id = excluded.stripe_price_id,
    quantity = excluded.quantity,
    unit_amount = excluded.unit_amount,
    currency = excluded.currency
  returning id into v_order_item_id;

  insert into public.entitlements (
    customer_email,
    order_id,
    order_item_id,
    product_slug,
    status
  )
  values (
    v_normalized_email,
    v_order_id,
    v_order_item_id,
    p_product_slug,
    'active'
  )
  on conflict (order_item_id) do update
  set
    customer_email = coalesce(excluded.customer_email, entitlements.customer_email),
    product_slug = excluded.product_slug,
    status = case
      when entitlements.status in ('revoked', 'refunded') then entitlements.status
      else 'active'
    end,
    updated_at = now()
  returning id into v_entitlement_id;

  return query
  select true, false, v_order_id, v_entitlement_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- record_stripe_checkout_status
-- Claims a Stripe event and records pending, failed, or expired checkout state.
-- Never downgrades a paid order or creates entitlements.
-- ---------------------------------------------------------------------------

create or replace function public.record_stripe_checkout_status(
  p_stripe_event_id text,
  p_event_type text,
  p_livemode boolean,
  p_stripe_created_at timestamptz,
  p_sanitized_event_payload jsonb,
  p_stripe_checkout_session_id text,
  p_stripe_payment_intent_id text,
  p_stripe_customer_id text,
  p_customer_email text,
  p_currency text,
  p_amount_subtotal integer,
  p_amount_total integer,
  p_amount_discount integer,
  p_amount_tax integer,
  p_payment_status text,
  p_purchase_type text,
  p_order_status public.order_status,
  p_product_slug text,
  p_product_title text,
  p_product_edition text,
  p_collection_name text,
  p_stripe_price_id text,
  p_quantity integer,
  p_unit_amount integer
)
returns table (
  processed boolean,
  already_processed boolean,
  order_id uuid
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_claimed_event_id text;
  v_order_id uuid;
  v_existing_status public.order_status;
  v_normalized_email text;
begin
  if p_order_status not in ('pending', 'failed', 'expired') then
    raise exception 'Unsupported order status for record_stripe_checkout_status: %', p_order_status;
  end if;

  v_normalized_email := nullif(lower(trim(coalesce(p_customer_email, ''))), '');

  insert into public.stripe_events (
    id,
    event_type,
    livemode,
    stripe_created_at,
    payload
  )
  values (
    p_stripe_event_id,
    p_event_type,
    p_livemode,
    p_stripe_created_at,
    p_sanitized_event_payload
  )
  on conflict (id) do nothing
  returning id into v_claimed_event_id;

  if v_claimed_event_id is null then
    select o.id
    into v_order_id
    from public.orders o
    where o.stripe_checkout_session_id = p_stripe_checkout_session_id;

    return query
    select false, true, v_order_id;
    return;
  end if;

  select o.id, o.status
  into v_order_id, v_existing_status
  from public.orders o
  where o.stripe_checkout_session_id = p_stripe_checkout_session_id;

  if v_order_id is null then
    insert into public.orders (
      stripe_checkout_session_id,
      stripe_payment_intent_id,
      stripe_customer_id,
      customer_email,
      status,
      currency,
      amount_subtotal,
      amount_total,
      amount_discount,
      amount_tax,
      payment_status,
      purchase_type,
      livemode
    )
    values (
      p_stripe_checkout_session_id,
      p_stripe_payment_intent_id,
      p_stripe_customer_id,
      v_normalized_email,
      p_order_status,
      lower(p_currency),
      p_amount_subtotal,
      p_amount_total,
      p_amount_discount,
      p_amount_tax,
      p_payment_status,
      p_purchase_type,
      p_livemode
    )
    returning id into v_order_id;
  elsif v_existing_status in ('paid', 'refunded', 'partially_refunded') then
    null;
  else
    update public.orders
    set
      stripe_payment_intent_id = coalesce(p_stripe_payment_intent_id, stripe_payment_intent_id),
      stripe_customer_id = coalesce(p_stripe_customer_id, stripe_customer_id),
      customer_email = coalesce(v_normalized_email, customer_email),
      status = p_order_status,
      currency = lower(p_currency),
      amount_subtotal = p_amount_subtotal,
      amount_total = p_amount_total,
      amount_discount = p_amount_discount,
      amount_tax = p_amount_tax,
      payment_status = p_payment_status,
      purchase_type = p_purchase_type,
      livemode = p_livemode,
      updated_at = now()
    where id = v_order_id;
  end if;

  if p_product_slug is not null and char_length(trim(p_product_slug)) > 0 then
    insert into public.order_items (
      order_id,
      product_slug,
      product_title,
      product_edition,
      collection,
      stripe_price_id,
      quantity,
      unit_amount,
      currency
    )
    values (
      v_order_id,
      p_product_slug,
      p_product_title,
      p_product_edition,
      p_collection_name,
      p_stripe_price_id,
      p_quantity,
      p_unit_amount,
      lower(p_currency)
    )
    on conflict (order_id, product_slug) do update
    set
      product_title = excluded.product_title,
      product_edition = excluded.product_edition,
      collection = excluded.collection,
      stripe_price_id = excluded.stripe_price_id,
      quantity = excluded.quantity,
      unit_amount = excluded.unit_amount,
      currency = excluded.currency;
  end if;

  return query
  select true, false, v_order_id;
end;
$$;

revoke all on function public.fulfill_stripe_checkout(
  text, text, boolean, timestamptz, jsonb, text, text, text, text, text,
  integer, integer, integer, integer, text, timestamptz, text, text, text,
  text, text, text, integer, integer
) from public, anon, authenticated;

revoke all on function public.record_stripe_checkout_status(
  text, text, boolean, timestamptz, jsonb, text, text, text, text, text,
  integer, integer, integer, integer, text, text, public.order_status, text,
  text, text, text, text, integer, integer
) from public, anon, authenticated;

grant execute on function public.fulfill_stripe_checkout(
  text, text, boolean, timestamptz, jsonb, text, text, text, text, text,
  integer, integer, integer, integer, text, timestamptz, text, text, text,
  text, text, text, integer, integer
) to service_role;

grant execute on function public.record_stripe_checkout_status(
  text, text, boolean, timestamptz, jsonb, text, text, text, text, text,
  integer, integer, integer, integer, text, text, public.order_status, text,
  text, text, text, text, integer, integer
) to service_role;
