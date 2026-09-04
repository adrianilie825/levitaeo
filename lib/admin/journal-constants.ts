export const JOURNAL_STATUSES = ["draft", "published"] as const;

export type JournalStatusValue = (typeof JOURNAL_STATUSES)[number];

export function isValidJournalStatus(
  value: string,
): value is JournalStatusValue {
  return JOURNAL_STATUSES.includes(value as JournalStatusValue);
}

export function journalStatusLabel(status: string): string {
  switch (status) {
    case "published":
      return "Published";
    case "draft":
      return "Draft";
    default:
      return status;
  }
}
