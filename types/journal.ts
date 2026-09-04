export type JournalPostStatus = "draft" | "published";

export type JournalPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  coverImageUrl: string;
  coverImageAlt: string;
  author: string;
  publishedAt: string | null;
  category: string;
  status: JournalPostStatus;
  seoTitle: string;
  seoDescription: string;
  ogImageUrl: string;
  createdAt: string;
  updatedAt: string;
};

export type JournalPostSummary = Pick<
  JournalPost,
  | "id"
  | "title"
  | "slug"
  | "excerpt"
  | "coverImageUrl"
  | "coverImageAlt"
  | "author"
  | "publishedAt"
  | "category"
>;
