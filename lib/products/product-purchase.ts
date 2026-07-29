import "server-only";

import { getStripePriceId } from "@/lib/stripe-products";
import type { Product } from "@/types/product";

export function hasConfiguredStripePrice(product: Product): boolean {
  const stripePriceId =
    product.stripePriceId?.trim() || getStripePriceId(product.slug);

  return Boolean(stripePriceId);
}

export function isProductPurchasable(product: Product): boolean {
  if (product.status !== "available" || product.downloadable !== true) {
    return false;
  }

  return hasConfiguredStripePrice(product);
}
