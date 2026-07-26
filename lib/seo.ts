import type { Metadata } from "next";
import type { Product } from "@/types/product";
import { siteConfig } from "@/lib/site";

export const SITE_KEYWORDS = [
  "digital art",
  "collectible digital art",
  "premium wallpapers",
  "minimalist art",
  "digital prints",
  "wall art",
  "abstract art",
  "desktop wallpapers",
  "mobile wallpapers",
  "curated art collections",
];

export function absoluteUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return new URL(normalizedPath, `${siteConfig.url}/`).toString();
}

export function resolveOgImage(image?: string): string {
  const source = image ?? siteConfig.defaultOgImage;
  return source.startsWith("http") ? source : absoluteUrl(source);
}

export function createCanonical(path: string): string {
  return absoluteUrl(path);
}

type PageMetadataOptions = {
  title: string;
  description?: string;
  path: string;
  image?: string;
  openGraphType?: "website" | "article";
  robots?: Metadata["robots"];
};

export function createPageMetadata({
  title,
  description = siteConfig.description,
  path,
  image,
  openGraphType = "website",
  robots,
}: PageMetadataOptions): Metadata {
  const canonical = createCanonical(path);
  const ogImage = resolveOgImage(image);
  const fullTitle = `${title} | ${siteConfig.name}`;

  return {
    title,
    description,
    robots,
    alternates: {
      canonical,
    },
    openGraph: {
      title: fullTitle,
      description,
      url: canonical,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      type: openGraphType,
      images: [{ url: ogImage }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [ogImage],
    },
  };
}

function getSocialProfiles(): string[] {
  return Object.values(siteConfig.social).filter((url) => url.length > 0);
}

export function organizationJsonLd() {
  const sameAs = getSocialProfiles();

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
  };
}

export function collectionPageJsonLd({
  name,
  description,
  path,
}: {
  name: string;
  description: string;
  path: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url: createCanonical(path),
    isPartOf: {
      "@type": "WebSite",
      name: siteConfig.name,
      url: siteConfig.url,
    },
  };
}

export function productJsonLd(product: Product) {
  const collectionSlug = product.collectionSlug ?? "originals";
  const path = `/collections/${collectionSlug}/${product.slug}`;
  const url = createCanonical(path);

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    image: resolveOgImage(product.image),
    sku: product.edition || product.slug,
    url,
    brand: {
      "@type": "Brand",
      name: siteConfig.name,
    },
    category: "Digital Art",
  };

  if (product.status === "available") {
    schema.offers = {
      "@type": "Offer",
      price: product.price,
      priceCurrency: product.currency,
      availability: "https://schema.org/InStock",
      url,
      itemCondition: "https://schema.org/NewCondition",
    };
  }

  return schema;
}
