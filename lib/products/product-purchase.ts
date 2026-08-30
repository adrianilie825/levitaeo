import "server-only";

import { getStripePriceId } from "@/lib/stripe-products";
import type { Product } from "@/types/product";

export function hasConfiguredStripePrice(product: Product): boolean {
  if (product.stripePriceId?.trim()) {
    return true;
  }

  // Legacy env fallback applies only to static catalog entries without DB Stripe IDs.
  if (!product.id) {
    return Boolean(getStripePriceId(product.slug));
  }

  return false;
}

export function isProductPurchasable(product: Product): boolean {
  if (product.status !== "available" || product.downloadable !== true) {
    return false;
  }

  return hasConfiguredStripePrice(product);
}
