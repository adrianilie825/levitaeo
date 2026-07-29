import { formatCentsToPriceInput } from "@/lib/admin/product-constants";
import type { CatalogCollectionRow } from "@/types/database";

export type ArtworkFormValues = {
  title: string;
  slug: string;
  subtitle: string;
  description: string;
  collection_id: string;
  collection_slug: string;
  price: string;
  currency: string;
  image_url: string;
  thumbnail_url: string;
  edition: string;
  resolution: string;
  file_type: string;
  status: string;
  is_featured: boolean;
  stripe_price_id: string;
  sort_order: string;
};

export function productRowToFormValues(
  product: {
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
    collections: Pick<CatalogCollectionRow, "slug"> | null;
  },
  defaultCollectionSlug = "originals",
): ArtworkFormValues {
  return {
    title: product.title,
    slug: product.slug,
    subtitle: product.subtitle,
    description: product.description,
    collection_id: product.collection_id,
    collection_slug: product.collections?.slug ?? defaultCollectionSlug,
    price: formatCentsToPriceInput(product.price_cents),
    currency: product.currency,
    image_url: product.image_url,
    thumbnail_url: product.thumbnail_url,
    edition: product.edition,
    resolution: product.resolution,
    file_type: product.file_type,
    status: product.status,
    is_featured: product.is_featured,
    stripe_price_id: product.stripe_price_id ?? "",
    sort_order: String(product.sort_order),
  };
}

export function emptyArtworkFormValues(
  collections: Pick<CatalogCollectionRow, "id" | "slug">[],
): ArtworkFormValues {
  const firstCollection = collections[0];

  return {
    title: "",
    slug: "",
    subtitle: "",
    description: "",
    collection_id: firstCollection?.id ?? "",
    collection_slug: firstCollection?.slug ?? "originals",
    price: "0.00",
    currency: "EUR",
    image_url: "",
    thumbnail_url: "",
    edition: "",
    resolution: "",
    file_type: "",
    status: "draft",
    is_featured: false,
    stripe_price_id: "",
    sort_order: "0",
  };
}
