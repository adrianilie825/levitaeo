import "server-only";

import type Stripe from "stripe";
import {
  syncMembershipFromCheckoutSession,
  syncMembershipFromInvoice,
  syncMembershipFromStripeSubscription,
} from "@/lib/membership/sync-from-stripe";

type WebhookLogContext = {
  eventId?: string;
  eventType?: string;
  sessionId?: string;
};

type Logger = {
  info: (message: string, extra?: Record<string, unknown>) => void;
};

export async function handleMembershipCheckoutSessionCompleted(
  session: Stripe.Checkout.Session,
  context: WebhookLogContext,
  log: Logger,
): Promise<void> {
  const result = await syncMembershipFromCheckoutSession(session);

  log.info("Membership checkout session synchronized.", {
    eventId: context.eventId,
    sessionId: session.id,
    userId: result.subscription.user_id,
    subscriptionId: result.subscription.stripe_subscription_id,
    status: result.subscription.status,
    ignoredStaleEvent: result.ignoredStaleEvent,
  });
}

export async function handleMembershipSubscriptionEvent(
  subscription: Stripe.Subscription,
  context: WebhookLogContext,
  log: Logger,
): Promise<void> {
  const result = await syncMembershipFromStripeSubscription({ subscription });

  log.info("Membership subscription synchronized.", {
    eventId: context.eventId,
    eventType: context.eventType,
    userId: result.subscription.user_id,
    subscriptionId: result.subscription.stripe_subscription_id,
    status: result.subscription.status,
    cancelAtPeriodEnd: result.subscription.cancel_at_period_end,
    ignoredStaleEvent: result.ignoredStaleEvent,
  });
}

export async function handleMembershipInvoiceEvent(
  invoice: Stripe.Invoice,
  context: WebhookLogContext,
  log: Logger,
): Promise<void> {
  const result = await syncMembershipFromInvoice(invoice);

  if (!result) {
    log.info("Invoice event ignored: no subscription attached.", {
      eventId: context.eventId,
      eventType: context.eventType,
      invoiceId: invoice.id,
    });
    return;
  }

  log.info("Membership invoice event synchronized subscription.", {
    eventId: context.eventId,
    eventType: context.eventType,
    invoiceId: invoice.id,
    userId: result.subscription.user_id,
    subscriptionId: result.subscription.stripe_subscription_id,
    status: result.subscription.status,
    ignoredStaleEvent: result.ignoredStaleEvent,
  });
}
