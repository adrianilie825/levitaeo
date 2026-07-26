import "server-only";

import { createHash } from "node:crypto";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export type DownloadEventOutcome =
  | "signed_url_issued"
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "file_missing"
  | "rate_limited"
  | "sign_failed"
  | "error";

type LogDownloadEventInput = {
  userId: string;
  productId?: string | null;
  entitlementId?: string | null;
  outcome: DownloadEventOutcome;
  ipAddress?: string | null;
  userAgent?: string | null;
};

function hashIpAddress(ipAddress: string): string {
  return createHash("sha256")
    .update(`${ipAddress}:levitaeo-download-log`)
    .digest("hex")
    .slice(0, 32);
}

function sanitizeUserAgent(userAgent: string | null | undefined): string | null {
  if (!userAgent) {
    return null;
  }

  const trimmed = userAgent.trim().slice(0, 512);
  return trimmed.length > 0 ? trimmed : null;
}

export async function logDownloadEvent(input: LogDownloadEventInput): Promise<void> {
  try {
    const supabase = getSupabaseAdmin();

    await supabase.from("download_events").insert({
      user_id: input.userId,
      product_id: input.productId ?? null,
      entitlement_id: input.entitlementId ?? null,
      outcome: input.outcome,
      ip_hash: input.ipAddress ? hashIpAddress(input.ipAddress) : null,
      user_agent: sanitizeUserAgent(input.userAgent),
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[downloads] Failed to log download event:", error);
    }
  }
}
