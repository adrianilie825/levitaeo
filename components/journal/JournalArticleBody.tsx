import Link from "next/link";
import {
  parseJournalBody,
  type InlineSegment,
  type JournalBodyBlock,
} from "@/lib/journal/parse-body";

type JournalArticleBodyProps = {
  body: string;
};

const paragraphClassName =
  "text-[16px] leading-[1.85] text-neutral-700 sm:text-[17px] sm:leading-[1.9]";

const headingClassName =
  "text-[1.35rem] font-light leading-[1.2] tracking-[-0.02em] text-[#111111] sm:text-[1.5rem] [&:not(:first-child)]:mt-12";

const linkClassName =
  "text-[#111111] underline decoration-[#D8D2C8] underline-offset-4 transition-colors hover:decoration-[#111111]";

function renderInlineSegments(segments: InlineSegment[], blockKey: string) {
  return segments.map((segment, index) => {
    const key = `${blockKey}-segment-${index}`;

    if (segment.type === "text") {
      return <span key={key}>{segment.value}</span>;
    }

    if (segment.external) {
      return (
        <a
          key={key}
          href={segment.href}
          className={linkClassName}
          target="_blank"
          rel="noreferrer noopener"
        >
          {segment.label}
        </a>
      );
    }

    return (
      <Link key={key} href={segment.href} className={linkClassName}>
        {segment.label}
      </Link>
    );
  });
}

function renderBlock(block: JournalBodyBlock, index: number) {
  const blockKey = `journal-block-${index}`;

  if (block.type === "h2") {
    return (
      <h2 key={blockKey} className={headingClassName}>
        {block.text}
      </h2>
    );
  }

  return (
    <p key={blockKey} className={paragraphClassName}>
      {renderInlineSegments(block.segments, blockKey)}
    </p>
  );
}

export default function JournalArticleBody({ body }: JournalArticleBodyProps) {
  const blocks = parseJournalBody(body);

  if (blocks.length === 0) {
    return null;
  }

  return <div className="space-y-6">{blocks.map(renderBlock)}</div>;
}
