import type { Collection } from "@/types/collection";
import { PRODUCT_FALLBACK_IMAGE } from "@/lib/product-catalog";

export const COLLECTION_PRESENTATION: Record<
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

export function mapCollectionRowToCollection(
  row: {
    slug: string;
    name: string;
    description: string;
    sort_order: number;
  },
  volumeCount: number,
): Collection {
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
    volumeCount,
  };
}
