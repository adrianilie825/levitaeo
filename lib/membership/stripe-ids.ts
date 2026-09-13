import type Stripe from "stripe";

export function extractStripeId(
  value:
    | string
    | Stripe.Customer
    | Stripe.DeletedCustomer
    | Stripe.Subscription
    | null
    | undefined,
): string | null {
  if (!value) {
    return null;
  }

  if (typeof value === "string") {
    return value;
  }

  return "id" in value ? (value.id ?? null) : null;
}
