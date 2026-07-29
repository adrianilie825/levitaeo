import { MAX_UPLOAD_BYTES } from "@/lib/downloads/upload-constants";

export type ZipValidationResult =
  | { ok: true; mimeType: string }
  | { ok: false; message: string };

const ZIP_MIME_TYPES = [
  "application/zip",
  "application/x-zip-compressed",
] as const;

function getFileExtension(filename: string): string | null {
  const baseName = filename.split(/[/\\]/).pop() ?? filename;
  const lastDot = baseName.lastIndexOf(".");

  if (lastDot <= 0 || lastDot === baseName.length - 1) {
    return null;
  }

  return baseName.slice(lastDot + 1).toLowerCase();
}

export function validateZipFileMeta(input: {
  name: string;
  size: number;
  type: string;
}): ZipValidationResult {
  if (!input.name.trim()) {
    return { ok: false, message: "Choose a ZIP file to upload." };
  }

  if (input.name.includes("\0") || input.name.includes("..")) {
    return { ok: false, message: "The selected filename is not allowed." };
  }

  const extension = getFileExtension(input.name);

  if (extension !== "zip") {
    return { ok: false, message: "Delivery files must be .zip archives." };
  }

  if (input.size <= 0) {
    return { ok: false, message: "The selected file is empty." };
  }

  if (input.size > MAX_UPLOAD_BYTES) {
    return { ok: false, message: "The file exceeds the 500 MB limit." };
  }

  const normalizedMime = input.type.trim().toLowerCase();
  const mimeType =
    normalizedMime &&
    ZIP_MIME_TYPES.some((mime) => mime.toLowerCase() === normalizedMime)
      ? normalizedMime
      : ZIP_MIME_TYPES[0];

  return { ok: true, mimeType };
}
