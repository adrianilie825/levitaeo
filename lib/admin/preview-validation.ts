import {
  ACCEPT_PREVIEW_EXTENSIONS,
  MAX_PREVIEW_BYTES,
  PREVIEW_EXTENSION_MIME_TYPES,
  PREVIEW_IMAGE_EXTENSIONS,
  type PreviewImageExtension,
} from "@/lib/storage/preview-constants";

export type PreviewValidationResult =
  | { ok: true; extension: PreviewImageExtension; mimeType: string }
  | { ok: false; message: string };

function getFileExtension(filename: string): string | null {
  const baseName = filename.split(/[/\\]/).pop() ?? filename;
  const lastDot = baseName.lastIndexOf(".");

  if (lastDot <= 0 || lastDot === baseName.length - 1) {
    return null;
  }

  return baseName.slice(lastDot + 1).toLowerCase();
}

function isPreviewExtension(
  extension: string,
): extension is PreviewImageExtension {
  return (PREVIEW_IMAGE_EXTENSIONS as readonly string[]).includes(extension);
}

function resolveMimeType(
  extension: PreviewImageExtension,
  reportedMimeType: string,
): string | null {
  const normalizedMime = reportedMimeType.trim().toLowerCase();
  const allowedMimes = PREVIEW_EXTENSION_MIME_TYPES[extension];

  if (
    normalizedMime &&
    allowedMimes.some((mime) => mime.toLowerCase() === normalizedMime)
  ) {
    return allowedMimes[0];
  }

  return allowedMimes[0] ?? null;
}

export function validatePreviewFileMeta(input: {
  name: string;
  size: number;
  type: string;
}): PreviewValidationResult {
  if (!input.name.trim()) {
    return { ok: false, message: "Choose an image to upload." };
  }

  if (input.name.includes("\0") || input.name.includes("..")) {
    return { ok: false, message: "The selected filename is not allowed." };
  }

  const extension = getFileExtension(input.name);

  if (!extension || !isPreviewExtension(extension)) {
    return {
      ok: false,
      message: `Only ${ACCEPT_PREVIEW_EXTENSIONS.replace(/\./g, "").split(",").join(", ")} images are allowed.`,
    };
  }

  if (input.size <= 0) {
    return { ok: false, message: "The selected file is empty." };
  }

  if (input.size > MAX_PREVIEW_BYTES) {
    return { ok: false, message: "Preview images must be 20 MB or smaller." };
  }

  const mimeType = resolveMimeType(extension, input.type);

  if (!mimeType) {
    return { ok: false, message: "The image type is not supported." };
  }

  return { ok: true, extension, mimeType };
}
