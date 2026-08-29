import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/auth";
import {
  getAdminProductById,
  updateAdminProductStripeIds,
} from "@/lib/admin/catalog";
import { revalidateCatalog } from "@/lib/admin/revalidate";
import {
  ensureStripePriceForProduct,
  getStripePriceSyncStatus,
  validateStripeProductPricing,
} from "@/lib/stripe/product-pricing";
import { isValidProductUuid } from "@/lib/storage/admin-artwork-storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ productId: string }>;
};

function adminJson(body: Record<string, unknown>, status: number) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

function unauthorizedResponse() {
  return adminJson({ error: "Unauthorized.", code: "unauthorized" }, 401);
}

function productPricingInput(product: NonNullable<Awaited<ReturnType<typeof getAdminProductById>>>) {
  return {
    productId: product.id,
    slug: product.slug,
    title: product.title,
    collectionSlug: product.collections?.slug ?? "originals",
    priceCents: product.price_cents,
    currency: product.currency,
    stripeProductId: product.stripe_product_id,
    stripePriceId: product.stripe_price_id,
  };
}

export async function GET(_request: Request, context: RouteContext) {
  const admin = await requireAdminApi();

  if (!admin) {
    return unauthorizedResponse();
  }

  const { productId } = await context.params;

  if (!isValidProductUuid(productId)) {
    return adminJson({ error: "Invalid product.", code: "invalid_product" }, 400);
  }

  const product = await getAdminProductById(productId);

  if (!product) {
    return adminJson({ error: "Product not found.", code: "not_found" }, 404);
  }

  const pricingValidation = validateStripeProductPricing({
    priceCents: product.price_cents,
    currency: product.currency,
  });

  const status = await getStripePriceSyncStatus(productPricingInput(product));

  return adminJson(
    {
      configured: status.configured,
      inSync: status.inSync,
      stripeProductId: status.stripeProductId,
      stripePriceId: status.stripePriceId,
      priceCents: product.price_cents,
      currency: product.currency,
      pricingValid: pricingValidation.ok,
      pricingError: pricingValidation.ok ? null : pricingValidation.message,
    },
    200,
  );
}

export async function POST(_request: Request, context: RouteContext) {
  const admin = await requireAdminApi();

  if (!admin) {
    return unauthorizedResponse();
  }

  const { productId } = await context.params;

  if (!isValidProductUuid(productId)) {
    return adminJson({ error: "Invalid product.", code: "invalid_product" }, 400);
  }

  const product = await getAdminProductById(productId);

  if (!product) {
    return adminJson({ error: "Product not found.", code: "not_found" }, 404);
  }

  const pricingValidation = validateStripeProductPricing({
    priceCents: product.price_cents,
    currency: product.currency,
  });

  if (!pricingValidation.ok) {
    return adminJson(
      {
        error: pricingValidation.message,
        code: pricingValidation.code,
      },
      400,
    );
  }

  const result = await ensureStripePriceForProduct(productPricingInput(product));

  if (!result.ok) {
    if (process.env.NODE_ENV === "development") {
      console.error("[admin-stripe] sync failed:", result.code);
    }

    return adminJson(
      {
        error: result.message,
        code: result.code,
      },
      result.code === "stripe_not_configured" ? 503 : 500,
    );
  }

  try {
    await updateAdminProductStripeIds(productId, {
      stripe_product_id: result.stripeProductId,
      stripe_price_id: result.stripePriceId,
    });
  } catch {
    return adminJson(
      {
        error: "Stripe resources were created but the product record could not be updated.",
        code: "metadata_update_failed",
      },
      500,
    );
  }

  revalidateCatalog({
    productSlug: product.slug,
    collectionSlug: product.collections?.slug ?? "originals",
  });

  return adminJson(
    {
      stripeProductId: result.stripeProductId,
      stripePriceId: result.stripePriceId,
      createdProduct: result.createdProduct,
      createdPrice: result.createdPrice,
      inSync: true,
    },
    200,
  );
}
