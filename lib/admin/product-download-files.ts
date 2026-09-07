import "server-only";

import { listProductDownloadFiles } from "@/lib/downloads/product-download-files";

export type AdminProductDownloadFileSummary = {
  variantKey: string;
  displayName: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  version: string | null;
  sortOrder: number;
};

export async function listAdminProductDownloadFileSummaries(
  productId: string,
): Promise<AdminProductDownloadFileSummary[]> {
  const rows = await listProductDownloadFiles(productId);

  return rows.map((row) => ({
    variantKey: row.variant_key,
    displayName: row.display_name,
    filename: row.filename,
    mimeType: row.mime_type,
    sizeBytes: row.size_bytes,
    version: row.version,
    sortOrder: row.sort_order,
  }));
}
