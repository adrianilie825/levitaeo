export const PRODUCT_PREVIEWS_BUCKET = "product-previews";

export const PREVIEW_IMAGE_EXTENSIONS = ["png", "jpg", "jpeg", "webp"] as const;

export type PreviewImageExtension = (typeof PREVIEW_IMAGE_EXTENSIONS)[number];

export const PREVIEW_EXTENSION_MIME_TYPES: Record<
  PreviewImageExtension,
  readonly string[]
> = {
  png: ["image/png"],
  jpg: ["image/jpeg"],
  jpeg: ["image/jpeg"],
  webp: ["image/webp"],
};

export const MAX_PREVIEW_BYTES = 20 * 1024 * 1024;

export const ACCEPT_PREVIEW_EXTENSIONS = PREVIEW_IMAGE_EXTENSIONS.map(
  (extension) => `.${extension}`,
).join(",");

export const ACCEPT_PREVIEW_MIME_TYPES = [
  ...new Set(Object.values(PREVIEW_EXTENSION_MIME_TYPES).flat()),
].join(",");
