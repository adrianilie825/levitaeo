import type { Metadata } from "next";
import { notFound } from "next/navigation";
import JournalArticleHeader from "@/components/journal/JournalArticleHeader";
import BrandPageShell from "@/components/brand/BrandPageShell";
import JsonLd from "@/components/JsonLd";
import { getPublishedJournalPostBySlug } from "@/lib/journal/journal-db";
import {
  blogPostingJsonLd,
  createJournalArticleMetadata,
  createPageMetadata,
  resolveOgImage,
} from "@/lib/seo";

export const revalidate = 300;

type JournalArticlePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({
  params,
}: JournalArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedJournalPostBySlug(slug);

  if (!post) {
    return createPageMetadata({
      title: "Journal",
      path: `/journal/${slug}`,
      robots: {
        index: false,
        follow: false,
      },
    });
  }

  const title = post.seoTitle.trim() || post.title;
  const description =
    post.seoDescription.trim() || post.excerpt.trim() || post.title;
  const image =
    post.ogImageUrl.trim() || post.coverImageUrl.trim() || undefined;

  return createJournalArticleMetadata({
    title,
    description,
    path: `/journal/${post.slug}`,
    image,
    publishedAt: post.publishedAt!,
    updatedAt: post.updatedAt,
    author: post.author,
  });
}

export default async function JournalArticlePage({
  params,
}: JournalArticlePageProps) {
  const { slug } = await params;
  const post = await getPublishedJournalPostBySlug(slug);

  if (!post || !post.publishedAt) {
    notFound();
  }

  const description =
    post.seoDescription.trim() || post.excerpt.trim() || post.title;
  const image =
    post.ogImageUrl.trim() || post.coverImageUrl.trim() || undefined;

  return (
    <BrandPageShell>
      <JsonLd
        data={blogPostingJsonLd({
          title: post.title,
          description,
          slug: post.slug,
          author: post.author,
          publishedAt: post.publishedAt,
          updatedAt: post.updatedAt,
          image: image ? resolveOgImage(image) : undefined,
          category: post.category,
        })}
      />

      <article>
        <JournalArticleHeader post={post} />
      </article>
    </BrandPageShell>
  );
}
