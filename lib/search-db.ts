import "server-only";

import {
  CATALOG_REVALIDATE_SECONDS,
  CATALOG_SEARCH_TAG,
  getAllProducts,
  getCollections,
  getProductCatalogPath,
} from "@/lib/products-db";
import { PRODUCT_FALLBACK_IMAGE } from "@/lib/product-catalog";
import { unstable_cache } from "next/cache";

export type SearchResultType = "product" | "collection";

export type SearchResultStatus = "available" | "coming-soon";

export type SearchResult = {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle: string;
  image: string;
  href: string;
  status: SearchResultStatus;
  searchableText: string;
  navigable: boolean;
};

export type SearchSuggestion = {
  title: string;
  href: string;
};

const MAX_RESULTS = 8;

type IndexedItem = SearchResult & {
  rankTitle: string;
  rankFields: string[];
};

async function buildSearchIndex(): Promise<IndexedItem[]> {
  const [products, collections] = await Promise.all([
    getAllProducts(),
    getCollections(),
  ]);

  return [
    ...products.map((product) => {
      const status: SearchResultStatus =
        product.status === "available" ? "available" : "coming-soon";

      return {
        id: `product-${product.slug}`,
        type: "product" as const,
        title: product.title,
        subtitle: `Edition ${product.edition} · ${product.collection}`,
        image: product.image || PRODUCT_FALLBACK_IMAGE,
        href: getProductCatalogPath(
          product.slug,
          product.collectionSlug ?? "originals",
        ),
        status,
        searchableText: [
          product.title,
          product.edition,
          product.collection,
          product.description,
          product.slug,
        ].join(" "),
        navigable: product.status === "available",
        rankTitle: product.title,
        rankFields: [
          product.edition,
          product.collection,
          product.description,
          product.slug,
        ],
      };
    }),
    ...collections.map((collection) => {
      const status: SearchResultStatus =
        collection.status === "active" ? "available" : "coming-soon";

      return {
        id: `collection-${collection.slug}`,
        type: "collection" as const,
        title: collection.title,
        subtitle: "Collection",
        image: collection.image,
        href: collection.href,
        status,
        searchableText: [
          collection.title,
          collection.description,
          collection.shortDescription,
          collection.slug,
        ].join(" "),
        navigable: collection.status === "active",
        rankTitle: collection.title,
        rankFields: [
          collection.description,
          collection.shortDescription,
          collection.slug,
        ],
      };
    }),
  ];
}

const getCachedSearchIndex = unstable_cache(
  buildSearchIndex,
  ["catalog-search-index"],
  {
    revalidate: CATALOG_REVALIDATE_SECONDS,
    tags: [CATALOG_SEARCH_TAG],
  },
);

function scoreItem(item: IndexedItem, query: string): number {
  const normalizedQuery = query.toLowerCase();
  const title = item.rankTitle.toLowerCase();

  if (title === normalizedQuery) {
    return 300;
  }

  if (title.startsWith(normalizedQuery)) {
    return 200;
  }

  if (title.includes(normalizedQuery)) {
    return 150;
  }

  for (const field of item.rankFields) {
    const normalizedField = field.toLowerCase();

    if (normalizedField === normalizedQuery) {
      return 120;
    }

    if (normalizedField.startsWith(normalizedQuery)) {
      return 100;
    }

    if (normalizedField.includes(normalizedQuery)) {
      return 80;
    }
  }

  if (item.searchableText.toLowerCase().includes(normalizedQuery)) {
    return 40;
  }

  return 0;
}

export async function searchSite(query: string): Promise<SearchResult[]> {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return [];
  }

  const searchIndex = await getCachedSearchIndex();

  return searchIndex
    .map((item) => ({
      item,
      score: scoreItem(item, normalizedQuery),
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      return a.item.title.localeCompare(b.item.title);
    })
    .slice(0, MAX_RESULTS)
    .map(({ item }) => {
      const { rankTitle: _rankTitle, rankFields: _rankFields, ...result } = item;
      return result;
    });
}

export async function getSearchSuggestions(): Promise<SearchSuggestion[]> {
  const products = await getAllProducts();

  return [
    {
      title: "Originals",
      href: "/collections/originals",
    },
    {
      title: "Collections",
      href: "/collections",
    },
    ...products
      .filter((product) => product.status === "available")
      .slice(0, 2)
      .map((product) => ({
        title: product.title,
        href: getProductCatalogPath(
          product.slug,
          product.collectionSlug ?? "originals",
        ),
      })),
  ];
}
