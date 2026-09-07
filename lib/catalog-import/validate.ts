import fs from "fs";
import type { CatalogImportVariant } from "@/lib/catalog-import/constants";
import { validateUploadBuffer } from "@/lib/downloads/upload-validation";
import type { DiscoveredProductFolder } from "@/lib/catalog-import/discover";
import {
  formatDimensions,
  isBelowPrintMasterTarget,
  readImageDimensionsFromFile,
  type ImageDimensions,
} from "@/lib/catalog-import/image-dimensions";
import {
  getVariantDisplayName,
  resolveProductMetadata,
  validateResolvedMetadata,
} from "@/lib/catalog-import/metadata";
import { resolveProductVariantSources } from "@/lib/catalog-import/resolve-source";

export type ValidatedImportAsset = {
  variant: CatalogImportVariant;
  absolutePath: string;
  sourceFilename: string;
  extension: string;
  sizeBytes: number;
  mimeType: string;
  displayName: string;
  dimensions: ImageDimensions;
};

export type ValidatedProductImport = {
  folder: DiscoveredProductFolder;
  metadata: ReturnType<typeof resolveProductMetadata>;
  assets: ValidatedImportAsset[];
  printMasterWarnings: string[];
};

function mimeTypeForExtension(extension: string): string {
  return extension === "png" ? "image/png" : "image/jpeg";
}

export function validateProductImport(
  folder: DiscoveredProductFolder,
): { ok: true; value: ValidatedProductImport } | { ok: false; errors: string[] } {
  const metadata = resolveProductMetadata(folder);
  const errors = validateResolvedMetadata(metadata);
  const assets: ValidatedImportAsset[] = [];
  const printMasterWarnings: string[] = [];

  let resolvedSources;

  try {
    resolvedSources = resolveProductVariantSources(
      folder.absolutePath,
      folder.variants,
    );
  } catch (error) {
    errors.push(error instanceof Error ? error.message : String(error));
    return { ok: false, errors };
  }

  for (const source of resolvedSources) {
    const stat = fs.statSync(source.absolutePath);

    if (!stat.isFile()) {
      errors.push(`${source.filename} is not a file.`);
      continue;
    }

    const validation = validateUploadBuffer({
      filename: source.filename,
      reportedMimeType: mimeTypeForExtension(source.extension),
      size: stat.size,
    });

    if (!validation.ok) {
      errors.push(`${source.filename}: ${validation.message}`);
      continue;
    }

    let dimensions: ImageDimensions;

    try {
      dimensions = readImageDimensionsFromFile(
        source.absolutePath,
        source.extension,
      );
    } catch {
      errors.push(`${source.filename}: Could not read image dimensions.`);
      continue;
    }

    if (isBelowPrintMasterTarget(dimensions)) {
      printMasterWarnings.push(
        `${getVariantDisplayName(source.variant, metadata)} (${source.filename}, ${formatDimensions(dimensions)})`,
      );
    }

    assets.push({
      variant: source.variant,
      absolutePath: source.absolutePath,
      sourceFilename: source.filename,
      extension: source.extension,
      sizeBytes: stat.size,
      mimeType: validation.mimeType,
      displayName: getVariantDisplayName(source.variant, metadata),
      dimensions,
    });
  }

  if (assets.length !== folder.variants.length) {
    errors.push("One or more required variant files failed validation.");
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      folder,
      metadata,
      assets,
      printMasterWarnings,
    },
  };
}
