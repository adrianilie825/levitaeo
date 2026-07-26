export const MAX_UPLOAD_BYTES = 524288000;

export const ALLOWED_UPLOAD_EXTENSIONS = [
  "zip",
  "png",
  "jpg",
  "jpeg",
  "webp",
  "pdf",
] as const;

export type AllowedUploadExtension = (typeof ALLOWED_UPLOAD_EXTENSIONS)[number];

export const EXTENSION_MIME_TYPES: Record<AllowedUploadExtension, readonly string[]> =
  {
    zip: ["application/zip", "application/x-zip-compressed"],
    png: ["image/png"],
    jpg: ["image/jpeg"],
    jpeg: ["image/jpeg"],
    webp: ["image/webp"],
    pdf: ["application/pdf"],
  };

export const ACCEPT_UPLOAD_MIME_TYPES = [
  ...new Set(Object.values(EXTENSION_MIME_TYPES).flat()),
].join(",");

export const ACCEPT_UPLOAD_EXTENSIONS = ALLOWED_UPLOAD_EXTENSIONS.map(
  (extension) => `.${extension}`,
).join(",");
