import type { JournalPostRow } from "@/types/database";

export type JournalPostFormValues = {
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
  published_at: string;
};

export function emptyJournalPostFormValues(): JournalPostFormValues {
  return {
    title: "",
    slug: "",
    excerpt: "",
    body: "",
    cover_image_url: "",
    cover_image_alt: "",
    author: "Levitaeo Studio",
    category: "",
    seo_title: "",
    seo_description: "",
    og_image_url: "",
    status: "draft",
    published_at: "",
  };
}

export function journalPostRowToFormValues(
  post: JournalPostRow,
): JournalPostFormValues {
  return {
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    body: post.body,
    cover_image_url: post.cover_image_url,
    cover_image_alt: post.cover_image_alt ?? "",
    author: post.author,
    category: post.category,
    seo_title: post.seo_title,
    seo_description: post.seo_description,
    og_image_url: post.og_image_url,
    status: post.status,
    published_at: formatDateTimeLocalInput(post.published_at),
  };
}

export function formatDateTimeLocalInput(value: string | null): string {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const pad = (part: number) => String(part).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
