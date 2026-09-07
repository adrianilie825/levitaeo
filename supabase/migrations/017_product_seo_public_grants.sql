-- Levitaeo: Extend public product column grants for SEO metadata
-- Non-destructive: updates SELECT grants only (no RLS or write access changes).
--
-- Run manually in Supabase SQL Editor after migration 016.
-- Migration 016 added seo_title, seo_description, and preview_alt_text.
-- Browser roles must be granted these columns explicitly (see 006, 012).

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
  created_at
) on table public.products to anon, authenticated;

comment on table public.products is
  'Catalog products. Browser roles may SELECT public catalog columns only. Private delivery metadata and all writes use server-only service-role code after admin or entitlement checks.';
