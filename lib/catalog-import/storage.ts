import fs from "fs";
import { ARTWORK_DOWNLOADS_BUCKET } from "@/lib/downloads/constants";
import {
  buildVersionedStorageFilename,
  generateDownloadVersion,
  sanitizeDownloadFilename,
} from "@/lib/downloads/upload-validation";
import { PRODUCT_PREVIEWS_BUCKET } from "@/lib/storage/preview-constants";
import { getSupabaseUrl } from "@/lib/supabase/env";
import { getSupabaseAdmin } from "@/lib/supabase/admin-core";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function assertProductUuid(productId: string): void {
  if (!UUID_PATTERN.test(productId)) {
    throw new Error("Invalid product ID.");
  }
}

function assertStoragePath(storagePath: string, bucket: string): void {
  if (
    storagePath.includes("..") ||
    storagePath.startsWith("/") ||
    !storagePath.startsWith("products/")
  ) {
    throw new Error("Invalid storage path.");
  }

  if (bucket !== ARTWORK_DOWNLOADS_BUCKET && bucket !== PRODUCT_PREVIEWS_BUCKET) {
    throw new Error("Unsupported storage bucket.");
  }
}

export function buildDeliveryStoragePath(
  productId: string,
  variantKey: string,
  version: string,
  extension: string,
): string {
  assertProductUuid(productId);

  const filename = sanitizeDownloadFilename(`${variantKey}.${extension}`);

  if (!filename) {
    throw new Error(`Invalid variant filename for "${variantKey}".`);
  }

  const versionedFilename = buildVersionedStorageFilename(filename, version);
  const storagePath = `products/${productId}/${versionedFilename}`;
  assertStoragePath(storagePath, ARTWORK_DOWNLOADS_BUCKET);

  return storagePath;
}

export function buildPreviewStoragePath(
  productId: string,
  version: string,
): string {
  assertProductUuid(productId);

  const storagePath = `products/${productId}/preview-${version}.jpg`;
  assertStoragePath(storagePath, PRODUCT_PREVIEWS_BUCKET);

  return storagePath;
}

export function buildPreviewPublicUrl(storagePath: string): string {
  const base = getSupabaseUrl().replace(/\/+$/, "");
  return `${base}/storage/v1/object/public/${PRODUCT_PREVIEWS_BUCKET}/${storagePath}`;
}

export async function uploadPrivateDeliveryFile(input: {
  storagePath: string;
  absolutePath: string;
  mimeType: string;
}): Promise<void> {
  assertStoragePath(input.storagePath, ARTWORK_DOWNLOADS_BUCKET);

  const buffer = fs.readFileSync(input.absolutePath);
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.storage
    .from(ARTWORK_DOWNLOADS_BUCKET)
    .upload(input.storagePath, buffer, {
      contentType: input.mimeType,
      upsert: false,
    });

  if (error) {
    if (error.message.toLowerCase().includes("already exists")) {
      throw new Error(`Storage object already exists at ${input.storagePath}.`);
    }

    throw new Error(`Failed to upload delivery file: ${error.message}`);
  }
}

export async function uploadPublicPreviewFile(input: {
  storagePath: string;
  absolutePath: string;
  mimeType: string;
}): Promise<string> {
  assertStoragePath(input.storagePath, PRODUCT_PREVIEWS_BUCKET);

  const buffer = fs.readFileSync(input.absolutePath);
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.storage
    .from(PRODUCT_PREVIEWS_BUCKET)
    .upload(input.storagePath, buffer, {
      contentType: input.mimeType,
      upsert: true,
    });

  if (error) {
    throw new Error(`Failed to upload preview file: ${error.message}`);
  }

  return buildPreviewPublicUrl(input.storagePath);
}

export async function deletePrivateStorageObject(
  storagePath: string | null | undefined,
): Promise<void> {
  const trimmed = storagePath?.trim();

  if (!trimmed) {
    return;
  }

  assertStoragePath(trimmed, ARTWORK_DOWNLOADS_BUCKET);

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.storage
    .from(ARTWORK_DOWNLOADS_BUCKET)
    .remove([trimmed]);

  if (error) {
    throw new Error(`Failed to delete storage object: ${error.message}`);
  }
}

export function createImportVersion(): string {
  return generateDownloadVersion();
}

export function buildDeliveryFilename(
  variantKey: string,
  version: string,
  extension: string,
): string {
  const sanitized = sanitizeDownloadFilename(`${variantKey}.${extension}`);

  if (!sanitized) {
    throw new Error(`Invalid delivery filename for "${variantKey}".`);
  }

  return buildVersionedStorageFilename(sanitized, version);
}
