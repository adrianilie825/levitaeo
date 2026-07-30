import "server-only";

import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";

type EntitlementOwnershipRow = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_slug: string;
  status: string;
};

function entitlementMatchesProduct(
  entitlement: EntitlementOwnershipRow,
  productSlug: string,
  productId?: string | null,
): boolean {
  if (productId && entitlement.product_id === productId) {
    return true;
  }

  return entitlement.product_slug === productSlug;
}

export async function userOwnsActiveProduct(input: {
  userId: string;
  productSlug: string;
  productId?: string | null;
}): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    return false;
  }

  const supabase = getSupabaseAdmin();
  const { data: entitlementRows, error: entitlementsError } = await supabase
    .from("entitlements")
    .select("id, order_id, product_id, product_slug, status")
    .eq("user_id", input.userId)
    .eq("status", "active");

  if (entitlementsError || !entitlementRows?.length) {
    if (entitlementsError && process.env.NODE_ENV === "development") {
      console.error(
        "[ownership] Failed to check product ownership:",
        entitlementsError.message,
      );
    }

    return false;
  }

  const matchingEntitlements = (entitlementRows as EntitlementOwnershipRow[]).filter(
    (row) =>
      entitlementMatchesProduct(row, input.productSlug, input.productId),
  );

  if (matchingEntitlements.length === 0) {
    return false;
  }

  const orderIds = [...new Set(matchingEntitlements.map((row) => row.order_id))];
  const { data: paidOrders, error: ordersError } = await supabase
    .from("orders")
    .select("id")
    .in("id", orderIds)
    .eq("status", "paid");

  if (ordersError) {
    if (process.env.NODE_ENV === "development") {
      console.error(
        "[ownership] Failed to verify paid orders:",
        ordersError.message,
      );
    }

    return false;
  }

  return (paidOrders?.length ?? 0) > 0;
}

export function checkoutSessionBelongsToUser(
  sessionUserId: string | null | undefined,
  userId: string,
): boolean {
  if (!sessionUserId?.trim()) {
    return false;
  }

  return sessionUserId.trim() === userId;
}

export function getCheckoutSessionUserId(session: {
  client_reference_id?: string | null;
  metadata?: Record<string, string> | null;
}): string | null {
  const fromReference = session.client_reference_id?.trim();
  if (fromReference) {
    return fromReference;
  }

  const fromMetadata = session.metadata?.supabaseUserId?.trim();
  return fromMetadata || null;
}
