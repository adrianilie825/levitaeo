import "server-only";

import {
  PRODUCT_STATUSES,
  type ProductStatusValue,
} from "@/lib/admin/product-constants";

export type FieldErrors = Record<string, string>;

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function parsePriceToCents(value: string): number | null {
  const normalized = value.replace(",", ".").trim();

  if (!normalized) {
    return null;
  }

  const amount = Number(normalized);

  if (!Number.isFinite(amount) || amount < 0) {
    return null;
  }

  return Math.round(amount * 100);
}

export function formatCentsToPriceInput(priceCents: number): string {
  return (priceCents / 100).toFixed(2);
}

export function isValidProductStatus(value: string): value is ProductStatusValue {
  return PRODUCT_STATUSES.includes(value as ProductStatusValue);
}

export function isValidOptionalUrl(value: string): boolean {
  const trimmed = value.trim();

  if (!trimmed) {
    return true;
  }

  if (trimmed.startsWith("/")) {
    return !trimmed.includes(" ");
  }

  try {
    const url = new URL(trimmed);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function normalizeSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function validateSlug(value: string): string | null {
  const slug = normalizeSlug(value);

  if (!slug) {
    return "Slug is required.";
  }

  if (!SLUG_PATTERN.test(slug)) {
    return "Slug may only contain lowercase letters, numbers, and hyphens.";
  }

  return null;
}
