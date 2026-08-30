-- Levitaeo: Editorial catalog hierarchy — Collection → Volume → Edition
--
-- Terminology (application layer):
--   collections  = top-level editorial series (e.g. Skylines, Minimal)
--   volumes      = grouped release within a collection (e.g. East Coast USA)
--   products     = purchasable editions (unchanged table name for minimal migration)
--
-- Purchase / entitlement compatibility:
--   - products.id and products.slug remain the stable edition identifiers
--   - order_items.product_slug, entitlements.product_slug unchanged
--   - Stripe checkout continues to reference products.stripe_price_id by edition slug
--
-- Non-destructive:
--   - Adds public.volumes
--   - Adds products.volume_id (nullable → backfilled → NOT NULL)
--   - Keeps products.collection_id (denormalized; must match volume.collection_id)
--   - Does not rename products or alter order/entitlement tables

-- ---------------------------------------------------------------------------
-- volumes
-- ---------------------------------------------------------------------------

create table public.volumes (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid not null references public.collections (id) on delete restrict,
  slug text not null,
  name text not null,
  description text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  constraint volumes_slug_not_empty check (char_length(trim(slug)) > 0),
  constraint volumes_name_not_empty check (char_length(trim(name)) > 0),
  constraint volumes_collection_slug_unique unique (collection_id, slug)
);

create index volumes_collection_id_idx on public.volumes (collection_id);
create index volumes_sort_order_idx on public.volumes (sort_order);

comment on table public.volumes is
  'Editorial volume within a collection. Each volume groups one or more purchasable editions (products).';

comment on column public.volumes.collection_id is
  'Parent collection. volumes.collection_id defines the collection boundary for slug uniqueness.';

comment on column public.volumes.slug is
  'URL-safe identifier unique within the parent collection (not globally unique).';

-- ---------------------------------------------------------------------------
-- products.volume_id (editions belong to exactly one volume)
-- ---------------------------------------------------------------------------

alter table public.products
  add column if not exists volume_id uuid references public.volumes (id) on delete restrict;

create index if not exists products_volume_id_idx on public.products (volume_id);

comment on column public.products.volume_id is
  'Parent volume for this edition. Required after migration backfill. products.collection_id must match volumes.collection_id.';

comment on table public.products is
  'Purchasable catalog editions. Table name retained for order/entitlement FK compatibility. Each row is one Edition in the editorial hierarchy.';

-- ---------------------------------------------------------------------------
-- Backfill: one default volume per collection, assign all existing editions
-- ---------------------------------------------------------------------------

insert into public.volumes (collection_id, slug, name, description, sort_order)
select
  c.id,
  c.slug || '-default',
  c.name,
  coalesce(nullif(trim(c.description), ''), 'Default volume for ' || c.name),
  c.sort_order
from public.collections c
where not exists (
  select 1
  from public.volumes v
  where v.collection_id = c.id
    and v.slug = c.slug || '-default'
);

update public.products p
set volume_id = v.id
from public.volumes v
inner join public.collections c on c.id = v.collection_id
where p.collection_id = c.id
  and v.slug = c.slug || '-default'
  and p.volume_id is null;

-- Originals seed editions: create a dedicated volume when products share originals-* prefix
insert into public.volumes (collection_id, slug, name, description, sort_order)
select
  c.id,
  'originals-series',
  'Originals Series',
  'Limited digital editions from the Originals collection.',
  1
from public.collections c
where c.slug = 'originals'
  and not exists (
    select 1 from public.volumes v
    where v.collection_id = c.id and v.slug = 'originals-series'
  );

update public.products p
set volume_id = v.id
from public.volumes v
inner join public.collections c on c.id = v.collection_id
where c.slug = 'originals'
  and v.slug = 'originals-series'
  and p.slug like 'originals-%';

alter table public.products
  alter column volume_id set not null;

-- ---------------------------------------------------------------------------
-- Integrity: edition.collection_id must match parent volume.collection_id
-- ---------------------------------------------------------------------------

create or replace function public.enforce_product_volume_collection_match()
returns trigger
language plpgsql
as $$
declare
  volume_collection_id uuid;
begin
  if new.volume_id is null then
    raise exception 'products.volume_id is required';
  end if;

  select v.collection_id
  into volume_collection_id
  from public.volumes v
  where v.id = new.volume_id;

  if volume_collection_id is null then
    raise exception 'volume % does not exist', new.volume_id;
  end if;

  if new.collection_id is distinct from volume_collection_id then
    raise exception 'products.collection_id must match volumes.collection_id for volume %',
      new.volume_id;
  end if;

  return new;
end;
$$;

drop trigger if exists products_volume_collection_match on public.products;

create trigger products_volume_collection_match
before insert or update of collection_id, volume_id on public.products
for each row
execute function public.enforce_product_volume_collection_match();

-- ---------------------------------------------------------------------------
-- RLS: volumes (public read, same pattern as collections)
-- ---------------------------------------------------------------------------

alter table public.volumes enable row level security;

create policy "Public read volumes"
on public.volumes
for select
to anon, authenticated
using (true);

-- ---------------------------------------------------------------------------
-- Admin RLS: volumes (defense in depth; app uses service role)
-- ---------------------------------------------------------------------------

create policy "Admins read all volumes"
on public.volumes
for select
to authenticated
using (public.is_admin());

create policy "Admins insert volumes"
on public.volumes
for insert
to authenticated
with check (public.is_admin());

create policy "Admins update volumes"
on public.volumes
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Column grants: expose volume_id on products + full volumes to browser roles
-- ---------------------------------------------------------------------------

revoke all on table public.volumes from anon, authenticated;

grant select on table public.volumes to anon, authenticated;

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
  created_at
) on table public.products to anon, authenticated;
