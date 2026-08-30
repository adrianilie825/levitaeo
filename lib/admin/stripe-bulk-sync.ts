import "server-only";

import {
  listAdminProducts,
  updateAdminProductStripeIds,
  type AdminProductRow,
} from "@/lib/admin/catalog";
import {
  ensureStripePriceForProduct,
  validateStripeProductPricing,
  type StripeProductPricingInput,
} from "@/lib/stripe/product-pricing";

export type StripeBulkSyncOutcome = "created" | "updated" | "skipped" | "failed";

export type StripeBulkSyncItemEvent = {
  type: "item";
  productId: string;
  slug: string;
  title: string;
  outcome: StripeBulkSyncOutcome;
  message: string;
};

export type StripeBulkSyncSummaryEvent = {
  type: "summary";
  total: number;
  created: number;
  updated: number;
  skipped: number;
  failed: number;
};

export type StripeBulkSyncEvent =
  | StripeBulkSyncItemEvent
  | StripeBulkSyncSummaryEvent;

export function adminProductPricingInput(
  product: AdminProductRow,
): StripeProductPricingInput {
  return {
    productId: product.id,
    slug: product.slug,
    title: product.title,
    collectionSlug: product.collections?.slug ?? "originals",
    priceCents: product.price_cents,
    currency: product.currency,
    stripeProductId: product.stripe_product_id,
    stripePriceId: product.stripe_price_id,
  };
}

function classifyOutcome(input: {
  hadPriceId: boolean;
  createdProduct: boolean;
  createdPrice: boolean;
}): Exclude<StripeBulkSyncOutcome, "failed"> {
  if (!input.createdProduct && !input.createdPrice) {
    return "skipped";
  }

  if (input.createdPrice && input.hadPriceId) {
    return "updated";
  }

  return "created";
}

function outcomeMessage(outcome: Exclude<StripeBulkSyncOutcome, "failed">): string {
  switch (outcome) {
    case "skipped":
      return "Already in sync with Stripe.";
    case "updated":
      return "Stripe price updated.";
    case "created":
      return "Stripe product and price created.";
  }
}

export async function syncAdminProductWithStripe(
  product: AdminProductRow,
): Promise<StripeBulkSyncItemEvent> {
  const baseEvent = {
    type: "item" as const,
    productId: product.id,
    slug: product.slug,
    title: product.title,
  };

  const pricingValidation = validateStripeProductPricing({
    priceCents: product.price_cents,
    currency: product.currency,
  });

  if (!pricingValidation.ok) {
    return {
      ...baseEvent,
      outcome: "failed",
      message: pricingValidation.message,
    };
  }

  const hadPriceId = Boolean(product.stripe_price_id?.trim());
  const result = await ensureStripePriceForProduct(
    adminProductPricingInput(product),
  );

  if (!result.ok) {
    return {
      ...baseEvent,
      outcome: "failed",
      message: result.message,
    };
  }

  const outcome = classifyOutcome({
    hadPriceId,
    createdProduct: result.createdProduct,
    createdPrice: result.createdPrice,
  });

  try {
    await updateAdminProductStripeIds(product.id, {
      stripe_product_id: result.stripeProductId,
      stripe_price_id: result.stripePriceId,
    });
  } catch {
    return {
      ...baseEvent,
      outcome: "failed",
      message:
        "Stripe resources were synced but the edition record could not be updated.",
    };
  }

  return {
    ...baseEvent,
    outcome,
    message: outcomeMessage(outcome),
  };
}

export async function* streamAdminStripeBulkSync(): AsyncGenerator<StripeBulkSyncEvent> {
  const products = await listAdminProducts();
  const summary: Omit<StripeBulkSyncSummaryEvent, "type"> = {
    total: products.length,
    created: 0,
    updated: 0,
    skipped: 0,
    failed: 0,
  };

  for (const product of products) {
    const item = await syncAdminProductWithStripe(product);
    summary[item.outcome] += 1;
    yield item;
  }

  yield {
    type: "summary",
    ...summary,
  };
}
