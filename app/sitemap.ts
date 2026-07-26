import type { MetadataRoute } from "next";
import { getProductsByCollection } from "@/lib/products-db";
import { absoluteUrl } from "@/lib/seo";

export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const buildDate = new Date();
  const originalsProducts = await getProductsByCollection("originals");

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      lastModified: buildDate,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: absoluteUrl("/collections"),
      lastModified: buildDate,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/collections/originals"),
      lastModified: buildDate,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  const productRoutes: MetadataRoute.Sitemap = originalsProducts.map(
    (product) => ({
      url: absoluteUrl(`/collections/originals/${product.slug}`),
      lastModified: buildDate,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }),
  );

  return [...staticRoutes, ...productRoutes];
}
