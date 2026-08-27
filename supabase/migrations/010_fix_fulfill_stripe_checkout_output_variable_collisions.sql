-- Levitaeo: eliminate PL/pgSQL collisions between RETURNS TABLE output names and SQL identifiers.
-- Migration 009 fixed ON CONFLICT (order_id, product_slug), but INSERT target lists such as
-- (order_id, ...) and RETURN QUERY remain ambiguous when order_id is also an output variable.

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
  p_unit_amount integer,
  p_user_id uuid default null,
  p_product_id uuid default null
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

    processed := false;
    already_processed := true;
    order_id := v_order_id;
    entitlement_id := v_entitlement_id;
    return next;
    return;
  end if;

  insert into public.orders (
    user_id,
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
    p_user_id,
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
    user_id = coalesce(excluded.user_id, orders.user_id),
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

  execute '
    insert into public.order_items (
      order_id,
      product_id,
      product_slug,
      product_title,
      product_edition,
      collection,
      stripe_price_id,
      quantity,
      unit_amount,
      currency
    )
    values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    on conflict on constraint order_items_order_product_unique do update
    set
      product_id = coalesce(excluded.product_id, order_items.product_id),
      product_title = excluded.product_title,
      product_edition = excluded.product_edition,
      collection = excluded.collection,
      stripe_price_id = excluded.stripe_price_id,
      quantity = excluded.quantity,
      unit_amount = excluded.unit_amount,
      currency = excluded.currency
    returning id
  '
  into v_order_item_id
  using
    v_order_id,
    p_product_id,
    p_product_slug,
    p_product_title,
    p_product_edition,
    p_collection_name,
    p_stripe_price_id,
    p_quantity,
    p_unit_amount,
    lower(p_currency);

  execute '
    insert into public.entitlements (
      user_id,
      customer_email,
      order_id,
      order_item_id,
      product_id,
      product_slug,
      status
    )
    values ($1, $2, $3, $4, $5, $6, $7::public.entitlement_status)
    on conflict (order_item_id) do update
    set
      user_id = coalesce(excluded.user_id, entitlements.user_id),
      customer_email = coalesce(excluded.customer_email, entitlements.customer_email),
      product_id = coalesce(excluded.product_id, entitlements.product_id),
      product_slug = excluded.product_slug,
      status = case
        when entitlements.status in (''revoked'', ''refunded'') then entitlements.status
        else ''active''::public.entitlement_status
      end,
      updated_at = now()
    returning id
  '
  into v_entitlement_id
  using
    p_user_id,
    v_normalized_email,
    v_order_id,
    v_order_item_id,
    p_product_id,
    p_product_slug,
    'active';

  processed := true;
  already_processed := false;
  order_id := v_order_id;
  entitlement_id := v_entitlement_id;
  return next;
end;
$$;

revoke all on function public.fulfill_stripe_checkout(
  text, text, boolean, timestamptz, jsonb, text, text, text, text, text,
  integer, integer, integer, integer, text, timestamptz, text, text, text,
  text, text, text, integer, integer, uuid, uuid
) from public, anon, authenticated;

grant execute on function public.fulfill_stripe_checkout(
  text, text, boolean, timestamptz, jsonb, text, text, text, text, text,
  integer, integer, integer, integer, text, timestamptz, text, text, text,
  text, text, text, integer, integer, uuid, uuid
) to service_role;
