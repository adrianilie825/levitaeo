import "server-only";

import { revalidatePath, revalidateTag } from "next/cache";
import { JOURNAL_POSTS_TAG } from "@/lib/journal/journal-db";

type RevalidateJournalOptions = {
  slug?: string;
};

export function revalidateJournal(options: RevalidateJournalOptions = {}) {
  revalidateTag(JOURNAL_POSTS_TAG, "max");

  revalidatePath("/journal");

  if (options.slug) {
    const normalizedSlug = options.slug.trim().toLowerCase();
    revalidateTag(`journal-post-${normalizedSlug}`, "max");
    revalidatePath(`/journal/${normalizedSlug}`);
  }

  revalidatePath("/sitemap.xml");
  revalidatePath("/admin/journal");
}
