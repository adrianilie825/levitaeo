import "server-only";

const STORAGE_PATH_PATTERN = /^products\/[a-zA-Z0-9/_-]+$/;
const SAFE_FILENAME_PATTERN = /^[a-zA-Z0-9._-]+$/;

export function validateDownloadStoragePath(value: string): string | null {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  if (trimmed.startsWith("/")) {
    return "Storage path must not start with a slash.";
  }

  if (trimmed.includes("..")) {
    return "Storage path must not contain path traversal.";
  }

  if (!trimmed.startsWith("products/")) {
    return 'Storage path must start with "products/".';
  }

  if (!STORAGE_PATH_PATTERN.test(trimmed)) {
    return "Storage path contains invalid characters.";
  }

  return null;
}

export function validateDownloadFilename(value: string): string | null {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  if (trimmed.includes("/") || trimmed.includes("\\")) {
    return "Filename must not contain path separators.";
  }

  if (!SAFE_FILENAME_PATTERN.test(trimmed)) {
    return "Filename may only contain letters, numbers, dots, underscores, and hyphens.";
  }

  return null;
}

export function validateDownloadSizeBytes(value: string): string | null {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  const parsed = Number.parseInt(trimmed, 10);

  if (!Number.isFinite(parsed) || parsed < 0) {
    return "Size must be a non-negative whole number.";
  }

  return null;
}

export function normalizeOptionalDownloadField(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function normalizeDownloadSizeBytes(value: string): number | null {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  const parsed = Number.parseInt(trimmed, 10);

  if (!Number.isFinite(parsed) || parsed < 0) {
    return null;
  }

  return parsed;
}
