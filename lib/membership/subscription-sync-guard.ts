import type { MembershipSubscriptionStatus } from "@/types/database";
import { isBlockingMembershipCheckoutStatus } from "@/lib/membership/status-map";

export type MembershipSubscriptionSyncSnapshot = {
  stripeSubscriptionId: string;
  status: MembershipSubscriptionStatus;
  currentPeriodStart: string;
};

export type MembershipSubscriptionSyncDecision =
  | { action: "apply" }
  | { action: "ignore"; reason: "stale_subscription_event" };

function isSupersedingMembershipStatus(
  status: MembershipSubscriptionStatus,
): boolean {
  return status === "active" || status === "trialing";
}

function isTerminalMembershipStatus(
  status: MembershipSubscriptionStatus,
): boolean {
  return status === "canceled" || status === "incomplete_expired";
}

function parsePeriodStart(value: string): number | null {
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? null : timestamp;
}

/**
 * Decide whether an incoming Stripe subscription event may replace the stored
 * membership_subscriptions row for a user.
 *
 * Same subscription ID always applies (idempotent updates).
 * When subscription IDs differ, stale/out-of-order events from an older
 * subscription must not overwrite a newer live subscription.
 */
export function resolveMembershipSubscriptionSyncDecision(input: {
  existing: MembershipSubscriptionSyncSnapshot | null;
  incoming: MembershipSubscriptionSyncSnapshot;
}): MembershipSubscriptionSyncDecision {
  if (!input.existing) {
    return { action: "apply" };
  }

  if (
    input.existing.stripeSubscriptionId === input.incoming.stripeSubscriptionId
  ) {
    return { action: "apply" };
  }

  const existingIsLive = isBlockingMembershipCheckoutStatus(input.existing.status);

  if (!existingIsLive) {
    return { action: "apply" };
  }

  if (isTerminalMembershipStatus(input.incoming.status)) {
    return { action: "ignore", reason: "stale_subscription_event" };
  }

  if (isSupersedingMembershipStatus(input.incoming.status)) {
    const existingStart = parsePeriodStart(input.existing.currentPeriodStart);
    const incomingStart = parsePeriodStart(input.incoming.currentPeriodStart);

    if (
      existingStart !== null &&
      incomingStart !== null &&
      incomingStart > existingStart
    ) {
      return { action: "apply" };
    }
  }

  return { action: "ignore", reason: "stale_subscription_event" };
}
