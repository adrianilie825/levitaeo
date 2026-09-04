import Image from "next/image";
import Link from "next/link";
import {
  formatJournalDate,
  getJournalPostPath,
  resolveJournalCoverAlt,
} from "@/lib/journal/format";
import type { JournalPostSummary } from "@/types/journal";

type JournalPostCardProps = {
  post: JournalPostSummary;
};

function hasCoverImage(url: string): boolean {
  return url.trim().length > 0;
}

export default function JournalPostCard({ post }: JournalPostCardProps) {
  const formattedDate = formatJournalDate(post.publishedAt);
  const href = getJournalPostPath(post.slug);
  const showCover = hasCoverImage(post.coverImageUrl);

  return (
    <article className="group">
      <Link href={href} className="block">
        {showCover ? (
          <div className="relative aspect-[16/9] overflow-hidden bg-[#F0EDE8]">
            <Image
              src={post.coverImageUrl}
              alt={resolveJournalCoverAlt({
                title: post.title,
                coverImageAlt: post.coverImageAlt,
              })}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
              className="object-cover"
            />
          </div>
        ) : null}

        <div className={showCover ? "mt-6" : undefined}>
          {post.category ? (
            <p className="text-[11px] font-normal uppercase tracking-[0.36em] text-neutral-500">
              {post.category}
            </p>
          ) : null}

          <h2
            className={`text-[1.35rem] font-light leading-[1.18] tracking-[-0.02em] text-[#111111] transition-colors group-hover:text-neutral-700 sm:text-[1.5rem] ${
              post.category ? "mt-3" : ""
            }`}
          >
            {post.title}
          </h2>

          {post.excerpt ? (
            <p className="mt-4 max-w-xl text-[15px] leading-7 text-neutral-600">
              {post.excerpt}
            </p>
          ) : null}

          {(post.author || formattedDate) && (
            <p className="mt-5 text-[12px] tracking-[0.08em] text-neutral-500">
              {[post.author, formattedDate].filter(Boolean).join(" · ")}
            </p>
          )}

          <p className="mt-6 text-[11px] uppercase tracking-[0.24em] text-[#111111] transition-colors group-hover:text-neutral-600">
            Read article →
          </p>
        </div>
      </Link>
    </article>
  );
}
