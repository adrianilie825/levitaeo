import Image from "next/image";
import Link from "next/link";
import {
  formatJournalDate,
  getJournalCoverAlt,
  getJournalPostPath,
} from "@/lib/journal/format";
import type { JournalPostSummary } from "@/types/journal";

type JournalPostCardProps = {
  post: JournalPostSummary;
  priority?: boolean;
};

function hasCoverImage(url: string): boolean {
  return url.trim().length > 0;
}

export default function JournalPostCard({
  post,
  priority = false,
}: JournalPostCardProps) {
  const formattedDate = formatJournalDate(post.publishedAt);
  const href = getJournalPostPath(post.slug);

  return (
    <article className="group">
      <Link href={href} className="block">
        {hasCoverImage(post.coverImageUrl) ? (
          <div className="relative aspect-[16/10] overflow-hidden bg-[#F0EDE8]">
            <Image
              src={post.coverImageUrl}
              alt={getJournalCoverAlt(post.title)}
              fill
              priority={priority}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
            />
          </div>
        ) : null}

        <div className={hasCoverImage(post.coverImageUrl) ? "mt-6" : undefined}>
          {post.category ? (
            <p className="text-[11px] font-normal uppercase tracking-[0.36em] text-neutral-500">
              {post.category}
            </p>
          ) : null}

          <h2
            className={`text-[1.5rem] font-light leading-[1.16] tracking-[-0.02em] text-[#111111] transition-colors group-hover:text-neutral-700 sm:text-[1.65rem] ${
              post.category ? "mt-3" : ""
            }`}
          >
            {post.title}
          </h2>

          {post.excerpt ? (
            <p className="mt-4 max-w-xl text-[15px] leading-7 text-neutral-600 sm:text-base sm:leading-8">
              {post.excerpt}
            </p>
          ) : null}

          {(post.author || formattedDate) && (
            <p className="mt-5 text-[12px] tracking-[0.08em] text-neutral-500">
              {[post.author, formattedDate].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>
      </Link>
    </article>
  );
}
