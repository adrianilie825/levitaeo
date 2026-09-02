import type { Collection } from "@/types/collection";

/**
 * @deprecated Use `@/lib/products-db` (`getCollections()`, `getFeaturedCollections()`).
 * Collection presentation data is stored in Supabase with UI enrichment in products-db.
 */

const collectionsData: Collection[] = [
  {
    slug: "originals",
    title: "Originals",
    description:
      "Limited digital editions created exclusively for Levitaeo.",
    shortDescription:
      "Exclusive Levitaeo editions shaped by contrast, balance, and restraint.",
    image: "/images/collections/originals.png",
    href: "/collections/originals",
    status: "active",
    featured: true,
    order: 1,
  },
  {
    slug: "skylines",
    title: "Skylines",
    description:
      "Iconic cities reimagined through restrained line, form, and contrast.",
    shortDescription:
      "Minimal city portraits developed through line, rhythm, and atmosphere.",
    image: "/images/collections/skylines.png",
    href: "/collections/skylines",
    status: "coming-soon",
    featured: true,
    order: 2,
  },
  {
    slug: "nature",
    title: "Nature",
    description:
      "Quiet landscapes shaped by light, texture, and natural rhythm.",
    shortDescription:
      "Calm visual studies inspired by landscape, light, and organic form.",
    image: "/images/collections/nature.png",
    href: "/collections/nature",
    status: "coming-soon",
    featured: true,
    order: 3,
  },
  {
    slug: "minimal",
    title: "Minimal",
    description: "Pure geometry, considered space, and visual balance.",
    shortDescription:
      "Restrained compositions exploring geometry, proportion, and space.",
    image: "/images/collections/minimal.png",
    href: "/collections/minimal",
    status: "coming-soon",
    featured: true,
    order: 4,
  },
  {
    slug: "architecture",
    title: "Architecture",
    description:
      "Built form, light, and material studied with editorial restraint.",
    shortDescription:
      "Built form and light studied with editorial restraint.",
    image: "/images/collections/architecture-cover.png",
    href: "/collections/architecture",
    status: "coming-soon",
    featured: true,
    order: 5,
  },
  {
    slug: "botanical",
    title: "Botanical",
    description:
      "Quiet studies of flora, texture, and organic silhouette.",
    shortDescription:
      "Quiet studies of flora, texture, and organic silhouette.",
    image: "/images/collections/botanical-cover.png",
    href: "/collections/botanical",
    status: "coming-soon",
    featured: true,
    order: 6,
  },
];

function sortByOrder(items: Collection[]): Collection[] {
  return [...items].sort((a, b) => a.order - b.order);
}

export const collections = sortByOrder(collectionsData);

export function getCollectionBySlug(slug: string): Collection | undefined {
  return collections.find((collection) => collection.slug === slug);
}

export function getFeaturedCollections(): Collection[] {
  return sortByOrder(collections.filter((collection) => collection.featured));
}

export function getActiveCollections(): Collection[] {
  return sortByOrder(
    collections.filter((collection) => collection.status === "active"),
  );
}
