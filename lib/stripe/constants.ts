import "server-only";

/**
 * Digital photographs/images downloaded with permanent rights.
 * Eligible for Stripe Managed Payments (digital artwork).
 */
export const STRIPE_DIGITAL_ARTWORK_TAX_CODE = "txcd_10501000";

export function isStripeManagedPaymentsEnabled(): boolean {
  const value = process.env.STRIPE_MANAGED_PAYMENTS?.trim().toLowerCase();

  if (value === "false" || value === "0" || value === "no") {
    return false;
  }

  return true;
}
