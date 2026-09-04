import Image from "next/image";
import Link from "next/link";
import {
  formatJournalDate,
  getJournalPostPath,
  resolveJournalCoverAlt,
} from "@/lib/journal/format";
import type { JournalPostSummary } from "@/types/journal";

type JournalFeaturedPostProps = {
  post: JournalPostSummary;
  priority?: boolean;
};

function hasCoverImage(url: string): boolean {
  return url.trim().length > 0;
}

export default function JournalFeaturedPost({
  post,
  priority = true,
}: JournalFeaturedPostProps) {
  const formattedDate = formatJournalDate(post.publishedAt);
  const href = getJournalPostPath(post.slug);
  const showCover = hasCoverImage(post.coverImageUrl);

  return (
    <article className="group">
      <Link href={href} className="block">
        <div
          className={
            showCover
              ? "grid gap-8 lg:grid-cols-[minmax(0,58fr)_minmax(0,42fr)] lg:items-center lg:gap-x-14 xl:gap-x-16"
              : "max-w-3xl"
          }
        >
          {showCover ? (
            <div className="relative aspect-[16/9] overflow-hidden bg-[#F0EDE8]">
              <Image
                src={post.coverImageUrl}
                alt={resolveJournalCoverAlt({
                  title: post.title,
                  coverImageAlt: post.coverImageAlt,
                })}
                fill
                priority={priority}
                sizes="(max-width: 1024px) 100vw, 58vw"
                className="object-cover"
              />
            </div>
          ) : null}

          <div className="flex flex-col justify-center lg:py-2">
            {post.category ? (
              <p className="text-[11px] font-normal uppercase tracking-[0.44em] text-neutral-500">
                {post.category}
              </p>
            ) : null}

            <h2
              className={`max-w-xl text-[1.75rem] font-light leading-[1.12] tracking-[-0.02em] text-[#111111] transition-colors group-hover:text-neutral-700 sm:text-[2rem] lg:text-[2.15rem] lg:leading-[1.1] ${
                post.category ? "mt-5" : ""
              }`}
            >
              {post.title}
            </h2>

            {post.excerpt ? (
              <p className="mt-5 max-w-lg text-[15px] leading-7 text-neutral-600 sm:text-base sm:leading-8">
                {post.excerpt}
              </p>
            ) : null}

            {(post.author || formattedDate) && (
              <p className="mt-6 text-[12px] tracking-[0.1em] text-neutral-500">
                {[post.author, formattedDate].filter(Boolean).join(" · ")}
              </p>
            )}

            <p className="mt-8 text-[11px] uppercase tracking-[0.28em] text-[#111111] transition-colors group-hover:text-neutral-600">
              Read article →
            </p>
          </div>
        </div>
      </Link>
    </article>
  );
}
