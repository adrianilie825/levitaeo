/**
 * @deprecated Use `@/lib/products-db` instead.
 * This module remains temporarily for reference during the Supabase catalog migration.
 * Product data now lives in Supabase (`collections` and `products` tables).
 */
import fs from "fs";
import path from "path";
import type { Product } from "@/types/product";
import {
  PRODUCT_FALLBACK_IMAGE,
  getProductCatalogImagePath,
  productCatalog,
} from "@/lib/product-catalog";

function resolveImage(intendedPath: string): string {
  const publicPath = path.join(
    process.cwd(),
    "public",
    intendedPath.replace(/^\//, ""),
  );

  if (fs.existsSync(publicPath)) {
    return intendedPath;
  }

  return PRODUCT_FALLBACK_IMAGE;
}

/** @deprecated Use getAllProducts() from `@/lib/products-db`. */
export const products: Product[] = productCatalog.map((product) => ({
  ...product,
  image: resolveImage(getProductCatalogImagePath(product.slug)),
}));

/** @deprecated Use getProductsByCollection() from `@/lib/products-db`. */
export function getProductsByCollection(collection: string): Product[] {
  return products.filter(
    (product) => product.collection.toLowerCase() === collection.toLowerCase(),
  );
}

/** @deprecated Use getProductBySlug() from `@/lib/products-db`. */
export function getProductBySlug(slug: string): Product | undefined {
  return products.find((product) => product.slug === slug);
}

/** @deprecated Use getProductPath() from `@/lib/products-db`. */
export function getProductPath(product: Product): string {
  return `/collections/originals/${product.slug}`;
}

/** @deprecated Use formatEditionLabel() from `@/lib/products-db`. */
export function formatEditionLabel(edition: string): string {
  return `Edition ${edition}`;
}

/** @deprecated Use formatProductStatus() from `@/lib/products-db`. */
export function formatProductStatus(status: Product["status"]): string {
  return status === "available" ? "Available" : "Coming Soon";
}

/** @deprecated Use formatProductPrice() from `@/lib/products-db`. */
export function formatProductPrice(product: Product): string {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: product.currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(product.price);
}
