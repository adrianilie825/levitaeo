import {
  ALLOWED_UPLOAD_EXTENSIONS,
  EXTENSION_MIME_TYPES,
  MAX_UPLOAD_BYTES,
  type AllowedUploadExtension,
} from "@/lib/downloads/upload-constants";

export type UploadValidationResult =
  | { ok: true; extension: AllowedUploadExtension; mimeType: string }
  | { ok: false; message: string };

const SAFE_FILENAME_PATTERN = /^[a-zA-Z0-9._-]+$/;

function getFileExtension(filename: string): string | null {
  const baseName = filename.split(/[/\\]/).pop() ?? filename;
  const lastDot = baseName.lastIndexOf(".");

  if (lastDot <= 0 || lastDot === baseName.length - 1) {
    return null;
  }

  return baseName.slice(lastDot + 1).toLowerCase();
}

function isAllowedExtension(
  extension: string,
): extension is AllowedUploadExtension {
  return (ALLOWED_UPLOAD_EXTENSIONS as readonly string[]).includes(extension);
}

function resolveMimeType(
  extension: AllowedUploadExtension,
  reportedMimeType: string,
): string | null {
  const normalizedMime = reportedMimeType.trim().toLowerCase();
  const allowedMimes = EXTENSION_MIME_TYPES[extension];

  if (
    normalizedMime &&
    allowedMimes.some((mime) => mime.toLowerCase() === normalizedMime)
  ) {
    return allowedMimes[0];
  }

  return allowedMimes[0] ?? null;
}

export function sanitizeDownloadFilename(filename: string): string | null {
  const raw = filename.split(/[/\\]/).pop() ?? filename;

  if (!raw || raw.includes("\0")) {
    return null;
  }

  const sanitized = raw
    .trim()
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  if (!sanitized || !SAFE_FILENAME_PATTERN.test(sanitized)) {
    return null;
  }

  const extension = getFileExtension(sanitized);

  if (!extension || !isAllowedExtension(extension)) {
    return null;
  }

  return sanitized;
}

export function validateUploadFileMeta(input: {
  name: string;
  size: number;
  type: string;
}): UploadValidationResult {
  if (!input.name.trim()) {
    return { ok: false, message: "Choose a file to upload." };
  }

  if (input.name.includes("\0") || input.name.includes("..")) {
    return { ok: false, message: "The selected filename is not allowed." };
  }

  const sanitized = sanitizeDownloadFilename(input.name);

  if (!sanitized) {
    return {
      ok: false,
      message: "Only .zip, .png, .jpg, .jpeg, .webp, and .pdf files are allowed.",
    };
  }

  const extension = getFileExtension(sanitized);

  if (!extension || !isAllowedExtension(extension)) {
    return {
      ok: false,
      message: "Only .zip, .png, .jpg, .jpeg, .webp, and .pdf files are allowed.",
    };
  }

  if (input.size <= 0) {
    return { ok: false, message: "The selected file is empty." };
  }

  if (input.size > MAX_UPLOAD_BYTES) {
    return { ok: false, message: "The file exceeds the 500 MB limit." };
  }

  const mimeType = resolveMimeType(extension, input.type);

  if (!mimeType) {
    return { ok: false, message: "The file type is not supported." };
  }

  return { ok: true, extension, mimeType };
}

export function validateUploadBuffer(input: {
  filename: string;
  reportedMimeType: string;
  size: number;
}): UploadValidationResult {
  return validateUploadFileMeta({
    name: input.filename,
    size: input.size,
    type: input.reportedMimeType,
  });
}

export function buildVersionedStorageFilename(
  sanitizedFilename: string,
  version: string,
): string {
  const lastDot = sanitizedFilename.lastIndexOf(".");
  const baseName =
    lastDot > 0 ? sanitizedFilename.slice(0, lastDot) : sanitizedFilename;
  const extension = lastDot > 0 ? sanitizedFilename.slice(lastDot + 1) : "";

  return extension
    ? `${baseName}-${version}.${extension}`
    : `${baseName}-${version}`;
}

export function generateDownloadVersion(date = new Date()): string {
  const pad = (value: number) => String(value).padStart(2, "0");

  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
  ].join("") +
    "-" +
    [pad(date.getHours()), pad(date.getMinutes()), pad(date.getSeconds())].join(
      "",
    );
}

export function formatUploadBytes(sizeBytes: number | null | undefined): string {
  if (sizeBytes == null || !Number.isFinite(sizeBytes) || sizeBytes <= 0) {
    return "Unknown size";
  }

  if (sizeBytes < 1024) {
    return `${sizeBytes} B`;
  }

  if (sizeBytes < 1024 * 1024) {
    return `${(sizeBytes / 1024).toFixed(1)} KB`;
  }

  return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
}
