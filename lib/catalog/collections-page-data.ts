import "server-only";

import { COLLECTION_PRESENTATION } from "@/lib/catalog/collection-presentation";
import { getPublicCollectionsWithStats } from "@/lib/catalog/collections-public";
import { getProductPath, getProductsByCollection } from "@/lib/products-db";
import type { Collection } from "@/types/collection";
import type { Product } from "@/types/product";

/** Shared horizontal bounds for every section on /collections. */
export const COLLECTIONS_PAGE_CONTAINER =
  "mx-auto w-full max-w-[1400px] px-6 lg:px-12";

export const COLLECTIONS_DISCOVERY_ORDER = [
  "architecture",
  "nature",
  "botanical",
  "minimal",
  "skylines",
  "originals",
] as const;

export type CollectionsDiscoverySlug =
  (typeof COLLECTIONS_DISCOVERY_ORDER)[number];

/** Editorial cover assets for the discovery page (approved project assets). */
export const COLLECTIONS_DISCOVERY_IMAGES: Record<
  CollectionsDiscoverySlug,
  string
> = {
  architecture: COLLECTION_PRESENTATION.architecture.image,
  nature: "/images/collections/nature-cover.png",
  botanical: COLLECTION_PRESENTATION.botanical.image,
  minimal: "/images/collections/minimal-cover.png",
  skylines: "/images/collections/skylines-cover.png",
  originals: COLLECTION_PRESENTATION.originals.image,
};

export type CollectionsDiscoveryItem = Collection & {
  index: string;
  discoveryImage: string;
};

export type OriginalsGalleryEdition = {
  slug: string;
  title: string;
  edition: string;
  image: string;
  href: string;
};

export type CollectionsDiscoveryPageData = {
  collections: CollectionsDiscoveryItem[];
  originalsGallery: OriginalsGalleryEdition[];
};

const DISCOVERY_INDEX: Record<CollectionsDiscoverySlug, string> = {
  architecture: "01",
  nature: "02",
  botanical: "03",
  minimal: "04",
  skylines: "05",
  originals: "06",
};

function toGalleryEdition(product: Product): OriginalsGalleryEdition {
  return {
    slug: product.slug,
    title: product.title,
    edition: product.edition,
    image: product.image,
    href: getProductPath(product),
  };
}

function pickOriginalsGalleryEditions(products: Product[]): OriginalsGalleryEdition[] {
  const seenImages = new Set<string>();
  const selected: OriginalsGalleryEdition[] = [];

  for (const product of products) {
    if (selected.length >= 3) {
      break;
    }

    const image = product.image.trim();
    if (image && seenImages.has(image)) {
      continue;
    }

    if (image) {
      seenImages.add(image);
    }

    selected.push(toGalleryEdition(product));
  }

  if (selected.length >= 3) {
    return selected;
  }

  for (const product of products) {
    if (selected.length >= 3) {
      break;
    }

    if (selected.some((item) => item.slug === product.slug)) {
      continue;
    }

    selected.push(toGalleryEdition(product));
  }

  return selected.slice(0, 3);
}

export async function getCollectionsDiscoveryPageData(): Promise<CollectionsDiscoveryPageData> {
  const [allCollections, originalsProducts] = await Promise.all([
    getPublicCollectionsWithStats(),
    getProductsByCollection("originals"),
  ]);

  const collectionsBySlug = new Map(
    allCollections.map((collection) => [collection.slug, collection]),
  );

  const collections = COLLECTIONS_DISCOVERY_ORDER.flatMap((slug) => {
    const collection = collectionsBySlug.get(slug);
    if (!collection) {
      return [];
    }

    return [
      {
        ...collection,
        index: DISCOVERY_INDEX[slug],
        discoveryImage: COLLECTIONS_DISCOVERY_IMAGES[slug],
      },
    ];
  });

  return {
    collections,
    originalsGallery: pickOriginalsGalleryEditions(originalsProducts),
  };
}

export function getCollectionsDiscoveryItem(
  collections: CollectionsDiscoveryItem[],
  slug: CollectionsDiscoverySlug,
): CollectionsDiscoveryItem | undefined {
  return collections.find((collection) => collection.slug === slug);
}
