import "server-only";

import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import {
  STRIPE_DIGITAL_ARTWORK_TAX_CODE,
  isStripeManagedPaymentsEnabled,
} from "@/lib/stripe/constants";
import { ensureStripeProductTaxCode } from "@/lib/stripe/checkout-prep";

export const SUPPORTED_STRIPE_CURRENCIES = ["EUR", "USD", "GBP", "CHF"] as const;

export type SupportedStripeCurrency = (typeof SUPPORTED_STRIPE_CURRENCIES)[number];

export type StripeProductPricingInput = {
  productId: string;
  slug: string;
  title: string;
  collectionSlug: string;
  priceCents: number;
  currency: string;
  stripeProductId: string | null;
  stripePriceId: string | null;
};

export type StripePriceSyncResult =
  | {
      ok: true;
      stripeProductId: string;
      stripePriceId: string;
      createdProduct: boolean;
      createdPrice: boolean;
    }
  | {
      ok: false;
      code:
        | "invalid_price"
        | "invalid_currency"
        | "stripe_not_configured"
        | "stripe_product_missing"
        | "stripe_error";
      message: string;
    };

export type StripePriceSyncStatus = {
  configured: boolean;
  inSync: boolean;
  stripeProductId: string | null;
  stripePriceId: string | null;
};

function normalizeCurrency(currency: string): SupportedStripeCurrency | null {
  const normalized = currency.trim().toUpperCase();

  if (
    !SUPPORTED_STRIPE_CURRENCIES.includes(
      normalized as SupportedStripeCurrency,
    )
  ) {
    return null;
  }

  return normalized as SupportedStripeCurrency;
}

export function getStripePriceProductId(price: Stripe.Price): string {
  return typeof price.product === "string" ? price.product : price.product.id;
}

function isExistingPriceCheckoutCompatible(
  price: Stripe.Price,
  input: {
    priceCents: number;
    currency: SupportedStripeCurrency;
    stripeProductId: string;
  },
): boolean {
  if (!price.active || price.type !== "one_time") {
    return false;
  }

  if (price.unit_amount !== input.priceCents) {
    return false;
  }

  if (price.currency.toUpperCase() !== input.currency) {
    return false;
  }

  if (getStripePriceProductId(price) !== input.stripeProductId) {
    return false;
  }

  if (
    isStripeManagedPaymentsEnabled() &&
    price.tax_behavior !== "exclusive"
  ) {
    return false;
  }

  return true;
}

export function validateStripeProductPricing(input: {
  priceCents: number;
  currency: string;
}):
  | { ok: true; currency: SupportedStripeCurrency }
  | { ok: false; code: "invalid_price" | "invalid_currency"; message: string } {
  if (!Number.isInteger(input.priceCents) || input.priceCents <= 0) {
    return {
      ok: false,
      code: "invalid_price",
      message: "Price must be greater than zero before creating a Stripe price.",
    };
  }

  const currency = normalizeCurrency(input.currency);

  if (!currency) {
    return {
      ok: false,
      code: "invalid_currency",
      message: `Currency must be one of: ${SUPPORTED_STRIPE_CURRENCIES.join(", ")}.`,
    };
  }

  return { ok: true, currency };
}

export async function getStripePriceSyncStatus(
  input: StripeProductPricingInput,
): Promise<StripePriceSyncStatus> {
  const stripePriceId = input.stripePriceId?.trim() || null;
  const stripeProductId = input.stripeProductId?.trim() || null;

  if (!stripePriceId) {
    return {
      configured: false,
      inSync: false,
      stripeProductId,
      stripePriceId: null,
    };
  }

  const pricingValidation = validateStripeProductPricing({
    priceCents: input.priceCents,
    currency: input.currency,
  });

  if (!pricingValidation.ok) {
    return {
      configured: Boolean(stripePriceId),
      inSync: false,
      stripeProductId,
      stripePriceId,
    };
  }

  try {
    const stripe = getStripe();
    const price = await stripe.prices.retrieve(stripePriceId);
    const resolvedProductId = getStripePriceProductId(price);
    const inSync =
      Boolean(stripeProductId) &&
      isExistingPriceCheckoutCompatible(price, {
        priceCents: input.priceCents,
        currency: pricingValidation.currency,
        stripeProductId: stripeProductId!,
      }) &&
      resolvedProductId === stripeProductId;

    return {
      configured: true,
      inSync,
      stripeProductId: stripeProductId ?? resolvedProductId,
      stripePriceId,
    };
  } catch {
    return {
      configured: Boolean(stripePriceId),
      inSync: false,
      stripeProductId,
      stripePriceId,
    };
  }
}

export async function ensureStripePriceForProduct(
  input: StripeProductPricingInput,
): Promise<StripePriceSyncResult> {
  const validation = validateStripeProductPricing({
    priceCents: input.priceCents,
    currency: input.currency,
  });

  if (!validation.ok) {
    return validation;
  }

  let stripe: ReturnType<typeof getStripe>;

  try {
    stripe = getStripe();
  } catch {
    return {
      ok: false,
      code: "stripe_not_configured",
      message: "Stripe is not configured on the server.",
    };
  }

  const currency = validation.currency.toLowerCase();
  const metadata = {
    productId: input.productId,
    slug: input.slug,
    collection: input.collectionSlug,
    purchaseType: "digital-artwork",
  };

  const productPayload = {
    name: input.title,
    metadata,
    tax_code: STRIPE_DIGITAL_ARTWORK_TAX_CODE,
  };

  let stripeProductId = input.stripeProductId?.trim() || null;
  let createdProduct = false;

  if (stripeProductId) {
    try {
      await stripe.products.update(stripeProductId, productPayload);
      await ensureStripeProductTaxCode(stripe, stripeProductId);
    } catch {
      stripeProductId = null;
    }
  }

  if (!stripeProductId) {
    try {
      const product = await stripe.products.create(productPayload);
      stripeProductId = product.id;
      createdProduct = true;
      await ensureStripeProductTaxCode(stripe, stripeProductId);
    } catch {
      return {
        ok: false,
        code: "stripe_error",
        message: "The Stripe product could not be created.",
      };
    }
  }

  const existingPriceId = input.stripePriceId?.trim() || null;

  if (existingPriceId) {
    try {
      const existingPrice = await stripe.prices.retrieve(existingPriceId);

      if (
        isExistingPriceCheckoutCompatible(existingPrice, {
          priceCents: input.priceCents,
          currency: validation.currency,
          stripeProductId,
        })
      ) {
        await ensureStripeProductTaxCode(
          stripe,
          getStripePriceProductId(existingPrice),
        );

        return {
          ok: true,
          stripeProductId,
          stripePriceId: existingPriceId,
          createdProduct,
          createdPrice: false,
        };
      }
    } catch {
      // Fall through and create a replacement price on the canonical product.
    }
  }

  try {
    const price = await stripe.prices.create({
      product: stripeProductId,
      unit_amount: input.priceCents,
      currency,
      tax_behavior: "exclusive",
      metadata,
    });

    await ensureStripeProductTaxCode(stripe, stripeProductId);

    return {
      ok: true,
      stripeProductId,
      stripePriceId: price.id,
      createdProduct,
      createdPrice: true,
    };
  } catch {
    return {
      ok: false,
      code: "stripe_error",
      message: "The Stripe price could not be created.",
    };
  }
}
