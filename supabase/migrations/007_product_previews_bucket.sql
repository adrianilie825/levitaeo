-- Levitaeo Sprint 12: Public product preview images bucket
-- Run manually in Supabase SQL Editor if not already created.
--
-- Preview images are uploaded by the Admin CMS via the service-role client
-- and referenced in products.image_url / products.thumbnail_url as public URLs.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-previews',
  'product-previews',
  true,
  20971520,
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Public read for catalog preview images.
drop policy if exists "Public read product previews" on storage.objects;

create policy "Public read product previews"
  on storage.objects
  for select
  to public
  using (bucket_id = 'product-previews');

-- No browser write policies. Admin uploads use the service-role client only.
