import "server-only";

import fs from "fs";
import path from "path";
import { unstable_cache } from "next/cache";
import { createCatalogClient } from "@/lib/supabase/catalog";
import { isSupabasePublicConfigured } from "@/lib/supabase/env";
import { collections as fallbackCollections } from "@/lib/collections";
import {
  PRODUCT_FALLBACK_IMAGE,
  productCatalog,
} from "@/lib/product-catalog";
import type { Collection } from "@/types/collection";
import type { Product, ProductStatus } from "@/types/product";

export const CATALOG_REVALIDATE_SECONDS = 300;
export const CATALOG_PRODUCTS_TAG = "catalog-products";
export const CATALOG_COLLECTIONS_TAG = "catalog-collections";
export const CATALOG_SEARCH_TAG = "catalog-search-index";

type DbCollectionRow = {
  id: string;
  slug: string;
  name: string;
  description: string;
  sort_order: number;
  created_at: string;
};

type DbProductRow = {
  id: string;
  collection_id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  price_cents: number;
  currency: string;
  image_url: string;
  thumbnail_url: string;
  edition: string;
  resolution: string;
  file_type: string;
  status: string;
  is_featured: boolean;
  stripe_price_id: string | null;
  sort_order: number;
  created_at: string;
  collections: DbCollectionRow | DbCollectionRow[] | null;
};

const COLLECTION_PRESENTATION: Record<
  string,
  Pick<
    Collection,
    "shortDescription" | "image" | "href" | "status" | "featured" | "order"
  >
> = {
  originals: {
    shortDescription:
      "Exclusive Levitaeo editions shaped by contrast, balance, and restraint.",
    image: "/images/collections/originals.png",
    href: "/collections/originals",
    status: "active",
    featured: true,
    order: 1,
  },
  skylines: {
    shortDescription:
      "Minimal city portraits developed through line, rhythm, and atmosphere.",
    image: "/images/collections/skylines.png",
    href: "/collections/skylines",
    status: "coming-soon",
    featured: true,
    order: 2,
  },
  nature: {
    shortDescription:
      "Calm visual studies inspired by landscape, light, and organic form.",
    image: "/images/collections/nature.png",
    href: "/collections/nature",
    status: "coming-soon",
    featured: true,
    order: 3,
  },
  minimal: {
    shortDescription:
      "Restrained compositions exploring geometry, proportion, and space.",
    image: "/images/collections/minimal.png",
    href: "/collections/minimal",
    status: "coming-soon",
    featured: true,
    order: 4,
  },
};

const PRODUCT_PRESENTATION_DEFAULTS = {
  orientation: "Portrait",
  recommendedUse: "Desktop, tablet, mobile, and personal printing",
  license: "Personal use",
} as const;

function formatCatalogFileType(fileType: string): string {
  if (fileType.toUpperCase() === "PNG") {
    return "High-resolution PNG";
  }

  return fileType;
}

function resolveImageUrl(imageUrl: string): string {
  if (!imageUrl) {
    return PRODUCT_FALLBACK_IMAGE;
  }

  const publicPath = path.join(
    process.cwd(),
    "public",
    imageUrl.replace(/^\//, ""),
  );

  if (fs.existsSync(publicPath)) {
    return imageUrl;
  }

  return PRODUCT_FALLBACK_IMAGE;
}

function getJoinedCollection(
  row: DbProductRow,
): DbCollectionRow | undefined {
  if (!row.collections) {
    return undefined;
  }

  return Array.isArray(row.collections) ? row.collections[0] : row.collections;
}

function mapDbStatus(status: string): ProductStatus {
  return status === "published" ? "available" : "coming-soon";
}

function mapDbProduct(row: DbProductRow): Product {
  const collection = getJoinedCollection(row);
  const collectionName = collection?.name ?? "Originals";
  const collectionSlug = collection?.slug ?? "originals";
  const productStatus = mapDbStatus(row.status);

  return {
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle?.trim() || undefined,
    edition: row.edition,
    collection: collectionName,
    priceCents: row.price_cents,
    price: row.price_cents / 100,
    currency: row.currency.toUpperCase() === "EUR" ? "EUR" : "EUR",
    image: resolveImageUrl(row.image_url),
    description: row.description,
    status: productStatus,
    availabilityText:
      productStatus === "available" ? "Available now" : "Coming soon",
    fileType: formatCatalogFileType(row.file_type),
    resolution: row.resolution?.trim() || undefined,
    orientation: PRODUCT_PRESENTATION_DEFAULTS.orientation,
    recommendedUse: PRODUCT_PRESENTATION_DEFAULTS.recommendedUse,
    license: PRODUCT_PRESENTATION_DEFAULTS.license,
    downloadable: productStatus === "available",
    stripePriceId: row.stripe_price_id,
    collectionSlug,
    isFeatured: row.is_featured,
  };
}

function mapDbCollection(row: DbCollectionRow): Collection {
  const presentation = COLLECTION_PRESENTATION[row.slug];

  return {
    slug: row.slug,
    title: row.name,
    description: row.description,
    shortDescription:
      presentation?.shortDescription ?? row.description.slice(0, 120),
    image: presentation?.image ?? PRODUCT_FALLBACK_IMAGE,
    href: presentation?.href ?? `/collections/${row.slug}`,
    status: presentation?.status ?? "coming-soon",
    featured: presentation?.featured ?? false,
    order: presentation?.order ?? row.sort_order,
  };
}

function mapFallbackProduct(
  product: Omit<Product, "image" | "priceCents"> & {
    image?: string;
    priceCents?: number;
  },
): Product {
  const collectionSlug = "originals";
  const priceCents = product.priceCents ?? product.price * 100;

  return {
    ...product,
    priceCents,
    price: priceCents / 100,
    image: resolveImageUrl(`/images/originals/${product.slug}.png`),
    collectionSlug,
    stripePriceId: null,
  };
}

function getFallbackProducts(): Product[] {
  return productCatalog.map((product) => mapFallbackProduct(product));
}

function getFallbackCollections(): Collection[] {
  return fallbackCollections;
}

function normalizeProductSlug(slug: string): string {
  return slug.trim().toLowerCase();
}

async function fetchProductBySlugFromDb(
  slug: string,
): Promise<Product | undefined> {
  const normalizedSlug = normalizeProductSlug(slug);

  if (!normalizedSlug) {
    return undefined;
  }

  if (!isSupabasePublicConfigured()) {
    return getFallbackProducts().find(
      (product) => normalizeProductSlug(product.slug) === normalizedSlug,
    );
  }

  const supabase = createCatalogClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      "id, collection_id, slug, title, subtitle, description, price_cents, currency, image_url, thumbnail_url, edition, resolution, file_type, status, is_featured, stripe_price_id, sort_order, created_at",
    )
    .eq("slug", normalizedSlug)
    .in("status", ["published", "coming_soon"])
    .maybeSingle();

  if (error) {
    if (process.env.NODE_ENV === "development") {
      console.error(
        `[products-db] Failed to fetch product by slug "${normalizedSlug}":`,
        error.message,
      );
    }

    return getFallbackProducts().find(
      (product) => normalizeProductSlug(product.slug) === normalizedSlug,
    );
  }

  if (!data) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        `[products-db] No published catalog product found for slug "${normalizedSlug}".`,
      );
    }

    return getFallbackProducts().find(
      (product) => normalizeProductSlug(product.slug) === normalizedSlug,
    );
  }

  const { data: collectionData, error: collectionError } = await supabase
    .from("collections")
    .select("id, slug, name, description, sort_order, created_at")
    .eq("id", data.collection_id)
    .maybeSingle();

  if (collectionError && process.env.NODE_ENV === "development") {
    console.error(
      `[products-db] Failed to fetch collection for "${normalizedSlug}":`,
      collectionError.message,
    );
  }

  if (process.env.NODE_ENV === "development") {
    console.info(
      `[products-db] Loaded product "${data.title}" (${data.slug}, status=${data.status}).`,
    );
  }

  return mapDbProduct({
    ...(data as DbProductRow),
    collections: (collectionData as DbCollectionRow | null) ?? null,
  });
}

function getCachedProductBySlug(slug: string): Promise<Product | undefined> {
  const normalizedSlug = normalizeProductSlug(slug);

  return unstable_cache(
    () => fetchProductBySlugFromDb(normalizedSlug),
    ["catalog-product", normalizedSlug],
    {
      revalidate: CATALOG_REVALIDATE_SECONDS,
      tags: [CATALOG_PRODUCTS_TAG, `catalog-product-${normalizedSlug}`],
    },
  )();
}

async function fetchProductsFromDb(): Promise<Product[]> {
  if (!isSupabasePublicConfigured()) {
    return getFallbackProducts();
  }

  const supabase = createCatalogClient();

  const [{ data: productsData, error: productsError }, { data: collectionsData, error: collectionsError }] =
    await Promise.all([
      supabase
        .from("products")
        .select(
          "id, collection_id, slug, title, subtitle, description, price_cents, currency, image_url, thumbnail_url, edition, resolution, file_type, status, is_featured, stripe_price_id, sort_order, created_at",
        )
        .in("status", ["published", "coming_soon"])
        .order("sort_order", { ascending: true }),
      supabase
        .from("collections")
        .select("id, slug, name, description, sort_order, created_at"),
    ]);

  if (productsError || collectionsError || !productsData) {
    if (process.env.NODE_ENV === "development") {
      console.error("[products-db] Failed to fetch products:", productsError ?? collectionsError);
    }

    return getFallbackProducts();
  }

  const collectionsById = new Map(
    ((collectionsData ?? []) as DbCollectionRow[]).map((collection) => [
      collection.id,
      collection,
    ]),
  );

  return (productsData as DbProductRow[]).map((row) =>
    mapDbProduct({
      ...row,
      collections: collectionsById.get(row.collection_id) ?? null,
    }),
  );
}

async function fetchCollectionsFromDb(): Promise<Collection[]> {
  if (!isSupabasePublicConfigured()) {
    return getFallbackCollections();
  }

  const supabase = createCatalogClient();
  const { data, error } = await supabase
    .from("collections")
    .select("id, slug, name, description, sort_order, created_at")
    .order("sort_order", { ascending: true });

  if (error || !data) {
    if (process.env.NODE_ENV === "development") {
      console.error("[products-db] Failed to fetch collections:", error);
    }

    return getFallbackCollections();
  }

  return (data as DbCollectionRow[]).map(mapDbCollection);
}

const getCachedProducts = unstable_cache(
  fetchProductsFromDb,
  ["catalog-products"],
  {
    revalidate: CATALOG_REVALIDATE_SECONDS,
    tags: [CATALOG_PRODUCTS_TAG],
  },
);

const getCachedCollections = unstable_cache(
  fetchCollectionsFromDb,
  ["catalog-collections"],
  {
    revalidate: CATALOG_REVALIDATE_SECONDS,
    tags: [CATALOG_COLLECTIONS_TAG],
  },
);

export async function getAllProducts(): Promise<Product[]> {
  return getCachedProducts();
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const products = await getCachedProducts();
  return products.filter((product) => product.isFeatured);
}

export async function getProductBySlug(
  slug: string,
): Promise<Product | undefined> {
  return getCachedProductBySlug(slug);
}

export async function getProductsByCollection(
  collectionSlug: string,
): Promise<Product[]> {
  const normalizedSlug = collectionSlug.trim().toLowerCase();
  const products = await getCachedProducts();

  return products.filter((product) => {
    const productCollectionSlug =
      product.collectionSlug?.toLowerCase() ??
      product.collection.toLowerCase();

    return (
      productCollectionSlug === normalizedSlug ||
      product.collection.toLowerCase() === collectionSlug.toLowerCase()
    );
  });
}

export async function getCollections(): Promise<Collection[]> {
  return getCachedCollections();
}

export async function getFeaturedCollections(): Promise<Collection[]> {
  const collections = await getCachedCollections();
  return collections
    .filter((collection) => collection.featured)
    .sort((a, b) => a.order - b.order);
}

export async function getCollectionBySlug(
  slug: string,
): Promise<Collection | undefined> {
  const collections = await getCachedCollections();
  return collections.find((collection) => collection.slug === slug);
}

export function getProductPath(product: Product): string {
  const collectionSlug = product.collectionSlug ?? "originals";
  return `/collections/${collectionSlug}/${product.slug}`;
}

export function formatEditionLabel(edition: string): string {
  return `Edition ${edition}`;
}

export function formatProductStatus(status: Product["status"]): string {
  return status === "available" ? "Available" : "Coming Soon";
}

export function formatProductPrice(product: Product): string {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: product.currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(product.price);
}

export function getProductCatalogPath(slug: string, collectionSlug = "originals"): string {
  return `/collections/${collectionSlug}/${slug}`;
}
