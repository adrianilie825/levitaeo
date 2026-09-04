-- Levitaeo: Journal cover image alt text + public journal-covers storage bucket
-- Non-destructive: adds one column and one storage bucket only.
--
-- Run manually in Supabase SQL Editor after review.

-- ---------------------------------------------------------------------------
-- journal_posts.cover_image_alt
-- ---------------------------------------------------------------------------

alter table public.journal_posts
add column if not exists cover_image_alt text not null default '';

comment on column public.journal_posts.cover_image_alt is
  'Descriptive alt text for the Journal cover image on public pages.';

-- ---------------------------------------------------------------------------
-- journal-covers bucket (public read, admin service-role write)
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'journal-covers',
  'journal-covers',
  true,
  20971520,
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public read journal covers" on storage.objects;

create policy "Public read journal covers"
  on storage.objects
  for select
  to public
  using (bucket_id = 'journal-covers');

-- No browser write policies. Admin uploads use the service-role client only.
