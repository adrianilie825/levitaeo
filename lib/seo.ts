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
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
};

export function createPageMetadata({
  title,
  description = siteConfig.description,
  path,
  image,
  openGraphType = "website",
  robots,
  publishedTime,
  modifiedTime,
  authors,
}: PageMetadataOptions): Metadata {
  const canonical = createCanonical(path);
  const ogImage = resolveOgImage(image);
  const fullTitle = `${title} | ${siteConfig.name}`;

  const openGraph = {
    title: fullTitle,
    description,
    url: canonical,
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    type: openGraphType,
    images: [{ url: ogImage }],
    ...(openGraphType === "article" && publishedTime
      ? { publishedTime }
      : {}),
    ...(openGraphType === "article" && modifiedTime ? { modifiedTime } : {}),
    ...(openGraphType === "article" && authors && authors.length > 0
      ? { authors }
      : {}),
  } satisfies NonNullable<Metadata["openGraph"]>;

  return {
    title,
    description,
    robots,
    ...(authors && authors.length > 0
      ? { authors: authors.map((name) => ({ name })) }
      : {}),
    alternates: {
      canonical,
    },
    openGraph,
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [ogImage],
    },
  };
}

export function createJournalArticleMetadata(input: {
  title: string;
  description: string;
  path: string;
  image?: string;
  publishedAt: string;
  updatedAt?: string;
  author?: string;
}): Metadata {
  const authorName = input.author?.trim() || siteConfig.creator;

  return createPageMetadata({
    title: input.title,
    description: input.description,
    path: input.path,
    image: input.image,
    openGraphType: "article",
    publishedTime: input.publishedAt,
    modifiedTime: input.updatedAt,
    authors: [authorName],
  });
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

type JournalPostJsonLdInput = {
  title: string;
  description: string;
  slug: string;
  author: string;
  publishedAt: string;
  updatedAt?: string;
  image?: string;
  category?: string;
};

export function journalIndexJsonLd(input: {
  posts: Array<{ title: string; slug: string }>;
}) {
  const description =
    "Notes on digital art, visual culture, interiors and the evolving ways we live with images.";

  return [
    collectionPageJsonLd({
      name: "Levitaeo Journal",
      description,
      path: "/journal",
    }),
    breadcrumbListJsonLd([
      { name: siteConfig.name, path: "/" },
      { name: "Journal", path: "/journal" },
    ]),
    ...(input.posts.length > 0
      ? [
          itemListJsonLd({
            name: "Journal Articles",
            description,
            items: input.posts.map((post) => ({
              name: post.title,
              url: `/journal/${post.slug}`,
            })),
          }),
        ]
      : []),
  ];
}

function getPublisherOrganizationJsonLd() {
  const organization: Record<string, unknown> = {
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
  };

  if (siteConfig.publisherLogo.trim()) {
    organization.logo = {
      "@type": "ImageObject",
      url: resolveOgImage(siteConfig.publisherLogo),
    };
  }

  return organization;
}

export function blogPostingJsonLd(post: JournalPostJsonLdInput) {
  const path = `/journal/${post.slug}`;
  const url = createCanonical(path);
  const authorName = post.author.trim() || siteConfig.creator;

  const schema: Record<string, unknown> = {
    "@context": SCHEMA_ORG_CONTEXT,
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    url,
    datePublished: post.publishedAt,
    author: {
      "@type": "Person",
      name: authorName,
    },
    publisher: getPublisherOrganizationJsonLd(),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
  };

  if (post.image) {
    schema.image = post.image.startsWith("http")
      ? post.image
      : resolveOgImage(post.image);
  }

  if (post.updatedAt) {
    schema.dateModified = post.updatedAt;
  }

  if (post.category?.trim()) {
    schema.articleSection = post.category.trim();
  }

  return schema;
}
