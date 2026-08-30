function normalizeSiteUrl(url: string): string {
  return url.trim().replace(/\/+$/, "");
}

const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() ?? "";
const fallbackSiteUrl = "http://localhost:3000";

export function getSiteUrl(): string {
  return normalizeSiteUrl(
    configuredSiteUrl.length > 0 ? configuredSiteUrl : fallbackSiteUrl,
  );
}

export function isProductionSiteUrlConfigured(): boolean {
  if (!configuredSiteUrl) {
    return false;
  }

  try {
    const url = new URL(configuredSiteUrl);
    return url.protocol === "https:" && !url.hostname.includes("localhost");
  } catch {
    return false;
  }
}

export const siteConfig = {
  name: "Levitaeo",
  shortName: "Levitaeo",
  url: getSiteUrl(),
  description:
    "Curated digital art for collectors, premium screens, interiors, and modern spaces.",
  tagline: "Digital Art Worth Collecting",
  locale: "en_US",
  themeColor: "#FAFAF8",
  creator: "Levitaeo Studio",
  defaultOgImage: "/images/collections/originals.png",
  social: {
    instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL?.trim() ?? "",
    pinterest: process.env.NEXT_PUBLIC_PINTEREST_URL?.trim() ?? "",
  },
  contactEmail:
    process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() ?? "hello@levitaeo.com",
} as const;

export type SiteConfig = typeof siteConfig;
