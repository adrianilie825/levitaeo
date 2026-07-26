import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { EntitlementStatus } from "@/types/database";

export type UserEntitlement = {
  productSlug: string;
  status: EntitlementStatus;
  grantedAt: string;
};

export async function getCurrentUserEntitlements(): Promise<UserEntitlement[]> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return [];
  }

  const { data, error } = await supabase
    .from("entitlements")
    .select("product_slug, status, granted_at")
    .eq("status", "active")
    .order("granted_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => ({
    productSlug: row.product_slug,
    status: row.status,
    grantedAt: row.granted_at,
  }));
}
