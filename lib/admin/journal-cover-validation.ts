import {
  ACCEPT_JOURNAL_COVER_EXTENSIONS,
  JOURNAL_COVER_EXTENSION_MIME_TYPES,
  JOURNAL_COVER_IMAGE_EXTENSIONS,
  MAX_JOURNAL_COVER_BYTES,
  type JournalCoverImageExtension,
} from "@/lib/storage/journal-cover-constants";

export type JournalCoverValidationResult =
  | { ok: true; extension: JournalCoverImageExtension; mimeType: string }
  | { ok: false; message: string };

function getFileExtension(filename: string): string | null {
  const baseName = filename.split(/[/\\]/).pop() ?? filename;
  const lastDot = baseName.lastIndexOf(".");

  if (lastDot <= 0 || lastDot === baseName.length - 1) {
    return null;
  }

  return baseName.slice(lastDot + 1).toLowerCase();
}

function isJournalCoverExtension(
  extension: string,
): extension is JournalCoverImageExtension {
  return (JOURNAL_COVER_IMAGE_EXTENSIONS as readonly string[]).includes(
    extension,
  );
}

function resolveMimeType(
  extension: JournalCoverImageExtension,
  reportedMimeType: string,
): string | null {
  const normalizedMime = reportedMimeType.trim().toLowerCase();
  const allowedMimes = JOURNAL_COVER_EXTENSION_MIME_TYPES[extension];

  if (
    normalizedMime &&
    allowedMimes.some((mime) => mime.toLowerCase() === normalizedMime)
  ) {
    return allowedMimes[0];
  }

  return allowedMimes[0] ?? null;
}

export function validateJournalCoverFileMeta(input: {
  name: string;
  size: number;
  type: string;
}): JournalCoverValidationResult {
  if (!input.name.trim()) {
    return { ok: false, message: "Choose an image to upload." };
  }

  if (input.name.includes("\0") || input.name.includes("..")) {
    return { ok: false, message: "The selected filename is not allowed." };
  }

  const extension = getFileExtension(input.name);

  if (!extension || !isJournalCoverExtension(extension)) {
    return {
      ok: false,
      message: `Only ${ACCEPT_JOURNAL_COVER_EXTENSIONS.replace(/\./g, "").split(",").join(", ")} images are allowed.`,
    };
  }

  if (input.size <= 0) {
    return { ok: false, message: "The selected file is empty." };
  }

  if (input.size > MAX_JOURNAL_COVER_BYTES) {
    return { ok: false, message: "Cover images must be 20 MB or smaller." };
  }

  const mimeType = resolveMimeType(extension, input.type);

  if (!mimeType) {
    return { ok: false, message: "The image type is not supported." };
  }

  return { ok: true, extension, mimeType };
}
