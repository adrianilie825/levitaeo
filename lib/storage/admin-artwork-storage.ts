import "server-only";

import { ARTWORK_DOWNLOADS_BUCKET } from "@/lib/downloads/constants";
import { sanitizeDownloadFilename } from "@/lib/downloads/upload-validation";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isValidProductUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}

export function buildArtworkStoragePath(
  productId: string,
  filename: string,
): string {
  if (!isValidProductUuid(productId)) {
    throw new Error("Invalid product ID.");
  }

  const sanitized = sanitizeDownloadFilename(filename);

  if (!sanitized) {
    throw new Error("Invalid filename.");
  }

  return `products/${productId}/${sanitized}`;
}

type UploadArtworkFileInput = {
  storagePath: string;
  buffer: Buffer;
  contentType: string;
};

export async function uploadArtworkFile(
  input: UploadArtworkFileInput,
): Promise<{ ok: true } | { ok: false; message: string }> {
  if (
    input.storagePath.includes("..") ||
    input.storagePath.startsWith("/") ||
    !input.storagePath.startsWith("products/")
  ) {
    return { ok: false, message: "Invalid storage path." };
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.storage
    .from(ARTWORK_DOWNLOADS_BUCKET)
    .upload(input.storagePath, input.buffer, {
      contentType: input.contentType,
      upsert: false,
    });

  if (error) {
    if (error.message.toLowerCase().includes("already exists")) {
      return { ok: false, message: "A file already exists at the target path." };
    }

    return { ok: false, message: "The file could not be uploaded." };
  }

  return { ok: true };
}

export async function deleteArtworkFile(
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
    .from(ARTWORK_DOWNLOADS_BUCKET)
    .remove([trimmed]);

  if (error) {
    return { ok: false, message: "The storage object could not be deleted." };
  }

  return { ok: true };
}
