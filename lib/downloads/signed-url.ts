import "server-only";

import {
  ARTWORK_DOWNLOADS_BUCKET,
  SIGNED_URL_EXPIRY_SECONDS,
} from "@/lib/downloads/constants";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function createArtworkSignedDownloadUrl(
  storagePath: string,
): Promise<{ url: string } | { error: "missing" | "failed" }> {
  const supabase = getSupabaseAdmin();

  const { data: objectList, error: listError } = await supabase.storage
    .from(ARTWORK_DOWNLOADS_BUCKET)
    .list(storagePath.split("/").slice(0, -1).join("/") || "", {
      search: storagePath.split("/").pop(),
      limit: 1,
    });

  if (listError) {
    return { error: "failed" };
  }

  const filename = storagePath.split("/").pop();
  const objectExists = (objectList ?? []).some(
    (item) => item.name === filename,
  );

  if (!objectExists) {
    return { error: "missing" };
  }

  const { data, error } = await supabase.storage
    .from(ARTWORK_DOWNLOADS_BUCKET)
    .createSignedUrl(storagePath, SIGNED_URL_EXPIRY_SECONDS);

  if (error || !data?.signedUrl) {
    return { error: "failed" };
  }

  return { url: data.signedUrl };
}
