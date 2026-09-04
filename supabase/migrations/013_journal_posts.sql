-- Levitaeo: Journal posts foundation
-- Non-destructive: creates journal_posts table only.
--
-- Run manually in Supabase SQL Editor after review.
-- Admin writes (future /admin/journal) should use getSupabaseAdmin() after
-- requireAdmin(), matching the existing catalog admin pattern.
-- RLS policies below add database-level defense in depth via public.is_admin().

-- ---------------------------------------------------------------------------
-- journal_posts
-- ---------------------------------------------------------------------------

create table public.journal_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text not null default '',
  body text not null default '',
  cover_image_url text not null default '',
  author text not null default '',
  published_at timestamptz,
  category text not null default '',
  status text not null default 'draft',
  seo_title text not null default '',
  seo_description text not null default '',
  og_image_url text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint journal_posts_slug_not_empty check (char_length(trim(slug)) > 0),
  constraint journal_posts_title_not_empty check (char_length(trim(title)) > 0),
  constraint journal_posts_status_allowed check (
    status in ('draft', 'published')
  ),
  constraint journal_posts_published_requires_date check (
    status = 'draft' or published_at is not null
  )
);

create index journal_posts_status_idx on public.journal_posts (status);
create index journal_posts_published_at_idx on public.journal_posts (published_at desc nulls last);
create index journal_posts_category_idx on public.journal_posts (category);

create trigger journal_posts_set_updated_at
before update on public.journal_posts
for each row
execute function public.set_updated_at();

alter table public.journal_posts enable row level security;

-- ---------------------------------------------------------------------------
-- Public read: published posts only
-- ---------------------------------------------------------------------------

create policy "Public read published journal posts"
on public.journal_posts
for select
to anon, authenticated
using (status = 'published');

-- ---------------------------------------------------------------------------
-- Admin read/write via public.is_admin() (migration 004)
-- ---------------------------------------------------------------------------

create policy "Admins read all journal posts"
on public.journal_posts
for select
to authenticated
using (public.is_admin());

create policy "Admins insert journal posts"
on public.journal_posts
for insert
to authenticated
with check (public.is_admin());

create policy "Admins update journal posts"
on public.journal_posts
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- No DELETE policy: align with catalog admin pattern (no destructive deletes).

comment on table public.journal_posts is
  'Levitaeo Journal editorial posts. Public users may read published rows only. Admin writes use service-role after requireAdmin() or authenticated is_admin() RLS.';
