-- Levitaeo Sprint 8: Secure artwork downloads
-- Do not modify 003_product_catalog.sql.
-- Run manually in Supabase SQL Editor.
--
-- Signed download URLs are generated server-side with the service-role client
-- after entitlement verification. Browser clients never receive direct storage
-- access to the private artwork-downloads bucket.

-- ---------------------------------------------------------------------------
-- Product download metadata
-- ---------------------------------------------------------------------------

alter table public.products
  add column if not exists download_storage_path text,
  add column if not exists download_filename text,
  add column if not exists download_mime_type text,
  add column if not exists download_size_bytes bigint,
  add column if not exists download_version text;

comment on column public.products.download_storage_path is
  'Private Supabase Storage object path inside artwork-downloads, e.g. products/{product_id}/edition.zip';

comment on column public.products.download_filename is
  'Customer-facing filename presented during secure download.';

comment on column public.products.download_mime_type is
  'MIME type of the downloadable asset.';

comment on column public.products.download_size_bytes is
  'Optional byte size of the downloadable asset for UI display.';

comment on column public.products.download_version is
  'Optional version label for future asset updates.';

-- ---------------------------------------------------------------------------
-- download_events (server-written audit log)
-- ---------------------------------------------------------------------------

create table if not exists public.download_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  entitlement_id uuid references public.entitlements (id) on delete set null,
  created_at timestamptz not null default now(),
  outcome text not null,
  ip_hash text,
  user_agent text,
  constraint download_events_outcome_not_empty check (char_length(trim(outcome)) > 0)
);

create index if not exists download_events_user_id_idx
  on public.download_events (user_id, created_at desc);

create index if not exists download_events_product_id_idx
  on public.download_events (product_id, created_at desc);

alter table public.download_events enable row level security;

-- No browser-facing policies. Inserts occur via service-role server code only.

comment on table public.download_events is
  'Privacy-conscious download audit log. No signed URLs or raw IP addresses are stored.';

-- ---------------------------------------------------------------------------
-- Private storage bucket: artwork-downloads
-- ---------------------------------------------------------------------------
-- Supabase bucket creation via SQL is supported on current projects, but the
-- Dashboard remains the most reliable fallback if this INSERT fails.
--
-- Manual fallback (Supabase Dashboard → Storage → New bucket):
--   Name: artwork-downloads
--   Public: OFF
--   File size limit: 524288000 (500 MB)
--   Allowed MIME types:
--     application/zip
--     application/x-zip-compressed
--     image/png
--     image/jpeg
--     image/webp
--     application/pdf
--
-- Upload files to paths such as:
--   products/{product_uuid}/originals-no-01.zip
-- Then set products.download_storage_path to that exact object key.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'artwork-downloads',
  'artwork-downloads',
  false,
  524288000,
  array[
    'application/zip',
    'application/x-zip-compressed',
    'image/png',
    'image/jpeg',
    'image/webp',
    'application/pdf'
  ]::text[]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- ---------------------------------------------------------------------------
-- Storage policies
-- ---------------------------------------------------------------------------
-- Intentionally no SELECT/INSERT/UPDATE/DELETE policies for anon or authenticated
-- roles on artwork-downloads. Customers must not list or read objects directly.
-- Server-side signed URLs are created with the service-role client after
-- entitlement verification in app/api/downloads/[productId]/route.ts.

-- Optional: allow service_role full access is implicit (bypasses RLS).
-- Admins upload files via Dashboard or service-role tooling only in this sprint.
