import "server-only";

/**
 * Admin journal writes use the Supabase service-role client (getSupabaseAdmin).
 * Every call site must invoke requireAdmin() first.
 */

import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { JournalPostRow } from "@/types/database";

export type JournalPostWriteInput = {
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  cover_image_url: string;
  cover_image_alt: string;
  author: string;
  category: string;
  seo_title: string;
  seo_description: string;
  og_image_url: string;
  status: string;
  published_at: string | null;
};

function getAdminClient() {
  return getSupabaseAdmin();
}

export async function listAdminJournalPosts(): Promise<JournalPostRow[]> {
  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from("journal_posts")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as JournalPostRow[];
}

export async function getAdminJournalPostById(
  id: string,
): Promise<JournalPostRow | null> {
  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from("journal_posts")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data as JournalPostRow | null) ?? null;
}

export async function isJournalPostSlugTaken(
  slug: string,
  excludeId?: string,
): Promise<boolean> {
  const supabase = getAdminClient();
  let query = supabase.from("journal_posts").select("id").eq("slug", slug);

  if (excludeId) {
    query = query.neq("id", excludeId);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return Boolean(data);
}

export async function createAdminJournalPost(
  input: JournalPostWriteInput,
): Promise<JournalPostRow> {
  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from("journal_posts")
    .insert(input)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as JournalPostRow;
}

export async function updateAdminJournalPost(
  id: string,
  input: JournalPostWriteInput,
): Promise<JournalPostRow> {
  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from("journal_posts")
    .update(input)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as JournalPostRow;
}

export async function updateAdminJournalCoverUrl(
  id: string,
  coverImageUrl: string,
): Promise<JournalPostRow> {
  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from("journal_posts")
    .update({ cover_image_url: coverImageUrl })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as JournalPostRow;
}

export async function clearAdminJournalCover(
  id: string,
): Promise<JournalPostRow> {
  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from("journal_posts")
    .update({
      cover_image_url: "",
      cover_image_alt: "",
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as JournalPostRow;
}
