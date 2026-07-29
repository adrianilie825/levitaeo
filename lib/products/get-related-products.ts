import "server-only";

import { getProductsByCollection } from "@/lib/products-db";
import type { Product } from "@/types/product";

export async function getRelatedProducts(
  product: Product,
  limit = 4,
): Promise<Product[]> {
  const collectionSlug = product.collectionSlug ?? "originals";
  const products = await getProductsByCollection(collectionSlug);

  return products
    .filter(
      (item) =>
        item.slug !== product.slug && item.status === "available",
    )
    .slice(0, limit);
}
