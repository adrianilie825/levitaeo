import path from "path";
import {
  DEFAULT_IMPORT_CURRENCY,
  DEFAULT_IMPORT_FILE_TYPE,
  DEFAULT_IMPORT_PRICE_CENTS,
  DEFAULT_IMPORT_RESOLUTION,
  DEFAULT_IMPORT_STATUS,
  type CatalogImportVariant,
} from "@/lib/catalog-import/constants";
import {
  folderNameToTitle,
  normalizeImportSlug,
  readJsonFile,
  getCatalogImportRoot,
} from "@/lib/catalog-import/paths";
import type { DiscoveredProductFolder } from "@/lib/catalog-import/discover";

type DefaultsJson = {
  price?: string | number;
  currency?: string;
  resolution?: string;
  file_type?: string;
  edition?: string;
  subtitle?: string;
  description?: string;
  sort_order?: number;
};

export type ProductJson = {
  title?: string;
  slug?: string;
  subtitle?: string;
  description?: string;
  price?: string | number;
  currency?: string;
  edition?: string;
  resolution?: string;
  file_type?: string;
  sort_order?: number;
  display_names?: Record<string, string>;
};

export type ResolvedProductMetadata = {
  title: string;
  slug: string;
  subtitle: string;
  description: string;
  priceCents: number;
  currency: string;
  edition: string;
  resolution: string;
  fileType: string;
  status: typeof DEFAULT_IMPORT_STATUS;
  sortOrder: number;
  variantDisplayNames: Map<string, string>;
};

function parsePriceToCents(value: string | number | undefined): number | null {
  if (value == null) {
    return null;
  }

  if (typeof value === "number") {
    if (!Number.isFinite(value) || value < 0) {
      return null;
    }

    return Math.round(value * 100);
  }

  const normalized = value.replace(",", ".").trim();

  if (!normalized) {
    return null;
  }

  const amount = Number(normalized);

  if (!Number.isFinite(amount) || amount < 0) {
    return null;
  }

  return Math.round(amount * 100);
}

function mergeDefaults(
  ...sources: Array<DefaultsJson | ProductJson | null | undefined>
): DefaultsJson {
  return Object.assign({}, ...sources.filter(Boolean));
}

function loadDefaults(relativePaths: string[]): DefaultsJson {
  const root = getCatalogImportRoot();
  let merged: DefaultsJson = {};

  for (const relativePath of relativePaths) {
    const filePath = path.join(root, relativePath);
    const parsed = readJsonFile<DefaultsJson>(filePath);

    if (parsed) {
      merged = { ...merged, ...parsed };
    }
  }

  return merged;
}

export function resolveProductMetadata(
  folder: DiscoveredProductFolder,
): ResolvedProductMetadata {
  const defaults = mergeDefaults(
    loadDefaults(["defaults.json"]),
    loadDefaults([`${folder.collectionSlug}/defaults.json`]),
    readJsonFile<ProductJson>(
      path.join(folder.absolutePath, "product.json"),
    ),
  );

  const productJson = readJsonFile<ProductJson>(
    path.join(folder.absolutePath, "product.json"),
  );

  const merged = mergeDefaults(defaults, productJson) as ProductJson;
  const slug = normalizeImportSlug(
    merged.slug ?? folder.productFolderName,
  );
  const title = merged.title?.trim() || folderNameToTitle(folder.productFolderName);
  const priceCents =
    parsePriceToCents(merged.price) ?? DEFAULT_IMPORT_PRICE_CENTS;

  const variantDisplayNames = new Map<string, string>();

  for (const variant of folder.variants) {
    const override = productJson?.display_names?.[variant.key]?.trim();

    variantDisplayNames.set(
      variant.key,
      override || variant.displayName,
    );
  }

  return {
    title,
    slug,
    subtitle:
      merged.subtitle?.trim() ||
      `${folder.collectionSlug.charAt(0).toUpperCase()}${folder.collectionSlug.slice(1)} · ${title}`,
    description: merged.description?.trim() ?? "",
    priceCents,
    currency: merged.currency?.trim().toUpperCase() || DEFAULT_IMPORT_CURRENCY,
    edition: merged.edition?.trim() ?? "",
    resolution: merged.resolution?.trim() || DEFAULT_IMPORT_RESOLUTION,
    fileType: merged.file_type?.trim() || DEFAULT_IMPORT_FILE_TYPE,
    status: DEFAULT_IMPORT_STATUS,
    sortOrder:
      typeof merged.sort_order === "number" && Number.isFinite(merged.sort_order)
        ? merged.sort_order
        : 0,
    variantDisplayNames,
  };
}

export function validateResolvedMetadata(metadata: ResolvedProductMetadata): string[] {
  const errors: string[] = [];

  if (!metadata.slug) {
    errors.push("Product slug could not be resolved.");
  }

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(metadata.slug)) {
    errors.push(`Invalid slug "${metadata.slug}".`);
  }

  if (!metadata.title.trim()) {
    errors.push("Product title is required.");
  }

  if (metadata.priceCents < 0) {
    errors.push("Product price must be zero or greater.");
  }

  return errors;
}

export function getVariantDisplayName(
  variant: CatalogImportVariant,
  metadata: ResolvedProductMetadata,
): string {
  return metadata.variantDisplayNames.get(variant.key) ?? variant.displayName;
}
