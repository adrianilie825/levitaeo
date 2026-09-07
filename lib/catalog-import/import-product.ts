import {
  assertImportProductWritable,
  createImportProduct,
  getCollectionBySlug,
  getDefaultVolumeIdForCollection,
  getProductBySlug,
  updateImportProduct,
  updateImportProductPreviewUrls,
  getImportProductDownloadFile,
  upsertImportProductDownloadFile,
} from "@/lib/catalog-import/db";
import {
  buildDeliveryFilename,
  buildDeliveryStoragePath,
  buildPreviewStoragePath,
  createImportVersion,
  deletePrivateStorageObject,
  uploadPrivateDeliveryFile,
  uploadPublicPreviewFile,
} from "@/lib/catalog-import/storage";
import { selectPrimaryImportAsset } from "@/lib/catalog-import/asset-metadata";
import type { ValidatedProductImport } from "@/lib/catalog-import/validate";

export type ImportProductResult = {
  action: "created" | "updated" | "dry-run";
  slug: string;
  title: string;
  productId?: string;
  assetCount: number;
};

function getPreviewAsset(importData: ValidatedProductImport) {
  return selectPrimaryImportAsset(importData.assets);
}

export async function importValidatedProduct(
  importData: ValidatedProductImport,
  options: { dryRun: boolean },
): Promise<ImportProductResult> {
  const { folder, metadata, assets } = importData;
  const collection = await getCollectionBySlug(folder.collectionSlug);

  if (!collection) {
    throw new Error(
      `Collection "${folder.collectionSlug}" was not found in Supabase.`,
    );
  }

  const existing = await getProductBySlug(metadata.slug);
  const writeAction = await assertImportProductWritable({
    metadata,
    collectionId: collection.id,
    existing,
  });

  if (options.dryRun) {
    return {
      action: "dry-run",
      slug: metadata.slug,
      title: metadata.title,
      assetCount: assets.length,
    };
  }

  const volumeId = await getDefaultVolumeIdForCollection(
    collection.id,
    collection.slug,
  );

  const upsertInput = {
    collectionId: collection.id,
    volumeId,
    metadata,
  };

  const product =
    writeAction === "create"
      ? await createImportProduct(upsertInput)
      : await updateImportProduct(existing!.id, upsertInput);

  const version = createImportVersion();
  const previewAsset = getPreviewAsset(importData);

  if (previewAsset) {
    const previewStoragePath = buildPreviewStoragePath(product.id, version);
    const previewUrl = await uploadPublicPreviewFile({
      storagePath: previewStoragePath,
      absolutePath: previewAsset.absolutePath,
      mimeType: previewAsset.mimeType,
    });

    await updateImportProductPreviewUrls(product.id, previewUrl);
  }

  for (const asset of assets) {
    const extension = asset.extension;
    const storagePath = buildDeliveryStoragePath(
      product.id,
      asset.variant.key,
      version,
      extension,
    );
    const previousFile = await getImportProductDownloadFile(
      product.id,
      asset.variant.key,
    );

    await uploadPrivateDeliveryFile({
      storagePath,
      absolutePath: asset.absolutePath,
      mimeType: asset.mimeType,
    });

    await upsertImportProductDownloadFile({
      product_id: product.id,
      variant_key: asset.variant.key,
      display_name: asset.displayName,
      storage_path: storagePath,
      filename: buildDeliveryFilename(asset.variant.key, version, extension),
      mime_type: asset.mimeType,
      size_bytes: asset.sizeBytes,
      version,
      sort_order: asset.variant.sortOrder,
    });

    if (
      previousFile?.storage_path &&
      previousFile.storage_path !== storagePath
    ) {
      try {
        await deletePrivateStorageObject(previousFile.storage_path);
      } catch {
        // Best-effort cleanup; re-import can be run again safely.
      }
    }
  }

  return {
    action: writeAction === "create" ? "created" : "updated",
    slug: metadata.slug,
    title: metadata.title,
    productId: product.id,
    assetCount: assets.length,
  };
}
