export function formatJournalDate(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function getJournalPostPath(slug: string): string {
  return `/journal/${slug}`;
}

export function getJournalCoverAlt(title: string): string {
  const trimmed = title.trim();

  if (!trimmed) {
    return "Levitaeo Journal";
  }

  return `${trimmed} — Levitaeo Journal`;
}
