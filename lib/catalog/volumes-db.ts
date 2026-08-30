import "server-only";

import { createCatalogClient } from "@/lib/supabase/catalog";
import { isSupabasePublicConfigured } from "@/lib/supabase/env";
import type { CatalogVolumeRow } from "@/types/database";
import type { Volume } from "@/types/catalog";

export const CATALOG_VOLUMES_TAG = "catalog-volumes";

type VolumeWithCollection = Volume;

function mapVolumeRow(
  row: CatalogVolumeRow,
  collection?: VolumeWithCollection["collection"],
): VolumeWithCollection {
  return {
    ...row,
    collection: collection ?? null,
  };
}

export async function listPublicVolumesByCollectionSlug(
  collectionSlug: string,
): Promise<VolumeWithCollection[]> {
  const normalizedSlug = collectionSlug.trim().toLowerCase();

  if (!normalizedSlug || !isSupabasePublicConfigured()) {
    return [];
  }

  const supabase = createCatalogClient();

  const { data: collection, error: collectionError } = await supabase
    .from("collections")
    .select("id, slug, name")
    .eq("slug", normalizedSlug)
    .maybeSingle();

  if (collectionError || !collection) {
    return [];
  }

  const { data, error } = await supabase
    .from("volumes")
    .select("id, collection_id, slug, name, description, sort_order, created_at")
    .eq("collection_id", collection.id)
    .order("sort_order", { ascending: true });

  if (error || !data) {
    return [];
  }

  return data.map((row) =>
    mapVolumeRow(row as CatalogVolumeRow, {
      id: collection.id,
      slug: collection.slug,
      name: collection.name,
    }),
  );
}

export async function getPublicVolumeBySlugs(input: {
  collectionSlug: string;
  volumeSlug: string;
}): Promise<VolumeWithCollection | null> {
  const collectionSlug = input.collectionSlug.trim().toLowerCase();
  const volumeSlug = input.volumeSlug.trim().toLowerCase();

  if (!collectionSlug || !volumeSlug || !isSupabasePublicConfigured()) {
    return null;
  }

  const supabase = createCatalogClient();

  const { data: collection, error: collectionError } = await supabase
    .from("collections")
    .select("id, slug, name")
    .eq("slug", collectionSlug)
    .maybeSingle();

  if (collectionError || !collection) {
    return null;
  }

  const { data, error } = await supabase
    .from("volumes")
    .select("id, collection_id, slug, name, description, sort_order, created_at")
    .eq("collection_id", collection.id)
    .eq("slug", volumeSlug)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return mapVolumeRow(data as CatalogVolumeRow, {
    id: collection.id,
    slug: collection.slug,
    name: collection.name,
  });
}

export async function listPublicCollections() {
  if (!isSupabasePublicConfigured()) {
    return [];
  }

  const supabase = createCatalogClient();
  const { data, error } = await supabase
    .from("collections")
    .select("id, slug, name, description, sort_order, created_at")
    .order("sort_order", { ascending: true });

  if (error || !data) {
    return [];
  }

  return data;
}
