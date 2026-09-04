import "server-only";

import { getSupabaseUrl } from "@/lib/supabase/env";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { JOURNAL_COVERS_BUCKET } from "@/lib/storage/journal-cover-constants";
import { isValidProductUuid } from "@/lib/storage/admin-artwork-storage";

export function buildJournalCoverStoragePath(
  postId: string,
  filename: string,
): string {
  if (!isValidProductUuid(postId)) {
    throw new Error("Invalid journal post ID.");
  }

  const sanitized = filename.replace(/[^a-zA-Z0-9._-]+/g, "-");

  if (!sanitized || sanitized.includes("..")) {
    throw new Error("Invalid filename.");
  }

  return `posts/${postId}/${sanitized}`;
}

export function buildJournalCoverPublicUrl(storagePath: string): string {
  const base = getSupabaseUrl().replace(/\/+$/, "");
  return `${base}/storage/v1/object/public/${JOURNAL_COVERS_BUCKET}/${storagePath}`;
}

export function extractJournalCoverStoragePathFromUrl(
  url: string | null | undefined,
): string | null {
  const trimmed = url?.trim();

  if (!trimmed) {
    return null;
  }

  const marker = `/storage/v1/object/public/${JOURNAL_COVERS_BUCKET}/`;

  if (!trimmed.includes(marker)) {
    return null;
  }

  const path = trimmed.split(marker)[1]?.split("?")[0]?.trim();

  if (!path || path.includes("..") || !path.startsWith("posts/")) {
    return null;
  }

  return path;
}

type UploadJournalCoverFileInput = {
  storagePath: string;
  buffer: Buffer;
  contentType: string;
};

export async function uploadJournalCoverFile(
  input: UploadJournalCoverFileInput,
): Promise<{ ok: true; publicUrl: string } | { ok: false; message: string }> {
  if (
    input.storagePath.includes("..") ||
    input.storagePath.startsWith("/") ||
    !input.storagePath.startsWith("posts/")
  ) {
    return { ok: false, message: "Invalid storage path." };
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.storage
    .from(JOURNAL_COVERS_BUCKET)
    .upload(input.storagePath, input.buffer, {
      contentType: input.contentType,
      upsert: true,
    });

  if (error) {
    return { ok: false, message: "The cover image could not be uploaded." };
  }

  return {
    ok: true,
    publicUrl: buildJournalCoverPublicUrl(input.storagePath),
  };
}

export async function deleteJournalCoverFile(
  storagePath: string | null | undefined,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const trimmed = storagePath?.trim();

  if (!trimmed) {
    return { ok: true };
  }

  if (
    trimmed.includes("..") ||
    trimmed.startsWith("/") ||
    !trimmed.startsWith("posts/")
  ) {
    return { ok: false, message: "Invalid storage path." };
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.storage
    .from(JOURNAL_COVERS_BUCKET)
    .remove([trimmed]);

  if (error) {
    return { ok: false, message: "The cover image could not be deleted." };
  }

  return { ok: true };
}
