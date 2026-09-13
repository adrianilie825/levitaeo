import "server-only";

import type Stripe from "stripe";
import { MEMBERSHIP_PURCHASE_TYPE } from "@/lib/membership/constants";
import { MembershipValidationError } from "@/lib/membership/errors";
import { mapStripeSubscriptionStatus } from "@/lib/membership/status-map";
import { extractStripeId } from "@/lib/membership/stripe-ids";
import {
  type MembershipSubscriptionSyncResult,
  upsertMembershipSubscription,
} from "@/lib/membership/subscriptions";
import {
  ensureUserBillingFromStripeCustomer,
  getUserIdByStripeCustomerId,
} from "@/lib/membership/user-billing";
import { getCheckoutSessionUserId } from "@/lib/purchases/ownership";
import { getStripe } from "@/lib/stripe";

function unixSecondsToIso(value: number | null | undefined): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  return new Date(value * 1000).toISOString();
}

function getPrimarySubscriptionItem(
  subscription: Stripe.Subscription,
): Stripe.SubscriptionItem | null {
  return subscription.items.data[0] ?? null;
}

function getPrimaryStripePriceId(
  subscription: Stripe.Subscription,
): string | null {
  const price = getPrimarySubscriptionItem(subscription)?.price;

  if (!price) {
    return null;
  }

  return typeof price === "string" ? price : price.id;
}

function getSubscriptionBillingPeriod(subscription: Stripe.Subscription): {
  currentPeriodStart: number;
  currentPeriodEnd: number;
} {
  const item = getPrimarySubscriptionItem(subscription);

  if (!item?.current_period_start || !item?.current_period_end) {
    throw new MembershipValidationError(
      "Stripe subscription is missing billing period timestamps.",
    );
  }

  return {
    currentPeriodStart: item.current_period_start,
    currentPeriodEnd: item.current_period_end,
  };
}

export function isMembershipCheckoutSession(
  session: Stripe.Checkout.Session,
): boolean {
  return (
    session.mode === "subscription" &&
    session.metadata?.purchaseType?.trim() === MEMBERSHIP_PURCHASE_TYPE
  );
}

export function isDigitalArtworkPaymentSession(
  session: Stripe.Checkout.Session,
): boolean {
  return session.mode === "payment";
}

export async function resolveMembershipUserId(input: {
  subscription: Stripe.Subscription;
  explicitUserId?: string | null;
}): Promise<string> {
  const explicitUserId = input.explicitUserId?.trim();

  if (explicitUserId) {
    return explicitUserId;
  }

  const metadataUserId =
    input.subscription.metadata?.supabaseUserId?.trim() ?? null;

  if (metadataUserId) {
    return metadataUserId;
  }

  const stripeCustomerId = extractStripeId(input.subscription.customer);

  if (stripeCustomerId) {
    const userId = await getUserIdByStripeCustomerId(stripeCustomerId);

    if (userId) {
      return userId;
    }
  }

  throw new MembershipValidationError(
    "Unable to resolve Supabase user for membership subscription.",
  );
}

export async function syncMembershipFromStripeSubscription(input: {
  subscription: Stripe.Subscription;
  explicitUserId?: string | null;
}): Promise<MembershipSubscriptionSyncResult> {
  const userId = await resolveMembershipUserId(input);
  const stripeCustomerId = extractStripeId(input.subscription.customer);

  if (stripeCustomerId) {
    await ensureUserBillingFromStripeCustomer({
      userId,
      stripeCustomer: stripeCustomerId,
    });
  }

  const stripePriceId = getPrimaryStripePriceId(input.subscription);

  if (!stripePriceId) {
    throw new MembershipValidationError(
      "Stripe subscription is missing a primary price ID.",
    );
  }

  const billingPeriod = getSubscriptionBillingPeriod(input.subscription);
  const currentPeriodStart = unixSecondsToIso(billingPeriod.currentPeriodStart);
  const currentPeriodEnd = unixSecondsToIso(billingPeriod.currentPeriodEnd);

  if (!currentPeriodStart || !currentPeriodEnd) {
    throw new MembershipValidationError(
      "Stripe subscription billing period timestamps are invalid.",
    );
  }

  return upsertMembershipSubscription({
    userId,
    stripeSubscriptionId: input.subscription.id,
    stripePriceId,
    status: mapStripeSubscriptionStatus(input.subscription.status),
    currentPeriodStart,
    currentPeriodEnd,
    cancelAtPeriodEnd: input.subscription.cancel_at_period_end,
    canceledAt: unixSecondsToIso(input.subscription.canceled_at),
  });
}

export async function retrieveStripeSubscription(
  subscriptionId: string,
): Promise<Stripe.Subscription> {
  const stripe = getStripe();
  return stripe.subscriptions.retrieve(subscriptionId);
}

export async function syncMembershipFromCheckoutSession(
  session: Stripe.Checkout.Session,
): Promise<MembershipSubscriptionSyncResult> {
  if (!isMembershipCheckoutSession(session)) {
    throw new MembershipValidationError(
      "Checkout session is not a membership subscription checkout.",
    );
  }

  const userId = getCheckoutSessionUserId(session);

  if (!userId) {
    throw new MembershipValidationError(
      "Membership checkout session is missing Supabase user identity.",
    );
  }

  const stripeCustomerId = extractStripeId(session.customer);

  if (stripeCustomerId) {
    await ensureUserBillingFromStripeCustomer({
      userId,
      stripeCustomer: stripeCustomerId,
    });
  }

  const subscriptionId = extractStripeId(session.subscription);

  if (!subscriptionId) {
    throw new MembershipValidationError(
      "Membership checkout session is missing Stripe subscription ID.",
    );
  }

  const subscription = await retrieveStripeSubscription(subscriptionId);

  return syncMembershipFromStripeSubscription({
    subscription,
    explicitUserId: userId,
  });
}

function getInvoiceSubscriptionId(invoice: Stripe.Invoice): string | null {
  const subscriptionDetails = invoice.parent?.subscription_details;

  if (!subscriptionDetails) {
    return null;
  }

  return extractStripeId(subscriptionDetails.subscription);
}

export async function syncMembershipFromInvoice(
  invoice: Stripe.Invoice,
): Promise<MembershipSubscriptionSyncResult | null> {
  const subscriptionId = getInvoiceSubscriptionId(invoice);

  if (!subscriptionId) {
    return null;
  }

  const subscription = await retrieveStripeSubscription(subscriptionId);
  return syncMembershipFromStripeSubscription({ subscription });
}

export async function retrieveMembershipCheckoutSession(
  sessionId: string,
): Promise<Stripe.Checkout.Session> {
  const stripe = getStripe();
  return stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["subscription"],
  });
}
