import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getAuthenticatedUser, normalizeEmail } from "@/lib/auth";
import { validateCheckoutProduct } from "@/lib/purchases/checkout-validation";
import { userOwnsActiveProduct } from "@/lib/purchases/ownership";
import { getProductPath } from "@/lib/products-db";
import { getStripe } from "@/lib/stripe";
import { siteConfig } from "@/lib/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CheckoutRequestBody = {
  productSlug?: unknown;
};

type CheckoutLogContext = {
  userId: string;
  productSlug: string;
  productLookup?: {
    found: boolean;
    id?: string | null;
    slug?: string;
    status?: string;
    downloadable?: boolean;
    stripePriceIdFromProduct?: string | null;
  };
  stripePriceId?: string | null;
  missingEnvVars?: string[];
};

const CHECKOUT_ENV_VARS = [
  "STRIPE_SECRET_KEY",
  "NEXT_PUBLIC_SITE_URL",
] as const;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function getMissingCheckoutEnvVars(): string[] {
  return CHECKOUT_ENV_VARS.filter((name) => {
    const value = process.env[name]?.trim();
    return !value;
  });
}

function logCheckoutInfo(
  message: string,
  context: CheckoutLogContext,
  extra?: Record<string, unknown>,
) {
  console.info(`[checkout] ${message}`, {
    userId: context.userId,
    productSlug: context.productSlug,
    productLookup: context.productLookup,
    stripePriceId: context.stripePriceId ?? null,
    missingEnvVars: context.missingEnvVars ?? getMissingCheckoutEnvVars(),
    siteUrlConfigured: Boolean(process.env.NEXT_PUBLIC_SITE_URL?.trim()),
    ...extra,
  });
}

function logCheckoutDiagnostic(
  message: string,
  context: CheckoutLogContext,
  extra?: Record<string, unknown>,
) {
  console.error(`[checkout] ${message}`, {
    userId: context.userId,
    productSlug: context.productSlug,
    productLookup: context.productLookup,
    stripePriceId: context.stripePriceId ?? null,
    missingEnvVars: context.missingEnvVars ?? getMissingCheckoutEnvVars(),
    siteUrlConfigured: Boolean(process.env.NEXT_PUBLIC_SITE_URL?.trim()),
    ...extra,
  });
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

function checkoutErrorResponse(
  status: number,
  error: string,
  code: string,
) {
  return NextResponse.json({ error, code }, { status });
}

export async function POST(request: Request) {
  const authenticatedUser = await getAuthenticatedUser();

  if (!authenticatedUser) {
    return NextResponse.json(
      { error: "Sign in is required before checkout." },
      { status: 401 },
    );
  }

  let body: CheckoutRequestBody;

  try {
    body = (await request.json()) as CheckoutRequestBody;
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 },
    );
  }

  if (!isNonEmptyString(body.productSlug)) {
    return NextResponse.json(
      { error: "A valid product slug is required." },
      { status: 400 },
    );
  }

  const productSlug = body.productSlug.trim();
  const baseLogContext: CheckoutLogContext = {
    userId: authenticatedUser.id,
    productSlug,
    missingEnvVars: getMissingCheckoutEnvVars(),
  };

  const validation = await validateCheckoutProduct(productSlug);

  const productLookup = validation.ok
    ? {
        found: true,
        id: validation.product.id,
        slug: validation.product.slug,
        status: validation.product.status,
        downloadable: validation.product.downloadable,
        stripePriceIdFromProduct: validation.product.stripePriceId ?? null,
      }
    : { found: false };

  logCheckoutInfo("Product lookup completed.", {
    ...baseLogContext,
    productLookup,
    stripePriceId: validation.ok ? validation.stripePriceId : null,
  });

  if (!validation.ok) {
    return NextResponse.json(
      { error: validation.error },
      { status: validation.status },
    );
  }

  const { product, stripePriceId } = validation;
  const productPath = getProductPath(product);
  const sessionLogContext: CheckoutLogContext = {
    ...baseLogContext,
    productLookup,
    stripePriceId,
  };

  if (
    await userOwnsActiveProduct({
      userId: authenticatedUser.id,
      productSlug: product.slug,
      productId: product.id,
    })
  ) {
    return NextResponse.json(
      { error: "You already own this edition. View it in My Library." },
      { status: 409 },
    );
  }

  try {
    const missingEnvVars = getMissingCheckoutEnvVars();

    if (missingEnvVars.length > 0) {
      logCheckoutDiagnostic(
        "Checkout environment variables are missing.",
        sessionLogContext,
        { missingEnvVars },
      );
    }

    const stripe = getStripe();
    const customerEmail = authenticatedUser.email
      ? normalizeEmail(authenticatedUser.email)
      : undefined;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      client_reference_id: authenticatedUser.id,
      line_items: [
        {
          price: stripePriceId,
          quantity: 1,
        },
      ],
      success_url: `${siteConfig.url}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteConfig.url}${productPath}?checkout=cancelled`,
      billing_address_collection: "auto",
      allow_promotion_codes: true,
      locale: "auto",
      ...(customerEmail ? { customer_email: customerEmail } : {}),
      metadata: {
        productId: product.id ?? "",
        productSlug: product.slug,
        productTitle: product.title,
        productEdition: product.edition,
        collection: product.collection,
        purchaseType: "digital-artwork",
        supabaseUserId: authenticatedUser.id,
      },
      payment_intent_data: {
        metadata: {
          productId: product.id ?? "",
          productSlug: product.slug,
          purchaseType: "digital-artwork",
          supabaseUserId: authenticatedUser.id,
        },
      },
    });

    if (!session.url) {
      logCheckoutDiagnostic(
        "Stripe returned a Checkout Session without a redirect URL.",
        sessionLogContext,
        { sessionId: session.id },
      );

      return checkoutErrorResponse(
        502,
        "Checkout could not be started because Stripe did not return a redirect URL.",
        "missing_checkout_url",
      );
    }

    console.info("[checkout] Created Checkout Session.", {
      userId: authenticatedUser.id,
      productSlug: product.slug,
      stripePriceId,
      sessionId: session.id,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const stripeError = getStripeErrorDetails(error);

    if (stripeError) {
      logCheckoutDiagnostic(
        "Stripe Checkout Session creation failed.",
        sessionLogContext,
        {
          stripeErrorType: stripeError.type,
          stripeErrorCode: stripeError.code ?? null,
          stripeErrorMessage: stripeError.message,
          stripeStatusCode: stripeError.statusCode ?? null,
        },
      );

      if (
        stripeError.type === "StripeAuthenticationError" ||
        stripeError.type === "StripePermissionError"
      ) {
        return checkoutErrorResponse(
          503,
          "Checkout is not configured correctly. Please try again later.",
          "stripe_authentication_error",
        );
      }

      if (stripeError.type === "StripeInvalidRequestError") {
        return checkoutErrorResponse(
          502,
          "Checkout could not be started because the Stripe price for this edition is invalid.",
          "stripe_invalid_request",
        );
      }

      if (stripeError.type === "StripeConnectionError") {
        return checkoutErrorResponse(
          503,
          "Checkout is temporarily unavailable. Please try again shortly.",
          "stripe_connection_error",
        );
      }

      if (stripeError.type === "StripeRateLimitError") {
        return checkoutErrorResponse(
          503,
          "Checkout is temporarily busy. Please try again shortly.",
          "stripe_rate_limit",
        );
      }

      return checkoutErrorResponse(
        502,
        "Checkout could not be started due to a Stripe error. Please try again.",
        "stripe_api_error",
      );
    }

    if (error instanceof Error && error.message.includes("STRIPE_SECRET_KEY")) {
      logCheckoutDiagnostic(
        "Checkout blocked: getStripe() reported missing STRIPE_SECRET_KEY.",
        sessionLogContext,
        { errorMessage: error.message },
      );

      return checkoutErrorResponse(
        503,
        "Checkout is not configured yet. Please try again later.",
        "missing_stripe_secret_key",
      );
    }

    logCheckoutDiagnostic(
      "Unexpected error while creating Checkout Session.",
      sessionLogContext,
      {
        errorMessage: error instanceof Error ? error.message : String(error),
      },
    );

    return checkoutErrorResponse(
      500,
      "Checkout could not be started. Please try again.",
      "checkout_session_failed",
    );
  }
}
