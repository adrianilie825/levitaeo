import fs from "fs";
import path from "path";
import {
  COLLECTION_VARIANTS,
  type CatalogImportVariant,
} from "@/lib/catalog-import/constants";
import {
  isDirectory,
  pathExists,
  resolveCatalogImportPath,
} from "@/lib/catalog-import/paths";
import {
  hasAllVariantSources,
  listMissingVariantSources,
} from "@/lib/catalog-import/resolve-source";

export type DiscoveredProductFolder = {
  collectionSlug: string;
  productFolderName: string;
  absolutePath: string;
  variants: CatalogImportVariant[];
};

function getVariantsForCollection(collectionSlug: string): CatalogImportVariant[] {
  return COLLECTION_VARIANTS[collectionSlug] ?? [];
}

function listChildDirectories(parentPath: string): string[] {
  return fs
    .readdirSync(parentPath, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
    .map((entry) => entry.name);
}

export function discoverProductFolder(
  relativePath: string,
): DiscoveredProductFolder {
  const absolutePath = resolveCatalogImportPath(relativePath);
  const segments = relativePath.replace(/\\/g, "/").split("/").filter(Boolean);

  if (segments.length !== 2) {
    throw new Error(
      "Product import path must be collection/product, e.g. skylines/tokyo.",
    );
  }

  const [collectionSlug, productFolderName] = segments;
  const variants = getVariantsForCollection(collectionSlug);

  if (variants.length === 0) {
    throw new Error(
      `Collection "${collectionSlug}" is not configured for catalog import.`,
    );
  }

  if (!pathExists(absolutePath) || !isDirectory(absolutePath)) {
    throw new Error(`Product folder not found: catalog-import/${relativePath}`);
  }

  if (!hasAllVariantSources(absolutePath, variants)) {
    const missing = listMissingVariantSources(absolutePath, variants);

    throw new Error(
      `Missing required files in catalog-import/${relativePath}: ${missing.join("; ")}`,
    );
  }

  return {
    collectionSlug,
    productFolderName,
    absolutePath,
    variants,
  };
}

export function discoverCollectionFolders(
  collectionSlug: string,
): DiscoveredProductFolder[] {
  const collectionPath = resolveCatalogImportPath(collectionSlug);
  const variants = getVariantsForCollection(collectionSlug);

  if (variants.length === 0) {
    throw new Error(
      `Collection "${collectionSlug}" is not configured for catalog import.`,
    );
  }

  if (!pathExists(collectionPath) || !isDirectory(collectionPath)) {
    throw new Error(`Collection folder not found: catalog-import/${collectionSlug}`);
  }

  const discovered: DiscoveredProductFolder[] = [];

  for (const productFolderName of listChildDirectories(collectionPath)) {
    const absolutePath = path.join(collectionPath, productFolderName);

    if (!hasAllVariantSources(absolutePath, variants)) {
      continue;
    }

    discovered.push({
      collectionSlug,
      productFolderName,
      absolutePath,
      variants,
    });
  }

  discovered.sort((a, b) =>
    a.productFolderName.localeCompare(b.productFolderName),
  );

  if (discovered.length === 0) {
    throw new Error(
      `No valid product folders found in catalog-import/${collectionSlug}.`,
    );
  }

  return discovered;
}

export function discoverImportTargets(relativePath: string): DiscoveredProductFolder[] {
  const normalized = relativePath.replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");
  const segments = normalized.split("/").filter(Boolean);

  if (segments.length === 1) {
    return discoverCollectionFolders(segments[0]);
  }

  if (segments.length === 2) {
    return [discoverProductFolder(normalized)];
  }

  throw new Error(
    "Import path must be a collection or collection/product, e.g. skylines or skylines/tokyo.",
  );
}
