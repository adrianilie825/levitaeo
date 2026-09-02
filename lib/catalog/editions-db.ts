import "server-only";

import { createCatalogClient } from "@/lib/supabase/catalog";
import { isSupabasePublicConfigured } from "@/lib/supabase/env";
import { filterPublicCatalogEditions } from "@/lib/catalog/public-catalog-visibility";
import type { CatalogProductRow } from "@/types/database";
import type { Edition } from "@/types/catalog";

const PUBLIC_EDITION_COLUMNS =
  "id, collection_id, volume_id, slug, title, subtitle, description, price_cents, currency, image_url, thumbnail_url, edition, resolution, file_type, status, is_featured, stripe_price_id, sort_order, created_at" as const;

export async function getPublicEditionBySlug(slug: string): Promise<Edition | null> {
  const normalizedSlug = slug.trim().toLowerCase();

  if (!normalizedSlug || !isSupabasePublicConfigured()) {
    return null;
  }

  const supabase = createCatalogClient();
  const { data, error } = await supabase
    .from("products")
    .select(PUBLIC_EDITION_COLUMNS)
    .eq("slug", normalizedSlug)
    .in("status", ["published", "coming_soon"])
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const edition = data as CatalogProductRow;

  return filterPublicCatalogEditions([edition])[0] ?? null;
}

export async function listPublicEditionsByVolumeId(
  volumeId: string,
): Promise<Edition[]> {
  if (!volumeId || !isSupabasePublicConfigured()) {
    return [];
  }

  const supabase = createCatalogClient();
  const { data, error } = await supabase
    .from("products")
    .select(PUBLIC_EDITION_COLUMNS)
    .eq("volume_id", volumeId)
    .in("status", ["published", "coming_soon"])
    .order("sort_order", { ascending: true });

  if (error || !data) {
    return [];
  }

  return filterPublicCatalogEditions(data as CatalogProductRow[]);
}

export async function listPublicEditionsByVolumeSlugs(input: {
  collectionSlug: string;
  volumeSlug: string;
}): Promise<Edition[]> {
  if (!isSupabasePublicConfigured()) {
    return [];
  }

  const supabase = createCatalogClient();

  const { data: collection } = await supabase
    .from("collections")
    .select("id")
    .eq("slug", input.collectionSlug.trim().toLowerCase())
    .maybeSingle();

  if (!collection) {
    return [];
  }

  const { data: volume } = await supabase
    .from("volumes")
    .select("id")
    .eq("collection_id", collection.id)
    .eq("slug", input.volumeSlug.trim().toLowerCase())
    .maybeSingle();

  if (!volume) {
    return [];
  }

  return listPublicEditionsByVolumeId(volume.id);
}
