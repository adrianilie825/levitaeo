import "server-only";

import {
  getAuthenticatedUser,
  linkPurchasesToAuthenticatedUser,
} from "@/lib/auth";
import { ELIGIBLE_ORDER_STATUSES } from "@/lib/downloads/constants";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { EntitlementStatus, OrderStatus } from "@/types/database";

export type AuthorizedDownload = {
  userId: string;
  productId: string;
  entitlementId: string;
  storagePath: string;
  filename: string;
  mimeType: string | null;
};

export type DownloadAuthorizationFailure =
  | "unauthenticated"
  | "not_found"
  | "forbidden";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type EntitlementRow = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_slug: string;
  status: EntitlementStatus;
};

type OrderRow = {
  id: string;
  status: OrderStatus;
};

type ProductDownloadRow = {
  id: string;
  slug: string;
  download_storage_path: string | null;
  download_filename: string | null;
  download_mime_type: string | null;
};

function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}

function entitlementMatchesProduct(
  entitlement: EntitlementRow,
  product: ProductDownloadRow,
): boolean {
  if (entitlement.product_id && entitlement.product_id === product.id) {
    return true;
  }

  return entitlement.product_slug === product.slug;
}

function isEligibleEntitlement(status: EntitlementStatus): boolean {
  return status === "active";
}

function isEligibleOrderStatus(status: OrderStatus): boolean {
  return ELIGIBLE_ORDER_STATUSES.includes(
    status as (typeof ELIGIBLE_ORDER_STATUSES)[number],
  );
}

export async function authorizeProductDownload(
  productIdOrSlug: string,
): Promise<
  | { ok: true; download: AuthorizedDownload }
  | { ok: false; reason: DownloadAuthorizationFailure }
> {
  const user = await getAuthenticatedUser();

  if (!user) {
    return { ok: false, reason: "unauthenticated" };
  }

  try {
    await linkPurchasesToAuthenticatedUser(user);
  } catch {
    // Linking is best-effort; authorization still requires user_id on entitlements.
  }

  const identifier = productIdOrSlug.trim();

  if (!identifier) {
    return { ok: false, reason: "not_found" };
  }

  const admin = getSupabaseAdmin();
  let productQuery = admin
    .from("products")
    .select(
      "id, slug, download_storage_path, download_filename, download_mime_type",
    );

  productQuery = isUuid(identifier)
    ? productQuery.eq("id", identifier)
    : productQuery.eq("slug", identifier);

  const { data: productData, error: productError } =
    await productQuery.maybeSingle();

  if (productError || !productData) {
    return { ok: false, reason: "not_found" };
  }

  const product = productData as ProductDownloadRow;
  const storagePath = product.download_storage_path?.trim();

  if (!storagePath) {
    return { ok: false, reason: "not_found" };
  }

  const supabase = await createClient();
  const { data: entitlementRows, error: entitlementsError } = await supabase
    .from("entitlements")
    .select("id, order_id, product_id, product_slug, status")
    .eq("user_id", user.id)
    .eq("status", "active");

  if (entitlementsError) {
    return { ok: false, reason: "forbidden" };
  }

  const entitlement = (entitlementRows as EntitlementRow[] | null)?.find(
    (row) => entitlementMatchesProduct(row, product),
  );

  if (!entitlement || !isEligibleEntitlement(entitlement.status)) {
    return { ok: false, reason: "forbidden" };
  }

  const { data: orderData, error: orderError } = await supabase
    .from("orders")
    .select("id, status")
    .eq("id", entitlement.order_id)
    .maybeSingle();

  if (orderError || !orderData) {
    return { ok: false, reason: "forbidden" };
  }

  const order = orderData as OrderRow;

  if (!isEligibleOrderStatus(order.status)) {
    return { ok: false, reason: "forbidden" };
  }

  const filename =
    product.download_filename?.trim() ||
    `${product.slug}.zip`;

  return {
    ok: true,
    download: {
      userId: user.id,
      productId: product.id,
      entitlementId: entitlement.id,
      storagePath,
      filename,
      mimeType: product.download_mime_type?.trim() || null,
    },
  };
}
