-- Levitaeo Sprint 5.5: Product catalog migration
-- collections + products with public read RLS
--
-- Non-destructive:
-- - Creates new catalog tables only.
-- - Adds nullable product_id columns to existing order tables (001 migration).
-- - Does not modify or drop existing orders, order_items, or entitlements rows.
--
-- Monetary units:
-- - products.price_cents stores minor currency units (Stripe-compatible), e.g. 2900 = EUR 29.00
-- - order_items.unit_amount (001) already stores Stripe minor units
--
-- Product identity for orders:
-- - order_items.product_slug and entitlements.product_slug remain the durable join keys
--   for historical rows and webhook fulfillment (001 RPC functions).
-- - order_items.product_id and entitlements.product_id are optional nullable FKs for
--   new catalog linkage; existing slug-based joins continue to work when product_id is null.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- collections
-- ---------------------------------------------------------------------------

create table public.collections (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  constraint collections_slug_not_empty check (char_length(trim(slug)) > 0),
  constraint collections_name_not_empty check (char_length(trim(name)) > 0)
);

-- slug is already indexed via UNIQUE; only add non-redundant indexes
create index collections_sort_order_idx on public.collections (sort_order);

alter table public.collections enable row level security;

create policy "Public read collections"
on public.collections
for select
to anon, authenticated
using (true);

-- ---------------------------------------------------------------------------
-- products
-- ---------------------------------------------------------------------------

create table public.products (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid not null references public.collections (id) on delete restrict,
  slug text not null unique,
  title text not null,
  subtitle text not null default '',
  description text not null default '',
  price_cents integer not null default 0,
  currency text not null default 'EUR',
  image_url text not null default '',
  thumbnail_url text not null default '',
  edition text not null default '',
  resolution text not null default '',
  file_type text not null default '',
  status text not null default 'published',
  is_featured boolean not null default false,
  stripe_price_id text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  constraint products_slug_not_empty check (char_length(trim(slug)) > 0),
  constraint products_title_not_empty check (char_length(trim(title)) > 0),
  constraint products_price_cents_non_negative check (price_cents >= 0),
  constraint products_status_allowed check (
    status in ('published', 'coming_soon', 'draft', 'archived')
  )
);

-- slug is already indexed via UNIQUE
create index products_status_idx on public.products (status);
create index products_collection_id_idx on public.products (collection_id);
create index products_sort_order_idx on public.products (sort_order);

alter table public.products enable row level security;

-- RLS decision (documented):
-- Levitaeo product pages for coming-soon editions remain publicly browsable
-- (see generateStaticParams / product routes). Anonymous users may therefore
-- SELECT both published and coming_soon catalog rows. Checkout and webhook
-- fulfillment still restrict purchases to published/downloadable products in
-- application code. Draft/archived rows are never public.
create policy "Public read browsable catalog products"
on public.products
for select
to anon, authenticated
using (status in ('published', 'coming_soon'));

-- No insert/update/delete policies for browser clients.

-- ---------------------------------------------------------------------------
-- Optional catalog FK on existing order tables (001)
-- Preserves product_slug as the authoritative key for legacy and webhook data.
-- ---------------------------------------------------------------------------

alter table public.order_items
  add column if not exists product_id uuid references public.products (id) on delete set null;

alter table public.entitlements
  add column if not exists product_id uuid references public.products (id) on delete set null;

create index if not exists order_items_product_id_idx on public.order_items (product_id);
create index if not exists entitlements_product_id_idx on public.entitlements (product_id);

comment on column public.order_items.product_slug is
  'Stable product identifier persisted at purchase time. Primary join key for historical orders and webhook RPC fulfillment.';

comment on column public.order_items.product_id is
  'Optional FK to public.products. Nullable for orders created before catalog migration or when slug mapping is sufficient.';

comment on column public.entitlements.product_slug is
  'Stable product identifier for entitlement ownership. Join to products.slug for catalog metadata.';

comment on column public.entitlements.product_id is
  'Optional FK to public.products. Nullable; product_slug remains authoritative for existing entitlements.';

-- ---------------------------------------------------------------------------
-- Seed collections (from lib/collections.ts)
-- ---------------------------------------------------------------------------

insert into public.collections (slug, name, description, sort_order)
values
  (
    'originals',
    'Originals',
    'Limited digital editions created exclusively for Levitaeo.',
    1
  ),
  (
    'skylines',
    'Skylines',
    'Iconic cities reimagined through restrained line, form, and contrast.',
    2
  ),
  (
    'nature',
    'Nature',
    'Quiet landscapes shaped by light, texture, and natural rhythm.',
    3
  ),
  (
    'minimal',
    'Minimal',
    'Pure geometry, considered space, and visual balance.',
    4
  )
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- Seed products (all rows from lib/product-catalog.ts)
-- Note: product-catalog.ts currently defines six Originals editions only.
-- No other collection products exist in code yet; all six are seeded below.
-- price_cents: 2900 = EUR 29.00 (matches Stripe minor-unit convention)
-- resolution: pixel dimensions; file_type: container/format only (PNG)
-- ---------------------------------------------------------------------------

with originals_collection as (
  select id from public.collections where slug = 'originals'
)
insert into public.products (
  collection_id,
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
  sort_order
)
select
  originals_collection.id,
  seed.slug,
  seed.title,
  seed.subtitle,
  seed.description,
  seed.price_cents,
  seed.currency,
  seed.image_url,
  seed.thumbnail_url,
  seed.edition,
  seed.resolution,
  seed.file_type,
  seed.status,
  seed.is_featured,
  seed.stripe_price_id,
  seed.sort_order
from originals_collection
cross join (
  values
    (
      'originals-no-01',
      'Originals No. 01',
      'Edition 001',
      'A limited digital edition exploring contrast, balance, atmosphere, and visual restraint.',
      2900,
      'EUR',
      '/images/originals/originals-no-01.png',
      '/images/originals/originals-no-01.png',
      '001',
      '6000 × 8000 px',
      'PNG',
      'published',
      true,
      null::text,
      1
    ),
    (
      'originals-no-02',
      'Originals No. 02',
      'Edition 002',
      'A limited digital edition exploring contrast, balance, atmosphere, and visual restraint.',
      2900,
      'EUR',
      '/images/originals/originals-no-02.png',
      '/images/originals/originals-no-02.png',
      '002',
      '6000 × 8000 px',
      'PNG',
      'published',
      true,
      null::text,
      2
    ),
    (
      'originals-no-03',
      'Originals No. 03',
      'Edition 003',
      'A limited digital edition exploring contrast, balance, atmosphere, and visual restraint.',
      2900,
      'EUR',
      '/images/originals/originals-no-03.png',
      '/images/originals/originals-no-03.png',
      '003',
      '6000 × 8000 px',
      'PNG',
      'coming_soon',
      false,
      null::text,
      3
    ),
    (
      'originals-no-04',
      'Originals No. 04',
      'Edition 004',
      'A limited digital edition exploring contrast, balance, atmosphere, and visual restraint.',
      2900,
      'EUR',
      '/images/originals/originals-no-04.png',
      '/images/originals/originals-no-04.png',
      '004',
      '6000 × 8000 px',
      'PNG',
      'coming_soon',
      false,
      null::text,
      4
    ),
    (
      'originals-no-05',
      'Originals No. 05',
      'Edition 005',
      'A limited digital edition exploring contrast, balance, atmosphere, and visual restraint.',
      2900,
      'EUR',
      '/images/originals/originals-no-05.png',
      '/images/originals/originals-no-05.png',
      '005',
      '6000 × 8000 px',
      'PNG',
      'coming_soon',
      false,
      null::text,
      5
    ),
    (
      'originals-no-06',
      'Originals No. 06',
      'Edition 006',
      'A limited digital edition exploring contrast, balance, atmosphere, and visual restraint.',
      2900,
      'EUR',
      '/images/originals/originals-no-06.png',
      '/images/originals/originals-no-06.png',
      '006',
      '6000 × 8000 px',
      'PNG',
      'coming_soon',
      false,
      null::text,
      6
    )
) as seed(
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
  sort_order
)
on conflict (slug) do nothing;

-- Backfill optional product_id on existing order rows where slug matches catalog.
-- Safe no-op when no orders exist yet.
update public.order_items oi
set product_id = p.id
from public.products p
where oi.product_id is null
  and oi.product_slug = p.slug;

update public.entitlements e
set product_id = p.id
from public.products p
where e.product_id is null
  and e.product_slug = p.slug;
