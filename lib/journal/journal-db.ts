import "server-only";

import { unstable_cache } from "next/cache";
import { createCatalogClient } from "@/lib/supabase/catalog";
import { isSupabasePublicConfigured } from "@/lib/supabase/env";
import type { JournalPost, JournalPostStatus, JournalPostSummary } from "@/types/journal";

export const JOURNAL_REVALIDATE_SECONDS = 300;
export const JOURNAL_POSTS_TAG = "journal-posts";

type DbJournalPostRow = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  cover_image_url: string;
  cover_image_alt: string;
  author: string;
  published_at: string | null;
  category: string;
  status: string;
  seo_title: string;
  seo_description: string;
  og_image_url: string;
  created_at: string;
  updated_at: string;
};

const JOURNAL_POST_COLUMNS =
  "id, title, slug, excerpt, body, cover_image_url, cover_image_alt, author, published_at, category, status, seo_title, seo_description, og_image_url, created_at, updated_at";

function normalizeJournalSlug(slug: string): string {
  return slug.trim().toLowerCase();
}

function mapJournalStatus(status: string): JournalPostStatus {
  return status === "published" ? "published" : "draft";
}

function mapDbJournalPost(row: DbJournalPostRow): JournalPost {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    body: row.body,
    coverImageUrl: row.cover_image_url,
    coverImageAlt: row.cover_image_alt ?? "",
    author: row.author,
    publishedAt: row.published_at,
    category: row.category,
    status: mapJournalStatus(row.status),
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
    ogImageUrl: row.og_image_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toJournalPostSummary(post: JournalPost): JournalPostSummary {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    coverImageUrl: post.coverImageUrl,
    coverImageAlt: post.coverImageAlt,
    author: post.author,
    publishedAt: post.publishedAt,
    category: post.category,
  };
}

async function fetchPublishedJournalPostsFromDb(): Promise<JournalPost[]> {
  if (!isSupabasePublicConfigured()) {
    return [];
  }

  const supabase = createCatalogClient();
  const { data, error } = await supabase
    .from("journal_posts")
    .select(JOURNAL_POST_COLUMNS)
    .eq("status", "published")
    .order("published_at", { ascending: false, nullsFirst: false });

  if (error || !data) {
    if (process.env.NODE_ENV === "development") {
      console.error("[journal-db] Failed to fetch published journal posts:", error);
    }

    return [];
  }

  return (data as DbJournalPostRow[]).map(mapDbJournalPost);
}

async function fetchPublishedJournalPostBySlugFromDb(
  slug: string,
): Promise<JournalPost | undefined> {
  const normalizedSlug = normalizeJournalSlug(slug);

  if (!normalizedSlug) {
    return undefined;
  }

  if (!isSupabasePublicConfigured()) {
    return undefined;
  }

  const supabase = createCatalogClient();
  const { data, error } = await supabase
    .from("journal_posts")
    .select(JOURNAL_POST_COLUMNS)
    .eq("status", "published")
    .eq("slug", normalizedSlug)
    .maybeSingle();

  if (error || !data) {
    if (process.env.NODE_ENV === "development" && error) {
      console.error("[journal-db] Failed to fetch journal post by slug:", error);
    }

    return undefined;
  }

  return mapDbJournalPost(data as DbJournalPostRow);
}

const getCachedPublishedJournalPosts = unstable_cache(
  fetchPublishedJournalPostsFromDb,
  ["journal-posts-published"],
  {
    revalidate: JOURNAL_REVALIDATE_SECONDS,
    tags: [JOURNAL_POSTS_TAG],
  },
);

function getCachedPublishedJournalPostBySlug(
  slug: string,
): Promise<JournalPost | undefined> {
  const normalizedSlug = normalizeJournalSlug(slug);

  return unstable_cache(
    () => fetchPublishedJournalPostBySlugFromDb(normalizedSlug),
    ["journal-post", normalizedSlug],
    {
      revalidate: JOURNAL_REVALIDATE_SECONDS,
      tags: [JOURNAL_POSTS_TAG, `journal-post-${normalizedSlug}`],
    },
  )();
}

export async function getPublishedJournalPosts(): Promise<JournalPostSummary[]> {
  const posts = await getCachedPublishedJournalPosts();
  return posts.map(toJournalPostSummary);
}

export async function getPublishedJournalPostBySlug(
  slug: string,
): Promise<JournalPost | undefined> {
  return getCachedPublishedJournalPostBySlug(slug);
}

export async function getPublishedJournalSlugs(): Promise<string[]> {
  const posts = await getCachedPublishedJournalPosts();
  return posts.map((post) => post.slug);
}
