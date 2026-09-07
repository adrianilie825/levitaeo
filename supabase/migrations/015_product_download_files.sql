-- Levitaeo: Multi-file digital edition download assets
-- Non-destructive: adds product_download_files table only.
-- Preserves legacy products.download_* single-file delivery.
--
-- Run manually in Supabase SQL Editor after review.
-- Browser clients must never read storage_path directly.
-- Signed URLs are issued server-side after entitlement verification.

-- ---------------------------------------------------------------------------
-- product_download_files
-- ---------------------------------------------------------------------------

create table public.product_download_files (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  variant_key text not null,
  display_name text not null,
  storage_path text not null,
  filename text not null,
  mime_type text not null,
  size_bytes bigint not null,
  version text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint product_download_files_variant_key_not_empty
    check (char_length(trim(variant_key)) > 0),
  constraint product_download_files_display_name_not_empty
    check (char_length(trim(display_name)) > 0),
  constraint product_download_files_storage_path_not_empty
    check (char_length(trim(storage_path)) > 0),
  constraint product_download_files_filename_not_empty
    check (char_length(trim(filename)) > 0),
  constraint product_download_files_mime_type_not_empty
    check (char_length(trim(mime_type)) > 0),
  constraint product_download_files_size_bytes_positive
    check (size_bytes > 0),
  constraint product_download_files_version_not_empty
    check (char_length(trim(version)) > 0),
  constraint product_download_files_product_variant_unique
    unique (product_id, variant_key)
);

create index product_download_files_product_id_idx
  on public.product_download_files (product_id);

create index product_download_files_product_sort_idx
  on public.product_download_files (product_id, sort_order);

create trigger product_download_files_set_updated_at
before update on public.product_download_files
for each row
execute function public.set_updated_at();

alter table public.product_download_files enable row level security;

-- No SELECT/INSERT/UPDATE/DELETE policies for anon or authenticated.
-- Service-role server code manages rows after admin or import operations.
-- Customers receive signed URLs only; storage paths remain server-only.

comment on table public.product_download_files is
  'Downloadable master assets for a single catalog edition. One product purchase grants access to all rows for that product_id.';

comment on column public.product_download_files.variant_key is
  'Stable asset identifier within the edition, e.g. color, color-white, blueprint.';

comment on column public.product_download_files.storage_path is
  'Private artwork-downloads object key. Never exposed to browser clients.';
