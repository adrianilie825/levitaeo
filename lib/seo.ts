import type { Metadata } from "next";
import type { Product } from "@/types/product";
import { SCHEMA_ORG_CONTEXT } from "@/lib/seo/json-ld-utils";
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
    "@context": SCHEMA_ORG_CONTEXT,
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };
}

export function websiteJsonLd() {
  return {
    "@context": SCHEMA_ORG_CONTEXT,
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
    "@context": SCHEMA_ORG_CONTEXT,
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
    "@context": SCHEMA_ORG_CONTEXT,
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

type JsonLdListItemInput = {
  name: string;
  url: string;
};

type JsonLdBreadcrumbInput = {
  name: string;
  path: string;
};

type HomeEditionJsonLdInput = {
  title: string;
  description: string;
  image: string;
  edition: string;
  href: string;
};

export function breadcrumbListJsonLd(items: JsonLdBreadcrumbInput[]) {
  return {
    "@context": SCHEMA_ORG_CONTEXT,
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: createCanonical(item.path),
    })),
  };
}

export function itemListJsonLd(input: {
  name?: string;
  description?: string;
  items: JsonLdListItemInput[];
}) {
  return {
    "@context": SCHEMA_ORG_CONTEXT,
    "@type": "ItemList",
    ...(input.name ? { name: input.name } : {}),
    ...(input.description ? { description: input.description } : {}),
    itemListElement: input.items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : createCanonical(item.url),
    })),
  };
}

export function editionProductJsonLd(edition: HomeEditionJsonLdInput) {
  const url = edition.href.startsWith("http")
    ? edition.href
    : createCanonical(edition.href);

  return {
    "@context": SCHEMA_ORG_CONTEXT,
    "@type": "Product",
    name: edition.title,
    description: edition.description,
    image: resolveOgImage(edition.image),
    sku: edition.edition,
    url,
    brand: {
      "@type": "Brand",
      name: siteConfig.name,
    },
    category: "Digital Art",
  };
}

export function homePageJsonLd(input: {
  collections: Array<{ title: string; href: string }>;
  editions: HomeEditionJsonLdInput[];
}) {
  const homepageDescription =
    "A curated editorial destination for distinctive digital art editions.";

  return [
    collectionPageJsonLd({
      name: siteConfig.tagline,
      description: homepageDescription,
      path: "/",
    }),
    itemListJsonLd({
      name: "Featured Collections",
      description: "Editorial collections published by Levitaeo.",
      items: input.collections.map((collection) => ({
        name: collection.title,
        url: collection.href,
      })),
    }),
    itemListJsonLd({
      name: "Featured Editions",
      description: "Selected digital editions from the current publishing program.",
      items: input.editions.map((edition) => ({
        name: edition.title,
        url: edition.href,
      })),
    }),
    breadcrumbListJsonLd([{ name: siteConfig.name, path: "/" }]),
    ...input.editions.map((edition) => editionProductJsonLd(edition)),
  ];
}
