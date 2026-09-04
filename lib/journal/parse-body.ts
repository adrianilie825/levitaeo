export type InlineSegment =
  | { type: "text"; value: string }
  | { type: "link"; label: string; href: string; external: boolean };

export type JournalBodyBlock =
  | { type: "h2"; text: string }
  | { type: "p"; segments: InlineSegment[] };

const MARKDOWN_LINK_PATTERN = /\[([^\]]+)\]\(([^)]+)\)/g;
const H2_LINE_PATTERN = /^##\s+(.+)$/;

export function isSafeJournalHref(href: string): boolean {
  const trimmed = href.trim();

  if (!trimmed) {
    return false;
  }

  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    return !trimmed.toLowerCase().includes("javascript:");
  }

  try {
    const url = new URL(trimmed);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function parseInlineContent(text: string): InlineSegment[] {
  const segments: InlineSegment[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(MARKDOWN_LINK_PATTERN)) {
    const fullMatch = match[0];
    const label = match[1]?.trim() ?? "";
    const href = match[2]?.trim() ?? "";
    const matchIndex = match.index ?? 0;

    if (matchIndex > lastIndex) {
      segments.push({
        type: "text",
        value: text.slice(lastIndex, matchIndex),
      });
    }

    if (label && href && isSafeJournalHref(href)) {
      const external = !href.startsWith("/");

      segments.push({
        type: "link",
        label,
        href,
        external,
      });
    } else {
      segments.push({
        type: "text",
        value: fullMatch,
      });
    }

    lastIndex = matchIndex + fullMatch.length;
  }

  if (lastIndex < text.length) {
    segments.push({
      type: "text",
      value: text.slice(lastIndex),
    });
  }

  return segments.length > 0 ? segments : [{ type: "text", value: text }];
}

function splitBodyIntoBlocks(body: string): string[] {
  return body
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter((block) => block.length > 0);
}

function parseBlock(block: string): JournalBodyBlock {
  const lines = block.split("\n").map((line) => line.trim());

  if (lines.length === 1) {
    const h2Match = lines[0].match(H2_LINE_PATTERN);

    if (h2Match) {
      return {
        type: "h2",
        text: h2Match[1].trim(),
      };
    }
  }

  const paragraphText = lines.join(" ").replace(/\s+/g, " ").trim();

  return {
    type: "p",
    segments: parseInlineContent(paragraphText),
  };
}

export function parseJournalBody(body: string): JournalBodyBlock[] {
  return splitBodyIntoBlocks(body).map(parseBlock);
}
