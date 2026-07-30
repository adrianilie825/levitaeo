import { NextResponse } from "next/server";
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

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
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
  const validation = await validateCheckoutProduct(productSlug);

  if (!validation.ok) {
    return NextResponse.json(
      { error: validation.error },
      { status: validation.status },
    );
  }

  const { product, stripePriceId } = validation;
  const productPath = getProductPath(product);

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
      return NextResponse.json(
        { error: "Checkout could not be started. Please try again." },
        { status: 500 },
      );
    }

    if (process.env.NODE_ENV === "development") {
      console.info(
        `[checkout] Created session for user=${authenticatedUser.id}, product=${product.slug}.`,
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
