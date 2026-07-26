-- Levitaeo Sprint 6: Admin catalog policies
-- Do not modify 003_product_catalog.sql.
--
-- Run manually in Supabase SQL Editor after creating admin users.
-- Populate public.admin_users with auth.users.id values for approved admins.
--
-- Application layer also enforces ADMIN_EMAILS via requireAdmin().
-- These policies add database-level defense in depth for authenticated admins.

-- ---------------------------------------------------------------------------
-- admin_users
-- ---------------------------------------------------------------------------

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

-- ---------------------------------------------------------------------------
-- is_admin()
-- ---------------------------------------------------------------------------

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- ---------------------------------------------------------------------------
-- admin_users policies
-- ---------------------------------------------------------------------------

create policy "Admins can read admin_users"
on public.admin_users
for select
to authenticated
using (public.is_admin());

-- No insert/update/delete policies for browser clients on admin_users.
-- Seed admin rows via service role or SQL editor.

-- ---------------------------------------------------------------------------
-- products policies (no DELETE)
-- ---------------------------------------------------------------------------

create policy "Admins read all products"
on public.products
for select
to authenticated
using (public.is_admin());

create policy "Admins insert products"
on public.products
for insert
to authenticated
with check (public.is_admin());

create policy "Admins update products"
on public.products
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- collections policies (no DELETE, no INSERT in this sprint)
-- ---------------------------------------------------------------------------

create policy "Admins update collections"
on public.collections
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Existing public read policies from 003 remain unchanged.
-- No destructive delete policies are added.

comment on table public.admin_users is
  'Approved Supabase Auth user IDs allowed to write catalog data when RLS policies are active.';

comment on function public.is_admin() is
  'Returns true when auth.uid() exists in public.admin_users. Used by catalog admin RLS policies.';
