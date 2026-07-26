import { NextResponse } from "next/server";
import { getAuthenticatedUser, normalizeEmail } from "@/lib/auth";
import { getProductBySlug } from "@/lib/products-db";
import { getStripePriceId } from "@/lib/stripe-products";
import { getStripe } from "@/lib/stripe";
import { siteConfig } from "@/lib/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CheckoutRequestBody = {
  productSlug?: unknown;
};

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export async function POST(request: Request) {
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
  const product = await getProductBySlug(productSlug);

  if (!product) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  if (product.status !== "available") {
    return NextResponse.json(
      { error: "This edition is not available for purchase." },
      { status: 400 },
    );
  }

  if (!product.downloadable) {
    return NextResponse.json(
      { error: "This edition is not available for purchase." },
      { status: 400 },
    );
  }

  const stripePriceId =
    product.stripePriceId?.trim() || getStripePriceId(product.slug);

  if (!stripePriceId) {
    return NextResponse.json(
      {
        error:
          "Checkout is not configured for this edition yet. Please try again later.",
      },
      { status: 503 },
    );
  }

  try {
    const stripe = getStripe();
    const authenticatedUser = await getAuthenticatedUser();

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price: stripePriceId,
          quantity: 1,
        },
      ],
      success_url: `${siteConfig.url}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteConfig.url}/collections/originals/${product.slug}?checkout=cancelled`,
      customer_creation: "always",
      billing_address_collection: "auto",
      allow_promotion_codes: true,
      locale: "auto",
      ...(authenticatedUser?.email
        ? { customer_email: normalizeEmail(authenticatedUser.email) }
        : {}),
      metadata: {
        productSlug: product.slug,
        productTitle: product.title,
        productEdition: product.edition,
        collection: product.collection,
        purchaseType: "digital-artwork",
      },
      payment_intent_data: {
        metadata: {
          productSlug: product.slug,
          purchaseType: "digital-artwork",
        },
      },
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Checkout could not be started. Please try again." },
        { status: 500 },
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[checkout] Failed to create Checkout Session:", error);
    }

    const message =
      error instanceof Error &&
      error.message.includes("STRIPE_SECRET_KEY")
        ? "Checkout is not configured yet. Please try again later."
        : "Checkout could not be started. Please try again.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
