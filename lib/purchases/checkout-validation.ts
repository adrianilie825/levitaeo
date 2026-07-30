import "server-only";

import { getStripePriceId } from "@/lib/stripe-products";
import { getProductBySlug } from "@/lib/products-db";
import type { Product } from "@/types/product";

export type CheckoutProductValidation =
  | { ok: true; product: Product; stripePriceId: string }
  | { ok: false; status: number; error: string };

export async function validateCheckoutProduct(
  productSlug: string,
): Promise<CheckoutProductValidation> {
  const normalizedSlug = productSlug.trim();

  if (!normalizedSlug) {
    return {
      ok: false,
      status: 400,
      error: "A valid product slug is required.",
    };
  }

  const product = await getProductBySlug(normalizedSlug);

  if (!product) {
    return {
      ok: false,
      status: 404,
      error: "Product not found.",
    };
  }

  if (product.status !== "available" || !product.downloadable) {
    return {
      ok: false,
      status: 400,
      error: "This edition is not available for purchase.",
    };
  }

  const stripePriceId =
    product.stripePriceId?.trim() || getStripePriceId(product.slug);

  if (!stripePriceId) {
    return {
      ok: false,
      status: 503,
      error:
        "Checkout is not configured for this edition yet. Please try again later.",
    };
  }

  return {
    ok: true,
    product,
    stripePriceId,
  };
}
