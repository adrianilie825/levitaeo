import { NextResponse } from "next/server";
import type Stripe from "stripe";
import {
  OrderPersistenceError,
  OrderValidationError,
  recordExpiredCheckoutSession,
  recordFailedCheckoutSession,
  recordPaidCheckoutSession,
  recordPendingCheckoutSession,
} from "@/lib/orders";
import { getStripe } from "@/lib/stripe";
import { isSupabaseConfigured } from "@/lib/supabase/admin";
import type { CheckoutStatusResult, FulfillmentResult } from "@/types/database";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type WebhookLogContext = {
  eventId?: string;
  eventType?: string;
  sessionId?: string;
};

function getSupabaseConfigStatus() {
  return {
    configured: isSupabaseConfigured(),
    urlConfigured: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()),
    secretConfigured: Boolean(
      process.env.SUPABASE_SECRET_KEY?.trim() ||
        process.env.SUPABASE_SERVICE_ROLE_KEY?.trim(),
    ),
  };
}

function serializeError(error: unknown): Record<string, unknown> {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack ?? null,
    };
  }

  return { message: String(error) };
}

function logWebhookInfo(
  message: string,
  context: WebhookLogContext = {},
  extra?: Record<string, unknown>,
) {
  console.info(`[stripe-webhook] ${message}`, {
    eventId: context.eventId ?? null,
    eventType: context.eventType ?? null,
    sessionId: context.sessionId ?? null,
    ...extra,
  });
}

function logWebhookError(
  message: string,
  error: unknown,
  context: WebhookLogContext = {},
  extra?: Record<string, unknown>,
) {
  console.error(`[stripe-webhook] ${message}`, {
    eventId: context.eventId ?? null,
    eventType: context.eventType ?? null,
    sessionId: context.sessionId ?? null,
    error: serializeError(error),
    ...extra,
  });
}

function webhookErrorResponse(status: number, error: string, code: string) {
  return NextResponse.json({ error, code }, { status });
}

function summarizeCheckoutSession(session: Stripe.Checkout.Session) {
  return {
    id: session.id,
    mode: session.mode,
    status: session.status,
    paymentStatus: session.payment_status ?? null,
    amountTotal: session.amount_total ?? null,
    currency: session.currency ?? null,
    livemode: session.livemode,
    clientReferenceId: session.client_reference_id ?? null,
    customerEmailPresent: Boolean(
      session.customer_details?.email ?? session.customer_email,
    ),
    metadata: {
      productSlug: session.metadata?.productSlug ?? null,
      productId: session.metadata?.productId ?? null,
      supabaseUserId: session.metadata?.supabaseUserId ?? null,
      purchaseType: session.metadata?.purchaseType ?? null,
    },
  };
}

function logFulfillmentResult(
  context: WebhookLogContext,
  result: FulfillmentResult,
) {
  logWebhookInfo("Order creation result.", context, {
    orderId: result.order_id,
    processed: result.processed,
    alreadyProcessed: result.already_processed,
  });

  logWebhookInfo("Entitlement creation result.", context, {
    entitlementId: result.entitlement_id,
    processed: result.processed,
    alreadyProcessed: result.already_processed,
  });

  logWebhookInfo("Download creation.", context, {
    performed: false,
    reason:
      "Webhook fulfillment does not create download files; signed URLs are issued on-demand via /api/downloads after entitlement verification.",
    orderId: result.order_id,
    entitlementId: result.entitlement_id,
  });
}

function logCheckoutStatusResult(
  context: WebhookLogContext,
  result: CheckoutStatusResult,
  statusLabel: string,
) {
  logWebhookInfo(`${statusLabel} order persistence result.`, context, {
    orderId: result.order_id,
    processed: result.processed,
    alreadyProcessed: result.already_processed,
  });

  logWebhookInfo("Entitlement creation.", context, {
    performed: false,
    reason: `${statusLabel} checkout events do not create entitlements.`,
    orderId: result.order_id,
  });

  logWebhookInfo("Download creation.", context, {
    performed: false,
    reason: "No download assets are created during webhook processing.",
    orderId: result.order_id,
  });
}

async function retrieveCheckoutSession(
  sessionId: string,
  context: WebhookLogContext,
): Promise<Stripe.Checkout.Session> {
  logWebhookInfo("Retrieving Checkout Session from Stripe.", context, {
    sessionId,
  });

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items", "payment_intent"],
    });

    logWebhookInfo("Checkout Session retrieved.", context, {
      session: summarizeCheckoutSession(session),
      lineItemCount: session.line_items?.data.length ?? 0,
    });

    return session;
  } catch (error) {
    logWebhookError("Failed to retrieve Checkout Session from Stripe.", error, {
      ...context,
      sessionId,
    });
    throw error;
  }
}

async function handlePaidCheckoutSession(
  event: Stripe.Event,
  session: Stripe.Checkout.Session,
) {
  const context: WebhookLogContext = {
    eventId: event.id,
    eventType: event.type,
    sessionId: session.id,
  };

  logWebhookInfo("Starting paid checkout fulfillment.", context, {
    supabase: getSupabaseConfigStatus(),
    session: summarizeCheckoutSession(session),
  });

  logWebhookInfo("Calling Supabase RPC fulfill_stripe_checkout.", context);

  const result = await recordPaidCheckoutSession(event, session);

  logFulfillmentResult(context, result);

  logWebhookInfo("Paid checkout fulfillment completed.", context, {
    processed: result.processed,
    alreadyProcessed: result.already_processed,
  });
}

async function handlePendingCheckoutSession(
  event: Stripe.Event,
  session: Stripe.Checkout.Session,
) {
  const context: WebhookLogContext = {
    eventId: event.id,
    eventType: event.type,
    sessionId: session.id,
  };

  logWebhookInfo("Starting pending checkout persistence.", context, {
    supabase: getSupabaseConfigStatus(),
    session: summarizeCheckoutSession(session),
  });

  logWebhookInfo("Calling Supabase RPC record_stripe_checkout_status (pending).", context);

  const result = await recordPendingCheckoutSession(event, session);

  logCheckoutStatusResult(context, result, "Pending");

  logWebhookInfo("Pending checkout persistence completed.", context, {
    processed: result.processed,
    alreadyProcessed: result.already_processed,
  });
}

async function handleFailedCheckoutSession(
  event: Stripe.Event,
  session: Stripe.Checkout.Session,
) {
  const context: WebhookLogContext = {
    eventId: event.id,
    eventType: event.type,
    sessionId: session.id,
  };

  logWebhookInfo("Starting failed checkout persistence.", context, {
    supabase: getSupabaseConfigStatus(),
    session: summarizeCheckoutSession(session),
  });

  logWebhookInfo("Calling Supabase RPC record_stripe_checkout_status (failed).", context);

  const result = await recordFailedCheckoutSession(event, session);

  logCheckoutStatusResult(context, result, "Failed");

  logWebhookInfo("Failed checkout persistence completed.", context, {
    processed: result.processed,
    alreadyProcessed: result.already_processed,
  });
}

async function handleExpiredCheckoutSession(
  event: Stripe.Event,
  session: Stripe.Checkout.Session,
) {
  const context: WebhookLogContext = {
    eventId: event.id,
    eventType: event.type,
    sessionId: session.id,
  };

  logWebhookInfo("Starting expired checkout persistence.", context, {
    supabase: getSupabaseConfigStatus(),
    session: summarizeCheckoutSession(session),
  });

  logWebhookInfo("Calling Supabase RPC record_stripe_checkout_status (expired).", context);

  const result = await recordExpiredCheckoutSession(event, session);

  logCheckoutStatusResult(context, result, "Expired");

  logWebhookInfo("Expired checkout persistence completed.", context, {
    processed: result.processed,
    alreadyProcessed: result.already_processed,
  });
}

export async function POST(request: Request) {
  logWebhookInfo("Webhook request received.");

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    logWebhookError(
      "Webhook rejected: STRIPE_WEBHOOK_SECRET is not configured.",
      new Error("Missing STRIPE_WEBHOOK_SECRET"),
    );

    return webhookErrorResponse(
      503,
      "Webhook is not configured.",
      "missing_webhook_secret",
    );
  }

  const supabaseStatus = getSupabaseConfigStatus();

  logWebhookInfo("Supabase connection configuration.", {}, { supabase: supabaseStatus });

  if (!supabaseStatus.configured) {
    logWebhookError(
      "Webhook rejected: Supabase is not configured for order persistence.",
      new Error("Supabase admin client is not configured"),
      {},
      { supabase: supabaseStatus },
    );

    return webhookErrorResponse(
      503,
      "Order persistence is not configured.",
      "supabase_not_configured",
    );
  }

  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    logWebhookError(
      "Webhook rejected: missing stripe-signature header.",
      new Error("Missing Stripe signature header"),
    );

    return webhookErrorResponse(
      400,
      "Missing Stripe signature.",
      "missing_stripe_signature",
    );
  }

  logWebhookInfo("Stripe signature header present.", {}, {
    signatureHeaderLength: signature.length,
  });

  const rawBody = await request.text();

  let event: Stripe.Event;

  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);

    logWebhookInfo("Signature verification succeeded.", {
      eventId: event.id,
      eventType: event.type,
    }, {
      livemode: event.livemode,
      created: event.created,
    });
  } catch (error) {
    logWebhookError("Signature verification failed.", error);

    return webhookErrorResponse(
      400,
      "Invalid Stripe signature.",
      "invalid_stripe_signature",
    );
  }

  logWebhookInfo("Processing Stripe event.", {
    eventId: event.id,
    eventType: event.type,
  });

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        logWebhookInfo("checkout.session.completed payload.", {
          eventId: event.id,
          eventType: event.type,
          sessionId: session.id,
        }, {
          payload: summarizeCheckoutSession(session),
        });

        const expandedSession = await retrieveCheckoutSession(session.id, {
          eventId: event.id,
          eventType: event.type,
          sessionId: session.id,
        });

        if (expandedSession.payment_status === "paid") {
          await handlePaidCheckoutSession(event, expandedSession);
        } else {
          await handlePendingCheckoutSession(event, expandedSession);
        }

        break;
      }
      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object as Stripe.Checkout.Session;

        logWebhookInfo("checkout.session.async_payment_succeeded payload.", {
          eventId: event.id,
          eventType: event.type,
          sessionId: session.id,
        }, {
          payload: summarizeCheckoutSession(session),
        });

        const expandedSession = await retrieveCheckoutSession(session.id, {
          eventId: event.id,
          eventType: event.type,
          sessionId: session.id,
        });
        await handlePaidCheckoutSession(event, expandedSession);
        break;
      }
      case "checkout.session.async_payment_failed": {
        const session = event.data.object as Stripe.Checkout.Session;

        logWebhookInfo("checkout.session.async_payment_failed payload.", {
          eventId: event.id,
          eventType: event.type,
          sessionId: session.id,
        }, {
          payload: summarizeCheckoutSession(session),
        });

        const expandedSession = await retrieveCheckoutSession(session.id, {
          eventId: event.id,
          eventType: event.type,
          sessionId: session.id,
        });
        await handleFailedCheckoutSession(event, expandedSession);
        break;
      }
      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;

        logWebhookInfo("checkout.session.expired payload.", {
          eventId: event.id,
          eventType: event.type,
          sessionId: session.id,
        }, {
          payload: summarizeCheckoutSession(session),
        });

        const expandedSession = await retrieveCheckoutSession(session.id, {
          eventId: event.id,
          eventType: event.type,
          sessionId: session.id,
        });
        await handleExpiredCheckoutSession(event, expandedSession);
        break;
      }
      default:
        logWebhookInfo("Ignoring unsupported event type.", {
          eventId: event.id,
          eventType: event.type,
        });
        break;
    }
  } catch (error) {
    const context: WebhookLogContext = {
      eventId: event.id,
      eventType: event.type,
    };

    if (error instanceof OrderValidationError) {
      logWebhookError(
        "Checkout validation failed; acknowledging event without retry.",
        error,
        context,
      );

      return NextResponse.json({ received: true, code: "validation_failed" });
    }

    if (error instanceof OrderPersistenceError) {
      logWebhookError("Order persistence failed.", error, context);

      return webhookErrorResponse(
        500,
        "Webhook order persistence failed.",
        "order_persistence_failed",
      );
    }

    logWebhookError("Unexpected webhook processing failure.", error, context);

    return webhookErrorResponse(
      500,
      "Webhook processing failed.",
      "webhook_processing_failed",
    );
  }

  logWebhookInfo("Webhook processed successfully.", {
    eventId: event.id,
    eventType: event.type,
  });

  return NextResponse.json({ received: true });
}
