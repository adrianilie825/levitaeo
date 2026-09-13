import type Stripe from "stripe";
import type { MembershipSubscriptionStatus } from "@/types/database";

const MEMBERSHIP_SUBSCRIPTION_STATUSES = [
  "trialing",
  "active",
  "past_due",
  "canceled",
  "unpaid",
  "incomplete",
  "incomplete_expired",
  "paused",
] as const satisfies readonly MembershipSubscriptionStatus[];

const membershipStatusSet = new Set<string>(MEMBERSHIP_SUBSCRIPTION_STATUSES);

export function isMembershipSubscriptionStatus(
  value: string,
): value is MembershipSubscriptionStatus {
  return membershipStatusSet.has(value);
}

export function mapStripeSubscriptionStatus(
  status: Stripe.Subscription.Status,
): MembershipSubscriptionStatus {
  if (isMembershipSubscriptionStatus(status)) {
    return status;
  }

  return "canceled";
}

export function isBlockingMembershipCheckoutStatus(
  status: MembershipSubscriptionStatus,
): boolean {
  return (
    status === "active" ||
    status === "trialing" ||
    status === "past_due" ||
    status === "unpaid" ||
    status === "paused" ||
    status === "incomplete"
  );
}
