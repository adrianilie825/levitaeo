-- Levitaeo: Optional product SEO and preview accessibility metadata
-- Non-destructive: adds nullable columns to public.products only.
--
-- Run manually in Supabase SQL Editor after review.
-- Existing rows remain compatible; application code falls back when values are null or empty.

alter table public.products
  add column if not exists seo_title text,
  add column if not exists seo_description text,
  add column if not exists preview_alt_text text;

comment on column public.products.seo_title is
  'Optional SEO page title override. Falls back to product title when null or empty.';

comment on column public.products.seo_description is
  'Optional meta description override. Falls back to description, subtitle, then site default.';

comment on column public.products.preview_alt_text is
  'Optional alt text for the catalog preview image. Falls back to generated artwork alt when null or empty.';
