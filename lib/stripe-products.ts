import "server-only";

const stripePriceEnvMap: Record<string, string | undefined> = {
  "originals-no-01": process.env.STRIPE_PRICE_ORIGINALS_NO_01,
  "originals-no-02": process.env.STRIPE_PRICE_ORIGINALS_NO_02,
  "originals-no-03": process.env.STRIPE_PRICE_ORIGINALS_NO_03,
};

export function getStripePriceId(productSlug: string): string | undefined {
  const priceId = stripePriceEnvMap[productSlug];
  return priceId && priceId.trim().length > 0 ? priceId.trim() : undefined;
}
