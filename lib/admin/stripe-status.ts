import "server-only";

import type { AdminProductRow } from "@/lib/admin/catalog";
import {
  getStripePriceSyncStatus,
  validateStripeProductPricing,
} from "@/lib/stripe/product-pricing";

export type AdminProductStripeStatus = {
  configured: boolean;
  inSync: boolean;
  stripePriceId: string | null;
  pricingValid: boolean;
  pricingError: string | null;
};

export async function getAdminProductStripeStatus(
  product: AdminProductRow,
): Promise<AdminProductStripeStatus> {
  const pricingValidation = validateStripeProductPricing({
    priceCents: product.price_cents,
    currency: product.currency,
  });

  const pricingInput = {
    productId: product.id,
    slug: product.slug,
    title: product.title,
    collectionSlug: product.collections?.slug ?? "originals",
    priceCents: product.price_cents,
    currency: product.currency,
    stripeProductId: product.stripe_product_id,
    stripePriceId: product.stripe_price_id,
  };

  try {
    const status = await getStripePriceSyncStatus(pricingInput);

    return {
      configured: status.configured,
      inSync: status.inSync,
      stripePriceId: status.stripePriceId,
      pricingValid: pricingValidation.ok,
      pricingError: pricingValidation.ok ? null : pricingValidation.message,
    };
  } catch {
    return {
      configured: Boolean(product.stripe_price_id?.trim()),
      inSync: false,
      stripePriceId: product.stripe_price_id,
      pricingValid: pricingValidation.ok,
      pricingError: pricingValidation.ok ? null : pricingValidation.message,
    };
  }
}
