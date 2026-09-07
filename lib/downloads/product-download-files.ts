import "server-only";

import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type {
  ProductDownloadFileInsert,
  ProductDownloadFileRow,
} from "@/types/database";

export type ProductDownloadFileSummary = {
  variantKey: string;
  displayName: string;
  filename: string;
  sortOrder: number;
};

export type ProductDownloadAvailability = {
  hasLegacyDownload: boolean;
  files: ProductDownloadFileSummary[];
};

function mapDownloadFileSummary(
  row: Pick<
    ProductDownloadFileRow,
    "variant_key" | "display_name" | "filename" | "sort_order"
  >,
): ProductDownloadFileSummary {
  return {
    variantKey: row.variant_key,
    displayName: row.display_name,
    filename: row.filename,
    sortOrder: row.sort_order,
  };
}

export async function listProductDownloadFiles(
  productId: string,
): Promise<ProductDownloadFileRow[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("product_download_files")
    .select("*")
    .eq("product_id", productId)
    .order("sort_order", { ascending: true })
    .order("variant_key", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as ProductDownloadFileRow[];
}

export async function getProductDownloadFileByVariant(
  productId: string,
  variantKey: string,
): Promise<ProductDownloadFileRow | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("product_download_files")
    .select("*")
    .eq("product_id", productId)
    .eq("variant_key", variantKey)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data as ProductDownloadFileRow | null) ?? null;
}

export async function listProductDownloadSummariesForProducts(
  productIds: string[],
): Promise<Map<string, ProductDownloadFileSummary[]>> {
  const result = new Map<string, ProductDownloadFileSummary[]>();

  if (productIds.length === 0) {
    return result;
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("product_download_files")
    .select("product_id, variant_key, display_name, filename, sort_order")
    .in("product_id", productIds)
    .order("sort_order", { ascending: true })
    .order("variant_key", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  for (const row of data ?? []) {
    const productId = row.product_id as string;
    const existing = result.get(productId) ?? [];
    existing.push(
      mapDownloadFileSummary(
        row as Pick<
          ProductDownloadFileRow,
          "variant_key" | "display_name" | "filename" | "sort_order"
        >,
      ),
    );
    result.set(productId, existing);
  }

  return result;
}

export async function getLegacyDownloadConfigured(
  productIds: string[],
): Promise<Map<string, boolean>> {
  const result = new Map<string, boolean>();

  if (productIds.length === 0) {
    return result;
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("products")
    .select("id, download_storage_path")
    .in("id", productIds);

  if (error) {
    throw new Error(error.message);
  }

  for (const row of data ?? []) {
    result.set(
      row.id as string,
      Boolean((row.download_storage_path as string | null)?.trim()),
    );
  }

  return result;
}

export async function getProductDownloadAvailability(
  productIds: string[],
): Promise<Map<string, ProductDownloadAvailability>> {
  const [filesByProduct, legacyByProduct] = await Promise.all([
    listProductDownloadSummariesForProducts(productIds),
    getLegacyDownloadConfigured(productIds),
  ]);

  const result = new Map<string, ProductDownloadAvailability>();

  for (const productId of productIds) {
    result.set(productId, {
      hasLegacyDownload: legacyByProduct.get(productId) ?? false,
      files: filesByProduct.get(productId) ?? [],
    });
  }

  return result;
}

export async function upsertProductDownloadFile(
  input: ProductDownloadFileInsert,
): Promise<ProductDownloadFileRow> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("product_download_files")
    .upsert(input, { onConflict: "product_id,variant_key" })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as ProductDownloadFileRow;
}

export async function deleteProductDownloadFile(
  productId: string,
  variantKey: string,
): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("product_download_files")
    .delete()
    .eq("product_id", productId)
    .eq("variant_key", variantKey);

  if (error) {
    throw new Error(error.message);
  }
}
