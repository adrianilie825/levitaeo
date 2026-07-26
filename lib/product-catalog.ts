import type { Product } from "@/types/product";

export const PRODUCT_FALLBACK_IMAGE = "/images/collections/originals.png";

const SHARED_DESCRIPTION =
  "A limited digital edition exploring contrast, balance, atmosphere, and visual restraint.";

const SHARED_METADATA = {
  fileType: "High-resolution PNG",
  orientation: "Portrait",
  recommendedUse: "Desktop, tablet, mobile, and personal printing",
  license: "Personal use",
};

export const productCatalog: Omit<Product, "image">[] = [
  {
    slug: "originals-no-01",
    title: "Originals No. 01",
    edition: "001",
    collection: "Originals",
    price: 29,
    currency: "EUR",
    description: SHARED_DESCRIPTION,
    status: "available",
    availabilityText: "Available now",
    downloadable: true,
    ...SHARED_METADATA,
  },
  {
    slug: "originals-no-02",
    title: "Originals No. 02",
    edition: "002",
    collection: "Originals",
    price: 29,
    currency: "EUR",
    description: SHARED_DESCRIPTION,
    status: "available",
    availabilityText: "Available now",
    downloadable: true,
    ...SHARED_METADATA,
  },
  {
    slug: "originals-no-03",
    title: "Originals No. 03",
    edition: "003",
    collection: "Originals",
    price: 29,
    currency: "EUR",
    description: SHARED_DESCRIPTION,
    status: "coming-soon",
    availabilityText: "Coming soon",
    downloadable: false,
    ...SHARED_METADATA,
  },
  {
    slug: "originals-no-04",
    title: "Originals No. 04",
    edition: "004",
    collection: "Originals",
    price: 29,
    currency: "EUR",
    description: SHARED_DESCRIPTION,
    status: "coming-soon",
    availabilityText: "Coming soon",
    downloadable: false,
    ...SHARED_METADATA,
  },
  {
    slug: "originals-no-05",
    title: "Originals No. 05",
    edition: "005",
    collection: "Originals",
    price: 29,
    currency: "EUR",
    description: SHARED_DESCRIPTION,
    status: "coming-soon",
    availabilityText: "Coming soon",
    ...SHARED_METADATA,
  },
  {
    slug: "originals-no-06",
    title: "Originals No. 06",
    edition: "006",
    collection: "Originals",
    price: 29,
    currency: "EUR",
    description: SHARED_DESCRIPTION,
    status: "coming-soon",
    availabilityText: "Coming soon",
    downloadable: false,
    ...SHARED_METADATA,
  },
];

export function getProductCatalogImagePath(slug: string): string {
  return `/images/originals/${slug}.png`;
}

export function getProductCatalogPath(slug: string): string {
  return `/collections/originals/${slug}`;
}
