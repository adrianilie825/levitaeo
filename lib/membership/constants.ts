import "server-only";

export const MEMBERSHIP_PURCHASE_TYPE = "membership" as const;

export function getMembershipFoundingPriceId(): string | null {
  const priceId = process.env.STRIPE_MEMBERSHIP_FOUNDING_PRICE_ID?.trim();
  return priceId && priceId.length > 0 ? priceId : null;
}
