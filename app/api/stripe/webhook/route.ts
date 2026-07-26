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

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function logDevelopment(message: string) {
  if (process.env.NODE_ENV === "development") {
    console.log(`[stripe-webhook] ${message}`);
  }
}

function logDevelopmentError(message: string, error: unknown) {
  if (process.env.NODE_ENV === "development") {
    console.error(`[stripe-webhook] ${message}`, error);
  }
}

async function retrieveCheckoutSession(
  sessionId: string,
): Promise<Stripe.Checkout.Session> {
  const stripe = getStripe();

  return stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["line_items", "payment_intent"],
  });
}

async function handlePaidCheckoutSession(
  event: Stripe.Event,
  session: Stripe.Checkout.Session,
) {
  const result = await recordPaidCheckoutSession(event, session);

  logDevelopment(
    `Paid checkout persisted for event=${event.id}, session=${session.id}, processed=${result.processed}, alreadyProcessed=${result.already_processed}.`,
  );
}

async function handlePendingCheckoutSession(
  event: Stripe.Event,
  session: Stripe.Checkout.Session,
) {
  const result = await recordPendingCheckoutSession(event, session);

  logDevelopment(
    `Pending checkout recorded for event=${event.id}, session=${session.id}, processed=${result.processed}, alreadyProcessed=${result.already_processed}.`,
  );
}

async function handleFailedCheckoutSession(
  event: Stripe.Event,
  session: Stripe.Checkout.Session,
) {
  const result = await recordFailedCheckoutSession(event, session);

  logDevelopment(
    `Failed checkout recorded for event=${event.id}, session=${session.id}, processed=${result.processed}, alreadyProcessed=${result.already_processed}.`,
  );
}

async function handleExpiredCheckoutSession(
  event: Stripe.Event,
  session: Stripe.Checkout.Session,
) {
  const result = await recordExpiredCheckoutSession(event, session);

  logDevelopment(
    `Expired checkout recorded for event=${event.id}, session=${session.id}, processed=${result.processed}, alreadyProcessed=${result.already_processed}.`,
  );
}

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    if (process.env.NODE_ENV === "development") {
      console.error("[stripe-webhook] Missing STRIPE_WEBHOOK_SECRET.");
    }

    return NextResponse.json(
      { error: "Webhook is not configured." },
      { status: 500 },
    );
  }

  if (!isSupabaseConfigured()) {
    if (process.env.NODE_ENV === "development") {
      console.error(
        "[stripe-webhook] Supabase is not configured for order persistence.",
      );
    }

    return NextResponse.json(
      { error: "Order persistence is not configured." },
      { status: 500 },
    );
  }

  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing Stripe signature." },
      { status: 400 },
    );
  }

  const rawBody = await request.text();

  let event: Stripe.Event;

  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error) {
    logDevelopmentError("Signature verification failed:", error);

    return NextResponse.json(
      { error: "Invalid Stripe signature." },
      { status: 400 },
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const expandedSession = await retrieveCheckoutSession(session.id);

        if (expandedSession.payment_status === "paid") {
          await handlePaidCheckoutSession(event, expandedSession);
        } else {
          await handlePendingCheckoutSession(event, expandedSession);
        }

        break;
      }
      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object as Stripe.Checkout.Session;
        const expandedSession = await retrieveCheckoutSession(session.id);
        await handlePaidCheckoutSession(event, expandedSession);
        break;
      }
      case "checkout.session.async_payment_failed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const expandedSession = await retrieveCheckoutSession(session.id);
        await handleFailedCheckoutSession(event, expandedSession);
        break;
      }
      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        const expandedSession = await retrieveCheckoutSession(session.id);
        await handleExpiredCheckoutSession(event, expandedSession);
        break;
      }
      default:
        break;
    }
  } catch (error) {
    if (error instanceof OrderValidationError) {
      logDevelopmentError(
        `Validation failed for event=${event.id}, type=${event.type}:`,
        error,
      );

      return NextResponse.json({ received: true });
    }

    logDevelopmentError(
      `Persistence failed for event=${event.id}, type=${event.type}:`,
      error,
    );

    return NextResponse.json(
      { error: "Webhook processing failed." },
      { status: 500 },
    );
  }

  return NextResponse.json({ received: true });
}
