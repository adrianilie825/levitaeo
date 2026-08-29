import "server-only";

import type Stripe from "stripe";
import {
  STRIPE_DIGITAL_ARTWORK_TAX_CODE,
  isStripeManagedPaymentsEnabled,
} from "@/lib/stripe/constants";
import { getStripe } from "@/lib/stripe";

export async function ensureStripeProductTaxCode(
  stripe: Stripe,
  stripeProductId: string,
): Promise<void> {
  const product = await stripe.products.retrieve(stripeProductId);

  if (product.tax_code === STRIPE_DIGITAL_ARTWORK_TAX_CODE) {
    return;
  }

  await stripe.products.update(stripeProductId, {
    tax_code: STRIPE_DIGITAL_ARTWORK_TAX_CODE,
  });
}

export async function ensureCheckoutProductTaxCode(
  stripePriceId: string,
): Promise<void> {
  const stripe = getStripe();
  const price = await stripe.prices.retrieve(stripePriceId, {
    expand: ["product"],
  });

  const stripeProductId =
    typeof price.product === "string" ? price.product : price.product.id;

  await ensureStripeProductTaxCode(stripe, stripeProductId);
}

export function buildCheckoutSessionParams(
  params: Stripe.Checkout.SessionCreateParams,
): Stripe.Checkout.SessionCreateParams {
  if (isStripeManagedPaymentsEnabled()) {
    return {
      ...params,
      managed_payments: { enabled: true },
    };
  }

  return {
    ...params,
    managed_payments: { enabled: false },
  };
}
