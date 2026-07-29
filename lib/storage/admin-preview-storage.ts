import "server-only";

import { getSupabaseUrl } from "@/lib/supabase/env";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { PRODUCT_PREVIEWS_BUCKET } from "@/lib/storage/preview-constants";
import { isValidProductUuid } from "@/lib/storage/admin-artwork-storage";

export function buildPreviewStoragePath(
  productId: string,
  filename: string,
): string {
  if (!isValidProductUuid(productId)) {
    throw new Error("Invalid product ID.");
  }

  const sanitized = filename.replace(/[^a-zA-Z0-9._-]+/g, "-");

  if (!sanitized || sanitized.includes("..")) {
    throw new Error("Invalid filename.");
  }

  return `products/${productId}/${sanitized}`;
}

export function buildPreviewPublicUrl(storagePath: string): string {
  const base = getSupabaseUrl().replace(/\/+$/, "");
  return `${base}/storage/v1/object/public/${PRODUCT_PREVIEWS_BUCKET}/${storagePath}`;
}

export function extractPreviewStoragePathFromUrl(
  url: string | null | undefined,
): string | null {
  const trimmed = url?.trim();

  if (!trimmed) {
    return null;
  }

  const marker = `/storage/v1/object/public/${PRODUCT_PREVIEWS_BUCKET}/`;

  if (!trimmed.includes(marker)) {
    return null;
  }

  const path = trimmed.split(marker)[1]?.split("?")[0]?.trim();

  if (!path || path.includes("..") || !path.startsWith("products/")) {
    return null;
  }

  return path;
}

type UploadPreviewFileInput = {
  storagePath: string;
  buffer: Buffer;
  contentType: string;
};

export async function uploadPreviewFile(
  input: UploadPreviewFileInput,
): Promise<{ ok: true; publicUrl: string } | { ok: false; message: string }> {
  if (
    input.storagePath.includes("..") ||
    input.storagePath.startsWith("/") ||
    !input.storagePath.startsWith("products/")
  ) {
    return { ok: false, message: "Invalid storage path." };
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.storage
    .from(PRODUCT_PREVIEWS_BUCKET)
    .upload(input.storagePath, input.buffer, {
      contentType: input.contentType,
      upsert: true,
    });

  if (error) {
    return { ok: false, message: "The preview image could not be uploaded." };
  }

  return {
    ok: true,
    publicUrl: buildPreviewPublicUrl(input.storagePath),
  };
}

export async function deletePreviewFile(
  storagePath: string | null | undefined,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const trimmed = storagePath?.trim();

  if (!trimmed) {
    return { ok: true };
  }

  if (
    trimmed.includes("..") ||
    trimmed.startsWith("/") ||
    !trimmed.startsWith("products/")
  ) {
    return { ok: false, message: "Invalid storage path." };
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.storage
    .from(PRODUCT_PREVIEWS_BUCKET)
    .remove([trimmed]);

  if (error) {
    return { ok: false, message: "The preview image could not be deleted." };
  }

  return { ok: true };
}
