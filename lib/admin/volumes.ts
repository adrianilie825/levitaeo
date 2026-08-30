import "server-only";

import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { CatalogCollectionRow, CatalogVolumeRow } from "@/types/database";
import { normalizeSlug } from "@/lib/admin/validation";

export type AdminVolumeRow = CatalogVolumeRow & {
  collections: Pick<CatalogCollectionRow, "id" | "slug" | "name"> | null;
};

export type VolumeWriteInput = {
  collection_id: string;
  slug: string;
  name: string;
  description: string;
  sort_order: number;
};

function getAdminClient() {
  return getSupabaseAdmin();
}

export async function listAdminVolumes(
  collectionId?: string,
): Promise<AdminVolumeRow[]> {
  const supabase = getAdminClient();
  let query = supabase
    .from("volumes")
    .select(
      "id, collection_id, slug, name, description, sort_order, created_at",
    )
    .order("sort_order", { ascending: true });

  if (collectionId) {
    query = query.eq("collection_id", collectionId);
  }

  const [{ data, error }, collections] = await Promise.all([
    query,
    supabase.from("collections").select("id, slug, name"),
  ]);

  if (error) {
    throw new Error(error.message);
  }

  const collectionById = new Map(
    (collections.data ?? []).map((collection) => [collection.id, collection]),
  );

  return (data ?? []).map((volume) => ({
    ...(volume as CatalogVolumeRow),
    collections: collectionById.get(volume.collection_id) ?? null,
  }));
}

export async function getAdminVolumeById(
  id: string,
): Promise<AdminVolumeRow | null> {
  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from("volumes")
    .select(
      "id, collection_id, slug, name, description, sort_order, created_at",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  const { data: collection } = await supabase
    .from("collections")
    .select("id, slug, name")
    .eq("id", data.collection_id)
    .maybeSingle();

  return {
    ...(data as CatalogVolumeRow),
    collections: collection ?? null,
  };
}

export async function isVolumeSlugTaken(
  collectionId: string,
  slug: string,
  excludeId?: string,
): Promise<boolean> {
  const supabase = getAdminClient();
  let query = supabase
    .from("volumes")
    .select("id")
    .eq("collection_id", collectionId)
    .eq("slug", slug);

  if (excludeId) {
    query = query.neq("id", excludeId);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return Boolean(data);
}

export async function createAdminVolume(
  input: VolumeWriteInput,
): Promise<CatalogVolumeRow> {
  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from("volumes")
    .insert(input)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as CatalogVolumeRow;
}

export async function updateAdminVolume(
  id: string,
  input: VolumeWriteInput,
): Promise<CatalogVolumeRow> {
  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from("volumes")
    .update(input)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as CatalogVolumeRow;
}

export async function deleteAdminVolume(id: string): Promise<void> {
  const supabase = getAdminClient();

  const { count, error: countError } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("volume_id", id);

  if (countError) {
    throw new Error(countError.message);
  }

  if ((count ?? 0) > 0) {
    throw new Error("Cannot delete a volume that still contains editions.");
  }

  const { error } = await supabase.from("volumes").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function getDefaultVolumeForCollection(
  collectionId: string,
): Promise<CatalogVolumeRow | null> {
  const supabase = getAdminClient();

  const { data: collection, error: collectionError } = await supabase
    .from("collections")
    .select("slug")
    .eq("id", collectionId)
    .maybeSingle();

  if (collectionError || !collection) {
    return null;
  }

  const defaultSlug = `${collection.slug}-default`;

  const { data, error } = await supabase
    .from("volumes")
    .select("*")
    .eq("collection_id", collectionId)
    .eq("slug", defaultSlug)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data as CatalogVolumeRow | null) ?? null;
}

export function parseVolumeWriteBody(body: Record<string, unknown>): {
  input: VolumeWriteInput | null;
  error?: string;
} {
  const collectionId = String(body.collectionId ?? body.collection_id ?? "").trim();
  const slug = normalizeSlug(String(body.slug ?? ""));
  const name = String(body.name ?? "").trim();
  const description = String(body.description ?? "").trim();
  const sortOrderRaw = String(body.sortOrder ?? body.sort_order ?? "0").trim();
  const sortOrder = Number.parseInt(sortOrderRaw, 10);

  if (!collectionId) {
    return { input: null, error: "collectionId is required." };
  }

  if (!slug) {
    return { input: null, error: "slug is required." };
  }

  if (!name) {
    return { input: null, error: "name is required." };
  }

  if (!Number.isFinite(sortOrder)) {
    return { input: null, error: "sortOrder must be a number." };
  }

  return {
    input: {
      collection_id: collectionId,
      slug,
      name,
      description,
      sort_order: sortOrder,
    },
  };
}
