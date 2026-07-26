-- Levitaeo Sprint 10: Production catalog security
-- Do not modify 003_product_catalog.sql or 005_secure_downloads.sql.
-- Run manually in Supabase SQL Editor before public launch.
--
-- Architecture: Option A (chosen)
-- ---------------------------------------------------------------------------
-- All Admin CMS product reads and writes run server-side through
-- getSupabaseAdmin() after requireAdmin() / requireAdminApi().
-- The browser never receives the service-role key and never INSERTs or UPDATEs
-- products directly.
--
-- Verified application paths (pre-migration):
--   Admin create/edit/list/upload metadata  -> service-role (lib/admin/catalog.ts)
--   Public catalog/search/checkout reads    -> publishable client, public columns only (lib/products-db.ts)
--   Library product enrichment              -> authenticated SSR client, public columns only (lib/library.ts)
--   Secure download product metadata        -> service-role (lib/downloads/authorize-download.ts)
--   Secure download entitlements/orders     -> authenticated SSR client (RLS)
--
-- This migration restricts anon and authenticated to SELECT on public catalog
-- columns only. It does NOT affect service_role, which bypasses RLS and
-- retains full table access for server-only admin and download code paths.
--
-- Migration 004 admin RLS policies (is_admin INSERT/UPDATE) remain available
-- for future defense-in-depth if authenticated-admin clients are introduced,
-- but the current application does not rely on authenticated INSERT/UPDATE
-- privileges for products.

-- ---------------------------------------------------------------------------
-- Restrict browser-facing roles on public.products
-- ---------------------------------------------------------------------------

revoke all on table public.products from anon, authenticated;

grant select (
  id,
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
  sort_order,
  created_at
) on table public.products to anon, authenticated;

-- Private delivery metadata remains readable only via service_role:
--   download_storage_path
--   download_filename
--   download_mime_type
--   download_size_bytes
--   download_version
--
-- No INSERT, UPDATE, or DELETE grants are restored for anon or authenticated.
-- Admin CMS continues to write through the server-only service-role client.

-- Existing row-level policy from 003:
--   "Public read browsable catalog products" (status in published/coming_soon)
-- continues to gate which rows are visible. These column grants gate which
-- columns browser roles may read.

comment on table public.products is
  'Catalog products. Browser roles may SELECT public catalog columns only. Private delivery metadata and all writes use server-only service-role code after admin or entitlement checks.';
