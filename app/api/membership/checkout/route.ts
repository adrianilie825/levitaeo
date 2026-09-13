import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getAuthenticatedUser } from "@/lib/auth";
import { MEMBERSHIP_PURCHASE_TYPE, getMembershipFoundingPriceId } from "@/lib/membership/constants";
import {
  getMembershipSubscriptionForUser,
  shouldBlockNewMembershipCheckout,
} from "@/lib/membership/subscriptions";
import { resolveOrCreateStripeCustomer } from "@/lib/membership/user-billing";
import { buildCheckoutSessionParams } from "@/lib/stripe/checkout-prep";
import { getStripe } from "@/lib/stripe";
import { isSupabaseConfigured } from "@/lib/supabase/admin";
import { siteConfig } from "@/lib/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function checkoutErrorResponse(status: number, error: string, code: string) {
  return NextResponse.json({ error, code }, { status });
}

function getStripeErrorDetails(error: unknown): {
  type?: string;
  code?: string;
  message?: string;
  statusCode?: number;
} | null {
  if (typeof error !== "object" || error === null) {
    return null;
  }

  const candidate = error as Stripe.StripeRawError & {
    type?: string;
    statusCode?: number;
  };

  if (typeof candidate.type !== "string" || typeof candidate.message !== "string") {
    return null;
  }

  return {
    type: candidate.type,
    code: typeof candidate.code === "string" ? candidate.code : undefined,
    message: candidate.message,
    statusCode:
      typeof candidate.statusCode === "number" ? candidate.statusCode : undefined,
  };
}

export async function POST() {
  const authenticatedUser = await getAuthenticatedUser();

  if (!authenticatedUser) {
    return NextResponse.json(
      { error: "Sign in is required before membership checkout." },
      { status: 401 },
    );
  }

  if (!isSupabaseConfigured()) {
    return checkoutErrorResponse(
      503,
      "Membership checkout is not configured yet.",
      "supabase_not_configured",
    );
  }

  const membershipPriceId = getMembershipFoundingPriceId();

  if (!membershipPriceId) {
    return checkoutErrorResponse(
      503,
      "Membership checkout is not configured yet.",
      "missing_membership_price_id",
    );
  }

  try {
    const existingSubscription = await getMembershipSubscriptionForUser(
      authenticatedUser.id,
    );

    if (shouldBlockNewMembershipCheckout(existingSubscription)) {
      return checkoutErrorResponse(
        409,
        "You already have an active Levitaeo Membership.",
        "membership_already_active",
      );
    }

    const stripeCustomerId = await resolveOrCreateStripeCustomer(authenticatedUser);
    const stripe = getStripe();

    const session = await stripe.checkout.sessions.create(
      buildCheckoutSessionParams({
        mode: "subscription",
        customer: stripeCustomerId,
        client_reference_id: authenticatedUser.id,
        line_items: [
          {
            price: membershipPriceId,
            quantity: 1,
          },
        ],
        success_url: `${siteConfig.url}/account?membership=success`,
        cancel_url: `${siteConfig.url}/account?membership=cancelled`,
        billing_address_collection: "auto",
        allow_promotion_codes: true,
        locale: "auto",
        metadata: {
          purchaseType: MEMBERSHIP_PURCHASE_TYPE,
          supabaseUserId: authenticatedUser.id,
        },
        subscription_data: {
          metadata: {
            purchaseType: MEMBERSHIP_PURCHASE_TYPE,
            supabaseUserId: authenticatedUser.id,
          },
        },
      }),
    );

    if (!session.url) {
      return checkoutErrorResponse(
        502,
        "Membership checkout could not be started because Stripe did not return a redirect URL.",
        "missing_checkout_url",
      );
    }

    console.info("[membership-checkout] Created subscription Checkout Session.", {
      userId: authenticatedUser.id,
      stripeCustomerId,
      membershipPriceId,
      sessionId: session.id,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const stripeError = getStripeErrorDetails(error);

    if (stripeError) {
      console.error("[membership-checkout] Stripe error.", {
        userId: authenticatedUser.id,
        stripeErrorType: stripeError.type,
        stripeErrorCode: stripeError.code ?? null,
        stripeErrorMessage: stripeError.message,
      });

      if (
        stripeError.type === "StripeAuthenticationError" ||
        stripeError.type === "StripePermissionError"
      ) {
        return checkoutErrorResponse(
          503,
          "Membership checkout is not configured correctly. Please try again later.",
          "stripe_authentication_error",
        );
      }

      if (stripeError.type === "StripeInvalidRequestError") {
        return checkoutErrorResponse(
          502,
          "Membership checkout could not be started because the Stripe price is invalid.",
          "stripe_invalid_request",
        );
      }

      return checkoutErrorResponse(
        502,
        "Membership checkout could not be started due to a Stripe error. Please try again.",
        "stripe_api_error",
      );
    }

    console.error("[membership-checkout] Unexpected error.", {
      userId: authenticatedUser.id,
      errorMessage: error instanceof Error ? error.message : String(error),
    });

    return checkoutErrorResponse(
      500,
      "Membership checkout could not be started. Please try again.",
      "membership_checkout_failed",
    );
  }
}
