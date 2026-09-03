import type { Product } from "@/types/product";

export type ArtworkMetadataItem = {
  label: string;
  value: string;
};

export function parseAspectRatio(resolution?: string): number | undefined {
  if (!resolution?.trim()) {
    return undefined;
  }

  const match = resolution.trim().match(/(\d+)\s*[x×]\s*(\d+)/i);

  if (!match) {
    return undefined;
  }

  const width = Number.parseInt(match[1], 10);
  const height = Number.parseInt(match[2], 10);

  if (width <= 0 || height <= 0) {
    return undefined;
  }

  return width / height;
}

export function formatArtworkPrice(
  product: Pick<Product, "price" | "currency">,
): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: product.currency,
  }).format(product.price);
}

export function getArtworkMetadataItems(product: Product): ArtworkMetadataItem[] {
  const items: ArtworkMetadataItem[] = [];

  if (product.resolution?.trim()) {
    items.push({ label: "Resolution", value: product.resolution.trim() });
  }

  if (product.fileType?.trim()) {
    items.push({ label: "File type", value: product.fileType.trim() });
  }

  if (product.edition?.trim()) {
    items.push({ label: "Edition", value: product.edition.trim() });
  }

  if (product.collection?.trim()) {
    items.push({ label: "Collection", value: product.collection.trim() });
  }

  if (product.license?.trim()) {
    items.push({ label: "License", value: product.license.trim() });
  }

  return items;
}

/** Digital specifications for the detail panel — excludes edition when shown in the identity block. */
export function getDigitalSpecificationItems(
  product: Product,
): ArtworkMetadataItem[] {
  const items: ArtworkMetadataItem[] = [];

  if (product.resolution?.trim()) {
    items.push({ label: "Resolution", value: product.resolution.trim() });
  }

  if (product.fileType?.trim()) {
    items.push({ label: "File type", value: product.fileType.trim() });
  }

  if (product.collection?.trim()) {
    items.push({ label: "Collection", value: product.collection.trim() });
  }

  return items;
}

export function formatEditionLabel(edition: string): string {
  return `Edition ${edition}`;
}

const LEGACY_ARTWORK_DESCRIPTION =
  "A limited digital edition exploring contrast, balance, atmosphere, and visual restraint.";

const NEUTRAL_ARTWORK_DESCRIPTION =
  "A study in contrast, balance, atmosphere, and visual restraint.";

function normalizeArtworkDescription(description: string): string {
  const trimmed = description.trim();

  if (trimmed === LEGACY_ARTWORK_DESCRIPTION) {
    return NEUTRAL_ARTWORK_DESCRIPTION;
  }

  return description;
}

export function getArtworkDescriptionParagraphs(description?: string): string[] {
  if (!description?.trim()) {
    return [];
  }

  return normalizeArtworkDescription(description)
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0);
}

export function getArtworkImageAlt(product: Pick<Product, "title" | "collection">): string {
  return `${product.title} — ${product.collection} digital artwork by Levitaeo`;
}
