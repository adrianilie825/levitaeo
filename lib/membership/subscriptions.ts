import "server-only";

import {
  MembershipPersistenceError,
  MembershipValidationError,
} from "@/lib/membership/errors";
import { isBlockingMembershipCheckoutStatus } from "@/lib/membership/status-map";
import { resolveMembershipSubscriptionSyncDecision } from "@/lib/membership/subscription-sync-guard";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";
import type { MembershipSubscriptionRow } from "@/types/database";

export async function getMembershipSubscriptionForUser(
  userId: string,
): Promise<MembershipSubscriptionRow | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("membership_subscriptions")
    .select(
      "id, user_id, stripe_subscription_id, stripe_price_id, status, current_period_start, current_period_end, cancel_at_period_end, canceled_at, created_at, updated_at",
    )
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new MembershipPersistenceError(
      `Failed to load membership subscription: ${error.message}`,
    );
  }

  return (data as MembershipSubscriptionRow | null) ?? null;
}

export function shouldBlockNewMembershipCheckout(
  subscription: MembershipSubscriptionRow | null,
): boolean {
  if (!subscription) {
    return false;
  }

  return isBlockingMembershipCheckoutStatus(subscription.status);
}

export type MembershipSubscriptionUpsertInput = {
  userId: string;
  stripeSubscriptionId: string;
  stripePriceId: string;
  status: MembershipSubscriptionRow["status"];
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  canceledAt: string | null;
};

export type MembershipSubscriptionSyncResult = {
  subscription: MembershipSubscriptionRow;
  ignoredStaleEvent: boolean;
};

export async function upsertMembershipSubscription(
  input: MembershipSubscriptionUpsertInput,
): Promise<MembershipSubscriptionSyncResult> {
  if (!isSupabaseConfigured()) {
    throw new MembershipPersistenceError("Supabase is not configured.");
  }

  const userId = input.userId.trim();
  const stripeSubscriptionId = input.stripeSubscriptionId.trim();
  const stripePriceId = input.stripePriceId.trim();

  if (!userId || !stripeSubscriptionId || !stripePriceId) {
    throw new MembershipValidationError(
      "Membership subscription upsert requires user, subscription, and price IDs.",
    );
  }

  const admin = getSupabaseAdmin();
  const { data: existing, error: existingError } = await admin
    .from("membership_subscriptions")
    .select(
      "id, user_id, stripe_subscription_id, stripe_price_id, status, current_period_start, current_period_end, cancel_at_period_end, canceled_at, created_at, updated_at",
    )
    .eq("user_id", userId)
    .maybeSingle();

  if (existingError) {
    throw new MembershipPersistenceError(
      `Failed to load existing membership subscription: ${existingError.message}`,
    );
  }

  const existingRow = existing as MembershipSubscriptionRow | null;

  const syncDecision = resolveMembershipSubscriptionSyncDecision({
    existing: existingRow
      ? {
          stripeSubscriptionId: existingRow.stripe_subscription_id,
          status: existingRow.status,
          currentPeriodStart: existingRow.current_period_start,
        }
      : null,
    incoming: {
      stripeSubscriptionId,
      status: input.status,
      currentPeriodStart: input.currentPeriodStart,
    },
  });

  if (syncDecision.action === "ignore" && existingRow) {
    return {
      subscription: existingRow,
      ignoredStaleEvent: true,
    };
  }

  const { data, error } = await admin
    .from("membership_subscriptions")
    .upsert(
      {
        user_id: userId,
        stripe_subscription_id: stripeSubscriptionId,
        stripe_price_id: stripePriceId,
        status: input.status,
        current_period_start: input.currentPeriodStart,
        current_period_end: input.currentPeriodEnd,
        cancel_at_period_end: input.cancelAtPeriodEnd,
        canceled_at: input.canceledAt,
      },
      { onConflict: "user_id" },
    )
    .select(
      "id, user_id, stripe_subscription_id, stripe_price_id, status, current_period_start, current_period_end, cancel_at_period_end, canceled_at, created_at, updated_at",
    )
    .single();

  if (error || !data) {
    throw new MembershipPersistenceError(
      `Failed to upsert membership subscription: ${error?.message ?? "unknown error"}`,
    );
  }

  return {
    subscription: data as MembershipSubscriptionRow,
    ignoredStaleEvent: false,
  };
}
