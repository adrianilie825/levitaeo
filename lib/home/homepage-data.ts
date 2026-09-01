import "server-only";

import fs from "fs";
import path from "path";
import {
  getPublicCollectionsWithStats,
  listPublicVolumesForCollection,
  type PublicVolumeSummary,
} from "@/lib/catalog/collections-public";
import type {
  HeroCollectionTile,
  HomeVolumeSummary,
  HomepageEdition,
} from "@/lib/home/homepage-types";
import { PRODUCT_FALLBACK_IMAGE } from "@/lib/product-catalog";
import {
  formatProductPrice,
  getFeaturedProducts,
  getProductPath,
  getProductsByCollection,
} from "@/lib/products-db";
import type { Collection } from "@/types/collection";
import type { Product } from "@/types/product";

const HOME_VOLUME_IMAGE_FALLBACK = PRODUCT_FALLBACK_IMAGE;

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

function resolveCatalogImageUrl(imageUrl?: string | null): string | null {
  const trimmed = imageUrl?.trim();
  if (!trimmed) {
    return null;
  }

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  const normalized = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  const publicPath = path.join(
    process.cwd(),
    "public",
    normalized.replace(/^\//, ""),
  );

  return fs.existsSync(publicPath) ? normalized : null;
}

export function resolveHomeVolumeCoverImage(input: {
  volumeCoverImage?: string;
  latestEditionImage?: string;
}): string {
  return (
    resolveCatalogImageUrl(input.latestEditionImage) ??
    resolveCatalogImageUrl(input.volumeCoverImage) ??
    HOME_VOLUME_IMAGE_FALLBACK
  );
}

/** Hero grid order and final collection cover images (all paths exist under /public). */
const HERO_COLLECTION_TILES: HeroCollectionTile[] = [
  {
    slug: "architecture",
    title: "Architecture",
    href: "/collections/architecture",
    image: "/images/collections/architecture-cover.png",
  },
  {
    slug: "nature",
    title: "Nature",
    href: "/collections/nature",
    image: "/images/collections/nature-cover.png",
  },
  {
    slug: "botanical",
    title: "Botanical",
    href: "/collections/botanical",
    image: "/images/collections/botanical-cover.png",
  },
  {
    slug: "minimal",
    title: "Minimal",
    href: "/collections/minimal",
    image: "/images/collections/minimal-cover.png",
  },
];

export function getHeroCollectionTiles(
  collections: Collection[],
): HeroCollectionTile[] {
  const bySlug = new Map(collections.map((collection) => [collection.slug, collection]));

  return HERO_COLLECTION_TILES.map((tile) => {
    const collection = bySlug.get(tile.slug);

    return {
      slug: tile.slug,
      title: collection?.title ?? tile.title,
      href: collection?.href ?? tile.href,
      image: tile.image,
    };
  });
}

export function toHomeVolumeSummary(
  volume: PublicVolumeSummary,
  latestEditionImage?: string,
): HomeVolumeSummary {
  return {
    name: volume.name,
    description: volume.description,
    href: volume.href,
    coverImage: resolveHomeVolumeCoverImage({
      volumeCoverImage: volume.coverImage,
      latestEditionImage,
    }),
    editionCount: volume.editionCount,
    collectionName: volume.collection?.name,
  };
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
    priceLabel: formatProductPrice(product),
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
