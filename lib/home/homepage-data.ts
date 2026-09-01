import "server-only";

import {
  getPublicCollectionsWithStats,
  listPublicVolumesForCollection,
  type PublicVolumeSummary,
} from "@/lib/catalog/collections-public";
import {
  getFeaturedProducts,
  getProductPath,
  getProductsByCollection,
} from "@/lib/products-db";
import type { Collection } from "@/types/collection";
import type { Product } from "@/types/product";

const HOMEPAGE_COLLECTION_SUPPLEMENTS: Collection[] = [
  {
    slug: "architecture",
    title: "Architecture",
    description:
      "Built form, light, and material studied with editorial restraint.",
    shortDescription:
      "Built form and light studied with editorial restraint.",
    image: "/images/collections/skylines.png",
    href: "/collections/architecture",
    status: "coming-soon",
    featured: true,
    order: 5,
    volumeCount: 0,
  },
  {
    slug: "botanical",
    title: "Botanical",
    description:
      "Quiet studies of flora, texture, and organic silhouette.",
    shortDescription:
      "Quiet studies of flora, texture, and organic silhouette.",
    image: "/images/collections/nature.png",
    href: "/collections/botanical",
    status: "coming-soon",
    featured: true,
    order: 6,
    volumeCount: 0,
  },
];

export type HeroCollectionTile = {
  slug: string;
  title: string;
  href: string;
  image: string;
};

/** Hero grid order and per-tile images — replace `image` independently when assets exist. */
export const HERO_COLLECTION_TILES: HeroCollectionTile[] = [
  {
    slug: "architecture",
    title: "Architecture",
    href: "/collections/architecture",
    image: "/images/collections/skylines.png",
  },
  {
    slug: "nature",
    title: "Nature",
    href: "/collections/nature",
    image: "/images/collections/nature.png",
  },
  {
    slug: "botanical",
    title: "Botanical",
    href: "/collections/botanical",
    image: "/images/collections/nature.png",
  },
  {
    slug: "minimal",
    title: "Minimal",
    href: "/collections/minimal",
    image: "/images/collections/minimal.png",
  },
];

export function getHeroCollectionTiles(
  collections: Collection[],
): HeroCollectionTile[] {
  const bySlug = new Map(collections.map((collection) => [collection.slug, collection]));

  return HERO_COLLECTION_TILES.map((tile) => {
    const collection = bySlug.get(tile.slug);

    if (!collection) {
      return tile;
    }

    return {
      slug: collection.slug,
      title: collection.title,
      href: collection.href,
      image: tile.image,
    };
  });
}

export async function getHomepageCollections(): Promise<Collection[]> {
  const collections = await getPublicCollectionsWithStats();
  const bySlug = new Map(collections.map((collection) => [collection.slug, collection]));

  for (const supplement of HOMEPAGE_COLLECTION_SUPPLEMENTS) {
    if (!bySlug.has(supplement.slug)) {
      bySlug.set(supplement.slug, supplement);
    }
  }

  return Array.from(bySlug.values())
    .sort((a, b) => a.order - b.order)
    .slice(0, 6);
}

export async function getHomepageLatestVolume(): Promise<PublicVolumeSummary | null> {
  const volumes = await listPublicVolumesForCollection("originals");
  return volumes[0] ?? null;
}

export type HomepageEdition = Pick<
  Product,
  "slug" | "title" | "edition" | "image" | "description" | "collection"
> & {
  href: string;
};

function isHomepageEdition(product: Product): boolean {
  return (
    product.status === "available" &&
    !product.slug.toLowerCase().includes("test")
  );
}

function toHomepageEdition(product: Product): HomepageEdition {
  return {
    slug: product.slug,
    title: product.title,
    edition: product.edition,
    image: product.image,
    description: product.description,
    collection: product.collection,
    href: getProductPath(product),
  };
}

export async function getHomepageFeaturedEditions(): Promise<HomepageEdition[]> {
  const featured = (await getFeaturedProducts()).filter(isHomepageEdition);

  if (featured.length > 0) {
    return featured.slice(0, 6).map(toHomepageEdition);
  }

  const originals = (await getProductsByCollection("originals")).filter(
    isHomepageEdition,
  );

  return originals.slice(0, 6).map(toHomepageEdition);
}
