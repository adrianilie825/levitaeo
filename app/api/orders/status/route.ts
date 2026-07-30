import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import {
  checkOrderStatusRateLimit,
  getOrderStatusRateLimitKey,
} from "@/lib/orders/rate-limit";
import { getSanitizedOrderStatus } from "@/lib/orders";
import {
  checkoutSessionBelongsToUser,
  getCheckoutSessionUserId,
} from "@/lib/purchases/ownership";
import { getStripe } from "@/lib/stripe";
import { isSupabaseConfigured } from "@/lib/supabase/admin";
import type { OrderStatus } from "@/types/database";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PublicOrderStatus =
  | "pending"
  | "paid"
  | "failed"
  | "expired"
  | "unknown";

function mapOrderStatus(status: OrderStatus | "unknown"): PublicOrderStatus {
  if (status === "refunded" || status === "partially_refunded") {
    return "unknown";
  }

  return status;
}

export async function GET(request: Request) {
  const rateLimitKey = getOrderStatusRateLimitKey(request);
  const rateLimit = checkOrderStatusRateLimit(rateLimitKey);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again shortly." },
      {
        status: 429,
        headers: {
          "Cache-Control": "no-store",
          ...(rateLimit.retryAfterMs
            ? { "Retry-After": String(Math.ceil(rateLimit.retryAfterMs / 1000)) }
            : {}),
        },
      },
    );
  }

  const sessionId = new URL(request.url).searchParams.get("session_id");

  if (!sessionId || sessionId.trim().length === 0) {
    return NextResponse.json(
      { error: "A valid session_id is required." },
      { status: 400 },
    );
  }

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId.trim());
    const authenticatedUser = await getAuthenticatedUser();
    const sessionUserId = getCheckoutSessionUserId(session);

    if (
      authenticatedUser &&
      sessionUserId &&
      !checkoutSessionBelongsToUser(sessionUserId, authenticatedUser.id)
    ) {
      return NextResponse.json(
        { error: "This checkout session does not belong to your account." },
        { status: 403 },
      );
    }

    if (session.payment_status !== "paid") {
      return NextResponse.json({
        status: "pending" satisfies PublicOrderStatus,
        persisted: false,
      });
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        status: "unknown" satisfies PublicOrderStatus,
        persisted: false,
      });
    }

    const orderStatus = await getSanitizedOrderStatus(sessionId.trim());

    return NextResponse.json({
      status: mapOrderStatus(orderStatus.status),
      persisted: orderStatus.persisted,
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[orders-status] Failed to resolve order status:", error);
    }

    return NextResponse.json(
      { error: "Order status could not be retrieved." },
      {
        status: 500,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }
}
