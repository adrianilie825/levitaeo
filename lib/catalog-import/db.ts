import { getSupabaseAdmin } from "@/lib/supabase/admin-core";
import type { CatalogCollectionRow, CatalogProductRow } from "@/types/database";
import { DEFAULT_IMPORT_STATUS } from "@/lib/catalog-import/constants";
import type { ResolvedProductMetadata } from "@/lib/catalog-import/metadata";

export type ExistingImportProduct = Pick<
  CatalogProductRow,
  "id" | "slug" | "collection_id" | "status" | "volume_id"
>;

export async function getCollectionBySlug(
  slug: string,
): Promise<CatalogCollectionRow | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("collections")
    .select("id, slug, name, description, sort_order, created_at")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data as CatalogCollectionRow | null) ?? null;
}

export async function getDefaultVolumeIdForCollection(
  collectionId: string,
  collectionSlug: string,
): Promise<string> {
  const supabase = getSupabaseAdmin();
  const defaultSlug = `${collectionSlug}-default`;
  const { data, error } = await supabase
    .from("volumes")
    .select("id")
    .eq("collection_id", collectionId)
    .eq("slug", defaultSlug)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data?.id) {
    throw new Error(
      `Default volume "${defaultSlug}" was not found for collection "${collectionSlug}".`,
    );
  }

  return data.id as string;
}

export async function getProductBySlug(
  slug: string,
): Promise<ExistingImportProduct | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("products")
    .select("id, slug, collection_id, status, volume_id")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data as ExistingImportProduct | null) ?? null;
}

export type UpsertImportProductInput = {
  collectionId: string;
  volumeId: string;
  metadata: ResolvedProductMetadata;
};

export async function createImportProduct(
  input: UpsertImportProductInput,
): Promise<CatalogProductRow> {
  const supabase = getSupabaseAdmin();
  const { metadata, collectionId, volumeId } = input;

  const { data, error } = await supabase
    .from("products")
    .insert({
      collection_id: collectionId,
      volume_id: volumeId,
      slug: metadata.slug,
      title: metadata.title,
      subtitle: metadata.subtitle,
      description: metadata.description,
      price_cents: metadata.priceCents,
      currency: metadata.currency,
      edition: metadata.edition,
      resolution: metadata.resolution,
      file_type: metadata.fileType,
      status: DEFAULT_IMPORT_STATUS,
      sort_order: metadata.sortOrder,
      seo_title: metadata.seoTitle,
      seo_description: metadata.seoDescription,
      preview_alt_text: metadata.previewAltText,
      image_url: "",
      thumbnail_url: "",
      is_featured: false,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as CatalogProductRow;
}

export async function updateImportProduct(
  productId: string,
  input: UpsertImportProductInput,
): Promise<CatalogProductRow> {
  const supabase = getSupabaseAdmin();
  const { metadata, collectionId, volumeId } = input;

  const { data, error } = await supabase
    .from("products")
    .update({
      collection_id: collectionId,
      volume_id: volumeId,
      title: metadata.title,
      subtitle: metadata.subtitle,
      description: metadata.description,
      price_cents: metadata.priceCents,
      currency: metadata.currency,
      edition: metadata.edition,
      resolution: metadata.resolution,
      file_type: metadata.fileType,
      sort_order: metadata.sortOrder,
      seo_title: metadata.seoTitle,
      seo_description: metadata.seoDescription,
      preview_alt_text: metadata.previewAltText,
    })
    .eq("id", productId)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as CatalogProductRow;
}

export async function updateImportProductPreviewUrls(
  productId: string,
  imageUrl: string,
): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("products")
    .update({
      image_url: imageUrl,
      thumbnail_url: imageUrl,
    })
    .eq("id", productId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function getImportProductDownloadFile(
  productId: string,
  variantKey: string,
): Promise<{ storage_path: string | null } | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("product_download_files")
    .select("storage_path")
    .eq("product_id", productId)
    .eq("variant_key", variantKey)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data as { storage_path: string | null } | null) ?? null;
}

export async function upsertImportProductDownloadFile(input: {
  product_id: string;
  variant_key: string;
  display_name: string;
  storage_path: string;
  filename: string;
  mime_type: string;
  size_bytes: number;
  version: string;
  sort_order: number;
}): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("product_download_files")
    .upsert(input, { onConflict: "product_id,variant_key" });

  if (error) {
    throw new Error(error.message);
  }
}

export async function assertImportProductWritable(input: {
  metadata: ResolvedProductMetadata;
  collectionId: string;
  existing: ExistingImportProduct | null;
}): Promise<"create" | "update"> {
  const { existing, collectionId, metadata } = input;

  if (!existing) {
    return "create";
  }

  if (existing.collection_id !== collectionId) {
    throw new Error(
      `Slug "${metadata.slug}" already belongs to another collection. Refusing import.`,
    );
  }

  if (existing.status === "published") {
    throw new Error(
      `Product "${metadata.slug}" is published. Refusing overwrite. Unpublish in Admin before re-importing.`,
    );
  }

  return "update";
}
