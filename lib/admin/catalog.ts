import "server-only";

/**
 * Admin catalog writes use the Supabase service-role client (getSupabaseAdmin).
 * Every call site must invoke requireAdmin() first.
 *
 * Migration 004 adds RLS policies on products/collections for authenticated
 * admin_users rows. Until that migration is applied and admin_users is
 * populated, service-role writes remain the supported path, gated by ADMIN_EMAILS.
 */

import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { listAdminVolumes } from "@/lib/admin/volumes";
import type {
  CatalogCollectionRow,
  CatalogProductRow,
  CatalogVolumeRow,
} from "@/types/database";
import { getEditionPathFromHierarchy } from "@/lib/catalog/paths";

export type AdminProductRow = CatalogProductRow & {
  collections: Pick<CatalogCollectionRow, "id" | "slug" | "name"> | null;
  volumes: Pick<CatalogVolumeRow, "id" | "slug" | "name"> | null;
};

export type AdminProductFilters = {
  status?: string;
  collectionId?: string;
  volumeId?: string;
  featured?: boolean;
  query?: string;
};

export type ProductWriteInput = {
  collection_id: string;
  volume_id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  price_cents: number;
  currency: string;
  image_url: string;
  thumbnail_url: string;
  edition: string;
  resolution: string;
  file_type: string;
  status: string;
  is_featured: boolean;
  sort_order: number;
};

export type ProductStripeIdsInput = {
  stripe_product_id: string;
  stripe_price_id: string;
};

export type ProductDownloadMetadataInput = {
  download_storage_path: string;
  download_filename: string;
  download_mime_type: string;
  download_size_bytes: number;
  download_version: string;
};

import type { ProductDeliveryFileSummary } from "@/lib/admin/product-delivery";

export type CollectionWriteInput = {
  name: string;
  description: string;
  sort_order: number;
};

function getAdminClient() {
  return getSupabaseAdmin();
}

export async function listAdminProducts(
  filters: AdminProductFilters = {},
): Promise<AdminProductRow[]> {
  const supabase = getAdminClient();
  let query = supabase
    .from("products")
    .select(
      `
        id,
        collection_id,
        volume_id,
        slug,
        title,
        subtitle,
        description,
        price_cents,
        currency,
        image_url,
        thumbnail_url,
        edition,
        resolution,
        file_type,
        status,
        is_featured,
        stripe_price_id,
        stripe_product_id,
        sort_order,
        download_storage_path,
        download_filename,
        download_mime_type,
        download_size_bytes,
        download_version,
        created_at
      `,
    )
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (filters.status) {
    query = query.eq("status", filters.status);
  }

  if (filters.collectionId) {
    query = query.eq("collection_id", filters.collectionId);
  }

  if (filters.volumeId) {
    query = query.eq("volume_id", filters.volumeId);
  }

  if (filters.featured === true) {
    query = query.eq("is_featured", true);
  } else if (filters.featured === false) {
    query = query.eq("is_featured", false);
  }

  const [{ data, error }, collections, volumes] = await Promise.all([
    query,
    listAdminCollections(),
    listAdminVolumes(),
  ]);

  if (error) {
    throw new Error(error.message);
  }

  const collectionById = new Map(
    collections.map((collection) => [collection.id, collection]),
  );
  const volumeById = new Map(volumes.map((volume) => [volume.id, volume]));

  let rows: AdminProductRow[] = (data ?? []).map((product) => ({
    ...(product as CatalogProductRow),
    collections: collectionById.get(product.collection_id) ?? null,
    volumes: volumeById.get(product.volume_id) ?? null,
  }));

  if (filters.query) {
    const normalizedQuery = filters.query.trim().toLowerCase();

    rows = rows.filter((row) => {
      return (
        row.title.toLowerCase().includes(normalizedQuery) ||
        row.slug.toLowerCase().includes(normalizedQuery)
      );
    });
  }

  return rows;
}

export async function getAdminProductById(
  id: string,
): Promise<AdminProductRow | null> {
  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      `
        id,
        collection_id,
        volume_id,
        slug,
        title,
        subtitle,
        description,
        price_cents,
        currency,
        image_url,
        thumbnail_url,
        edition,
        resolution,
        file_type,
        status,
        is_featured,
        stripe_price_id,
        stripe_product_id,
        sort_order,
        download_storage_path,
        download_filename,
        download_mime_type,
        download_size_bytes,
        download_version,
        created_at
      `,
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  const collections = await listAdminCollections();
  const collection =
    collections.find((item) => item.id === data.collection_id) ?? null;
  const volumes = await listAdminVolumes();
  const volume = volumes.find((item) => item.id === data.volume_id) ?? null;

  return {
    ...(data as CatalogProductRow),
    collections: collection
      ? { id: collection.id, slug: collection.slug, name: collection.name }
      : null,
    volumes: volume
      ? { id: volume.id, slug: volume.slug, name: volume.name }
      : null,
  };
}

export async function isProductSlugTaken(
  slug: string,
  excludeId?: string,
): Promise<boolean> {
  const supabase = getAdminClient();
  let query = supabase.from("products").select("id").eq("slug", slug);

  if (excludeId) {
    query = query.neq("id", excludeId);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return Boolean(data);
}

export async function createAdminProduct(
  input: ProductWriteInput,
): Promise<CatalogProductRow> {
  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from("products")
    .insert(input)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as CatalogProductRow;
}

export async function updateAdminProduct(
  id: string,
  input: ProductWriteInput,
): Promise<CatalogProductRow> {
  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from("products")
    .update(input)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as CatalogProductRow;
}

export async function updateAdminProductDownloadMetadata(
  id: string,
  input: ProductDownloadMetadataInput,
): Promise<CatalogProductRow> {
  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from("products")
    .update(input)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as CatalogProductRow;
}

export async function clearAdminProductDownloadMetadata(
  id: string,
): Promise<CatalogProductRow> {
  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from("products")
    .update({
      download_storage_path: null,
      download_filename: null,
      download_mime_type: null,
      download_size_bytes: null,
      download_version: null,
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as CatalogProductRow;
}

export function getProductDeliveryFileSummary(
  product: Pick<
    CatalogProductRow,
    | "download_storage_path"
    | "download_filename"
    | "download_mime_type"
    | "download_size_bytes"
    | "download_version"
  >,
): ProductDeliveryFileSummary {
  const configured = Boolean(product.download_storage_path?.trim());

  return {
    configured,
    filename: product.download_filename,
    mimeType: product.download_mime_type,
    sizeBytes: product.download_size_bytes,
    version: product.download_version,
    storagePath: product.download_storage_path,
  };
}

export async function listAdminCollections(): Promise<CatalogCollectionRow[]> {
  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from("collections")
    .select("id, slug, name, description, sort_order, created_at")
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as CatalogCollectionRow[];
}

export async function updateAdminProductStripeIds(
  id: string,
  input: ProductStripeIdsInput,
): Promise<CatalogProductRow> {
  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from("products")
    .update({
      stripe_product_id: input.stripe_product_id,
      stripe_price_id: input.stripe_price_id,
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as CatalogProductRow;
}

export async function updateAdminProductImageUrls(
  id: string,
  imageUrl: string,
  thumbnailUrl: string,
): Promise<CatalogProductRow> {
  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from("products")
    .update({
      image_url: imageUrl,
      thumbnail_url: thumbnailUrl,
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as CatalogProductRow;
}

export async function updateAdminProductStatus(
  id: string,
  status: string,
): Promise<CatalogProductRow> {
  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from("products")
    .update({ status })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as CatalogProductRow;
}

export async function deleteAdminProduct(id: string): Promise<void> {
  const supabase = getAdminClient();
  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function updateAdminCollection(
  id: string,
  input: CollectionWriteInput,
): Promise<CatalogCollectionRow> {
  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from("collections")
    .update(input)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as CatalogCollectionRow;
}

export function getPublicProductPath(
  product: Pick<
    AdminProductRow,
    "slug" | "status" | "collections" | "volumes"
  >,
): string | null {
  if (!["published", "coming_soon"].includes(product.status)) {
    return null;
  }

  const collectionSlug = product.collections?.slug ?? "originals";
  const volumeSlug = product.volumes?.slug;

  if (volumeSlug) {
    return getEditionPathFromHierarchy({
      collectionSlug,
      volumeSlug,
      editionSlug: product.slug,
      preferLegacy: volumeSlug.endsWith("-default"),
    });
  }

  return `/collections/${collectionSlug}/${product.slug}`;
}
