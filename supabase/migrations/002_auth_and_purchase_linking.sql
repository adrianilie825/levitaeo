-- Levitaeo: Auth purchase linking and customer read policies.

-- ---------------------------------------------------------------------------
-- link_customer_purchases_to_user
-- Trust boundary: only trusted server code may call this with a verified
-- Supabase Auth user ID and that user's verified email address.
-- Browser clients must never supply arbitrary email ownership claims.
-- ---------------------------------------------------------------------------

create or replace function public.link_customer_purchases_to_user(
  p_user_id uuid,
  p_customer_email text
)
returns table (
  orders_linked integer,
  entitlements_linked integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_normalized_email text;
  v_orders_linked integer := 0;
  v_entitlements_linked integer := 0;
begin
  if p_user_id is null then
    raise exception 'User ID is required.';
  end if;

  v_normalized_email := lower(trim(coalesce(p_customer_email, '')));

  if v_normalized_email = '' then
    raise exception 'Customer email is required.';
  end if;

  update public.orders
  set
    user_id = p_user_id,
    updated_at = now()
  where user_id is null
    and lower(customer_email) = v_normalized_email;

  get diagnostics v_orders_linked = row_count;

  update public.entitlements
  set
    user_id = p_user_id,
    updated_at = now()
  where user_id is null
    and lower(customer_email) = v_normalized_email;

  get diagnostics v_entitlements_linked = row_count;

  return query
  select v_orders_linked, v_entitlements_linked;
end;
$$;

revoke all on function public.link_customer_purchases_to_user(uuid, text)
  from public, anon, authenticated;

grant execute on function public.link_customer_purchases_to_user(uuid, text)
  to service_role;

-- ---------------------------------------------------------------------------
-- Customer read policies (RLS)
-- ---------------------------------------------------------------------------

create policy "Customers can read own entitlements"
on public.entitlements
for select
to authenticated
using (user_id = auth.uid());

create policy "Customers can read own orders"
on public.orders
for select
to authenticated
using (user_id = auth.uid());

create policy "Customers can read own order items"
on public.order_items
for select
to authenticated
using (
  exists (
    select 1
    from public.orders o
    where o.id = order_items.order_id
      and o.user_id = auth.uid()
  )
);

-- stripe_events remains server-only with no browser-facing policies.
