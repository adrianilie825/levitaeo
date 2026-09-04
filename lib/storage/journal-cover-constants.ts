export const JOURNAL_COVERS_BUCKET = "journal-covers";

export const JOURNAL_COVER_IMAGE_EXTENSIONS = [
  "png",
  "jpg",
  "jpeg",
  "webp",
] as const;

export type JournalCoverImageExtension =
  (typeof JOURNAL_COVER_IMAGE_EXTENSIONS)[number];

export const JOURNAL_COVER_EXTENSION_MIME_TYPES: Record<
  JournalCoverImageExtension,
  readonly string[]
> = {
  png: ["image/png"],
  jpg: ["image/jpeg"],
  jpeg: ["image/jpeg"],
  webp: ["image/webp"],
};

export const MAX_JOURNAL_COVER_BYTES = 20 * 1024 * 1024;

export const ACCEPT_JOURNAL_COVER_EXTENSIONS =
  JOURNAL_COVER_IMAGE_EXTENSIONS.map((extension) => `.${extension}`).join(",");

export const ACCEPT_JOURNAL_COVER_MIME_TYPES = [
  ...new Set(Object.values(JOURNAL_COVER_EXTENSION_MIME_TYPES).flat()),
].join(",");
