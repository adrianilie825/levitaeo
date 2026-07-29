export type ProductStatus = "available" | "coming-soon";

export type Product = {
  slug: string;
  title: string;
  subtitle?: string;
  edition: string;
  collection: string;
  collectionSlug?: string;
  /** Major currency unit for display, e.g. 29 for EUR 29.00 */
  price: number;
  /** Minor currency unit (cents), aligned with Stripe and order_items.unit_amount */
  priceCents?: number;
  currency: "EUR";
  image: string;
  description: string;
  status: ProductStatus;
  availabilityText: string;
  fileType: string;
  resolution?: string;
  orientation: string;
  recommendedUse: string;
  license: string;
  downloadable?: boolean;
  stripePriceId?: string | null;
  isFeatured?: boolean;
};
