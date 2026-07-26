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
import type {
  CatalogCollectionRow,
  CatalogProductRow,
} from "@/types/database";

export type AdminProductRow = CatalogProductRow & {
  collections: Pick<CatalogCollectionRow, "id" | "slug" | "name"> | null;
};

export type AdminProductFilters = {
  status?: string;
  collectionId?: string;
  featured?: boolean;
  query?: string;
};

export type ProductWriteInput = {
  collection_id: string;
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
  stripe_price_id: string | null;
  sort_order: number;
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

  if (filters.featured === true) {
    query = query.eq("is_featured", true);
  } else if (filters.featured === false) {
    query = query.eq("is_featured", false);
  }

  const [{ data, error }, collections] = await Promise.all([
    query,
    listAdminCollections(),
  ]);

  if (error) {
    throw new Error(error.message);
  }

  const collectionById = new Map(
    collections.map((collection) => [collection.id, collection]),
  );

  let rows: AdminProductRow[] = (data ?? []).map((product) => ({
    ...(product as CatalogProductRow),
    collections: collectionById.get(product.collection_id) ?? null,
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

  return {
    ...(data as CatalogProductRow),
    collections: collection
      ? { id: collection.id, slug: collection.slug, name: collection.name }
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
  product: Pick<AdminProductRow, "slug" | "status" | "collections">,
): string | null {
  if (!["published", "coming_soon"].includes(product.status)) {
    return null;
  }

  const collectionSlug = product.collections?.slug ?? "originals";
  return `/collections/${collectionSlug}/${product.slug}`;
}
