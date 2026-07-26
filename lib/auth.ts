import "server-only";
import type { User } from "@supabase/supabase-js";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function getSafeNextPath(
  value: string | null | undefined,
  fallback = "/account",
): string {
  if (!value || typeof value !== "string") {
    return fallback;
  }

  const trimmed = value.trim();

  if (!trimmed.startsWith("/")) {
    return fallback;
  }

  if (trimmed.startsWith("//")) {
    return fallback;
  }

  if (trimmed.includes("://")) {
    return fallback;
  }

  if (trimmed.toLowerCase().startsWith("javascript:")) {
    return fallback;
  }

  if (trimmed.includes("\\")) {
    return fallback;
  }

  return trimmed;
}

export async function getAuthenticatedUser(): Promise<User | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    return user;
  } catch {
    return null;
  }
}

export type PurchaseLinkResult = {
  ordersLinked: number;
  entitlementsLinked: number;
};

export async function linkPurchasesToAuthenticatedUser(
  user: User,
): Promise<PurchaseLinkResult> {
  if (!user.id || !user.email) {
    return {
      ordersLinked: 0,
      entitlementsLinked: 0,
    };
  }

  if (!isSupabaseConfigured()) {
    return {
      ordersLinked: 0,
      entitlementsLinked: 0,
    };
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.rpc("link_customer_purchases_to_user", {
    p_user_id: user.id,
    p_customer_email: normalizeEmail(user.email),
  });

  if (error) {
    throw error;
  }

  const result = data?.[0];

  return {
    ordersLinked: result?.orders_linked ?? 0,
    entitlementsLinked: result?.entitlements_linked ?? 0,
  };
}
