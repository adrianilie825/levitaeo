import { DEFAULT_IMPORT_FILE_TYPE, DEFAULT_IMPORT_RESOLUTION } from "@/lib/catalog-import/constants";
import {
  formatDimensions,
  type ImageDimensions,
} from "@/lib/catalog-import/image-dimensions";
import type { ProductJson, ResolvedProductMetadata } from "@/lib/catalog-import/metadata";

export type ImportAssetForMetadata = {
  dimensions: ImageDimensions;
  extension: string;
  variant: {
    key: string;
  };
};

function extensionToCatalogFileType(extension: string): string {
  const normalized = extension.trim().toLowerCase();

  if (normalized === "png") {
    return "PNG";
  }

  if (normalized === "jpg" || normalized === "jpeg") {
    return "JPG";
  }

  return normalized.toUpperCase();
}

export function selectPrimaryImportAsset<T extends ImportAssetForMetadata>(
  assets: T[],
): T | undefined {
  return (
    assets.find((asset) => asset.variant.key === "color") ?? assets[0]
  );
}

export function deriveImportResolutionFromAssets(
  assets: ImportAssetForMetadata[],
): string | null {
  const primary = selectPrimaryImportAsset(assets);

  if (!primary) {
    return null;
  }

  return `${formatDimensions(primary.dimensions)} px`;
}

export function deriveImportFileTypeFromAssets(
  assets: ImportAssetForMetadata[],
): string {
  if (assets.length === 0) {
    return DEFAULT_IMPORT_FILE_TYPE;
  }

  const fileTypes = new Set(
    assets.map((asset) => extensionToCatalogFileType(asset.extension)),
  );

  if (fileTypes.size === 1) {
    return [...fileTypes][0]!;
  }

  const primary = selectPrimaryImportAsset(assets);
  return primary
    ? extensionToCatalogFileType(primary.extension)
    : DEFAULT_IMPORT_FILE_TYPE;
}

export function applyAssetDerivedTechnicalMetadata(
  metadata: ResolvedProductMetadata,
  assets: ImportAssetForMetadata[],
  productJson: ProductJson | null | undefined,
): ResolvedProductMetadata {
  const explicitResolution = productJson?.resolution?.trim();
  const explicitFileType = productJson?.file_type?.trim();

  const derivedResolution = deriveImportResolutionFromAssets(assets);
  const derivedFileType = deriveImportFileTypeFromAssets(assets);

  return {
    ...metadata,
    resolution:
      explicitResolution ||
      derivedResolution ||
      metadata.resolution ||
      DEFAULT_IMPORT_RESOLUTION,
    fileType:
      explicitFileType ||
      derivedFileType ||
      metadata.fileType ||
      DEFAULT_IMPORT_FILE_TYPE,
  };
}
