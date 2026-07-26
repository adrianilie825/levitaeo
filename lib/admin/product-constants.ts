export const PRODUCT_STATUSES = [
  "draft",
  "coming_soon",
  "published",
  "archived",
] as const;

export type ProductStatusValue = (typeof PRODUCT_STATUSES)[number];

export function formatCentsToPriceInput(priceCents: number): string {
  return (priceCents / 100).toFixed(2);
}

export function statusLabel(status: string): string {
  return status.replace(/_/g, " ");
}
