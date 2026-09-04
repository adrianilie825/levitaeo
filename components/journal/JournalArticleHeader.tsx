import Image from "next/image";
import Link from "next/link";
import JournalArticleBody from "@/components/journal/JournalArticleBody";
import { formatJournalDate, resolveJournalCoverAlt } from "@/lib/journal/format";
import type { JournalPost } from "@/types/journal";

type JournalArticleHeaderProps = {
  post: JournalPost;
};

function hasCoverImage(url: string): boolean {
  return url.trim().length > 0;
}

export default function JournalArticleHeader({ post }: JournalArticleHeaderProps) {
  const formattedDate = formatJournalDate(post.publishedAt);

  return (
    <>
      <div className="mx-auto max-w-3xl px-6 pt-12 pb-10 md:pt-16 md:pb-12 lg:px-10">
        <Link
          href="/journal"
          className="text-[11px] uppercase tracking-[0.32em] text-neutral-500 transition-colors hover:text-[#111111]"
        >
          Journal
        </Link>

        {post.category ? (
          <p className="mt-8 text-[11px] font-normal uppercase tracking-[0.44em] text-neutral-500">
            {post.category}
          </p>
        ) : null}

        <h1
          className={`max-w-4xl text-[2.25rem] font-light leading-[1.08] tracking-[-0.03em] text-[#111111] sm:text-[2.75rem] lg:text-[3.25rem] lg:leading-[1.06] ${
            post.category ? "mt-5" : "mt-8"
          }`}
        >
          {post.title}
        </h1>

        {post.excerpt ? (
          <p className="mt-6 max-w-2xl text-[16px] leading-8 text-neutral-600 sm:text-[17px] sm:leading-9">
            {post.excerpt}
          </p>
        ) : null}

        {(post.author || formattedDate) && (
          <p className="mt-8 text-[12px] tracking-[0.1em] text-neutral-500">
            {[post.author, formattedDate].filter(Boolean).join(" · ")}
          </p>
        )}
      </div>

      {hasCoverImage(post.coverImageUrl) ? (
        <div className="border-y border-[#ECE8E2] bg-[#F7F5F1]">
          <div className="relative mx-auto aspect-[16/9] max-w-7xl overflow-hidden">
            <Image
              src={post.coverImageUrl}
              alt={resolveJournalCoverAlt({
                title: post.title,
                coverImageAlt: post.coverImageAlt,
              })}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          </div>
        </div>
      ) : null}

      {post.body.trim().length > 0 ? (
        <div className="mx-auto max-w-2xl px-6 py-12 md:py-16 lg:px-10">
          <JournalArticleBody body={post.body} />
        </div>
      ) : null}
    </>
  );
}
