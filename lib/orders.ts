import "server-only";
import type Stripe from "stripe";
import { getProductBySlug } from "@/lib/products-db";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";
import type {
  CheckoutStatusResult,
  FulfillmentResult,
  OrderRow,
  OrderStatus,
  OrderSummary,
} from "@/types/database";

export class OrderPersistenceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OrderPersistenceError";
  }
}

export class OrderValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OrderValidationError";
  }
}

type NormalizedCheckoutSession = {
  stripeCheckoutSessionId: string;
  stripePaymentIntentId: string | null;
  stripeCustomerId: string | null;
  customerEmail: string | null;
  currency: string;
  amountSubtotal: number;
  amountTotal: number;
  amountDiscount: number;
  amountTax: number;
  paymentStatus: string | null;
  paidAt: string | null;
  purchaseType: string;
  livemode: boolean;
  productSlug: string;
  productTitle: string;
  productEdition: string | null;
  collectionName: string | null;
  stripePriceId: string | null;
  quantity: number;
  unitAmount: number;
};

function extractStripeId(
  value:
    | string
    | Stripe.PaymentIntent
    | Stripe.Customer
    | Stripe.DeletedCustomer
    | null
    | undefined,
): string | null {
  if (!value) {
    return null;
  }

  if (typeof value === "string") {
    return value;
  }

  return "id" in value ? (value.id ?? null) : null;
}

function normalizeEmail(email: string | null | undefined): string | null {
  if (!email) {
    return null;
  }

  const normalized = email.trim().toLowerCase();
  return normalized.length > 0 ? normalized : null;
}

function normalizeCurrency(currency: string | null | undefined): string {
  return (currency ?? "eur").trim().toLowerCase();
}

function sanitizeEventPayload(event: Stripe.Event): Record<string, unknown> {
  const session = event.data.object as Stripe.Checkout.Session;

  return {
    id: event.id,
    type: event.type,
    livemode: event.livemode,
    created: event.created,
    checkoutSessionId: session.id,
    paymentStatus: session.payment_status ?? null,
    productSlug: session.metadata?.productSlug ?? null,
    purchaseType: session.metadata?.purchaseType ?? null,
  };
}

function getLineItemDetails(session: Stripe.Checkout.Session) {
  const lineItem = session.line_items?.data[0];
  const price = lineItem?.price;

  const stripePriceId =
    typeof price === "string" ? price : (price?.id ?? null);

  const unitAmount =
    typeof price === "object" && price?.unit_amount != null
      ? price.unit_amount
      : lineItem?.amount_subtotal ?? 0;

  return {
    stripePriceId,
    quantity: lineItem?.quantity ?? 1,
    unitAmount,
  };
}

export async function normalizeCheckoutSession(
  session: Stripe.Checkout.Session,
): Promise<NormalizedCheckoutSession> {
  const productSlug = session.metadata?.productSlug?.trim();

  if (!productSlug) {
    throw new OrderValidationError("Checkout session metadata is missing productSlug.");
  }

  const product = await getProductBySlug(productSlug);

  if (!product) {
    throw new OrderValidationError(`Unknown product slug: ${productSlug}`);
  }

  if (product.status !== "available" || !product.downloadable) {
    throw new OrderValidationError(
      `Product is not eligible for purchase: ${productSlug}`,
    );
  }

  const lineItemDetails = getLineItemDetails(session);
  const purchaseType =
    session.metadata?.purchaseType?.trim() || "digital-artwork";

  return {
    stripeCheckoutSessionId: session.id,
    stripePaymentIntentId: extractStripeId(session.payment_intent),
    stripeCustomerId: extractStripeId(session.customer),
    customerEmail: normalizeEmail(
      session.customer_details?.email ?? session.customer_email,
    ),
    currency: normalizeCurrency(session.currency),
    amountSubtotal: session.amount_subtotal ?? 0,
    amountTotal: session.amount_total ?? 0,
    amountDiscount: session.total_details?.amount_discount ?? 0,
    amountTax: session.total_details?.amount_tax ?? 0,
    paymentStatus: session.payment_status ?? null,
    paidAt:
      session.payment_status === "paid"
        ? new Date((session.created ?? 0) * 1000).toISOString()
        : null,
    purchaseType,
    livemode: session.livemode,
    productSlug: product.slug,
    productTitle: product.title,
    productEdition: product.edition,
    collectionName: product.collection,
    stripePriceId: lineItemDetails.stripePriceId,
    quantity: lineItemDetails.quantity,
    unitAmount: lineItemDetails.unitAmount,
  };
}

function buildFulfillmentArgs(
  event: Stripe.Event,
  session: NormalizedCheckoutSession,
) {
  return {
    p_stripe_event_id: event.id,
    p_event_type: event.type,
    p_livemode: event.livemode,
    p_stripe_created_at: new Date(event.created * 1000).toISOString(),
    p_sanitized_event_payload: sanitizeEventPayload(event),
    p_stripe_checkout_session_id: session.stripeCheckoutSessionId,
    p_stripe_payment_intent_id: session.stripePaymentIntentId,
    p_stripe_customer_id: session.stripeCustomerId,
    p_customer_email: session.customerEmail,
    p_currency: session.currency,
    p_amount_subtotal: session.amountSubtotal,
    p_amount_total: session.amountTotal,
    p_amount_discount: session.amountDiscount,
    p_amount_tax: session.amountTax,
    p_payment_status: session.paymentStatus,
    p_paid_at: session.paidAt,
    p_purchase_type: session.purchaseType,
    p_product_slug: session.productSlug,
    p_product_title: session.productTitle,
    p_product_edition: session.productEdition,
    p_collection_name: session.collectionName,
    p_stripe_price_id: session.stripePriceId,
    p_quantity: session.quantity,
    p_unit_amount: session.unitAmount,
  };
}

function buildStatusArgs(
  event: Stripe.Event,
  session: NormalizedCheckoutSession,
  orderStatus: Extract<OrderStatus, "pending" | "failed" | "expired">,
) {
  const {
    p_paid_at: _paidAt,
    ...fulfillmentArgs
  } = buildFulfillmentArgs(event, session);

  return {
    ...fulfillmentArgs,
    p_order_status: orderStatus,
  };
}

function unwrapRpcResult<T>(rows: T[] | null, errorMessage: string): T {
  if (!rows || rows.length === 0) {
    throw new OrderPersistenceError(errorMessage);
  }

  return rows[0];
}

export async function recordPaidCheckoutSession(
  event: Stripe.Event,
  session: Stripe.Checkout.Session,
): Promise<FulfillmentResult> {
  const normalized = await normalizeCheckoutSession(session);
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase.rpc("fulfill_stripe_checkout", {
    ...buildFulfillmentArgs(event, normalized),
    p_paid_at: normalized.paidAt,
  });

  if (error) {
    throw new OrderPersistenceError(error.message);
  }

  return unwrapRpcResult(
    data,
    "Fulfillment did not return a result.",
  );
}

export async function recordPendingCheckoutSession(
  event: Stripe.Event,
  session: Stripe.Checkout.Session,
): Promise<CheckoutStatusResult> {
  const normalized = await normalizeCheckoutSession(session);
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase.rpc("record_stripe_checkout_status", {
    ...buildStatusArgs(event, normalized, "pending"),
  });

  if (error) {
    throw new OrderPersistenceError(error.message);
  }

  return unwrapRpcResult(
    data,
    "Pending checkout persistence did not return a result.",
  );
}

export async function recordFailedCheckoutSession(
  event: Stripe.Event,
  session: Stripe.Checkout.Session,
): Promise<CheckoutStatusResult> {
  const normalized = await normalizeCheckoutSession(session);
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase.rpc("record_stripe_checkout_status", {
    ...buildStatusArgs(event, normalized, "failed"),
  });

  if (error) {
    throw new OrderPersistenceError(error.message);
  }

  return unwrapRpcResult(
    data,
    "Failed checkout persistence did not return a result.",
  );
}

export async function recordExpiredCheckoutSession(
  event: Stripe.Event,
  session: Stripe.Checkout.Session,
): Promise<CheckoutStatusResult> {
  const normalized = await normalizeCheckoutSession(session);
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase.rpc("record_stripe_checkout_status", {
    ...buildStatusArgs(event, normalized, "expired"),
  });

  if (error) {
    throw new OrderPersistenceError(error.message);
  }

  return unwrapRpcResult(
    data,
    "Expired checkout persistence did not return a result.",
  );
}

export async function getOrderByCheckoutSessionId(
  checkoutSessionId: string,
): Promise<OrderRow | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("stripe_checkout_session_id", checkoutSessionId)
    .maybeSingle();

  if (error) {
    throw new OrderPersistenceError(error.message);
  }

  return data;
}

export async function getOrderSummaryByCheckoutSessionId(
  checkoutSessionId: string,
): Promise<OrderSummary | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = getSupabaseAdmin();
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id, status, currency, amount_total")
    .eq("stripe_checkout_session_id", checkoutSessionId)
    .maybeSingle();

  if (orderError) {
    throw new OrderPersistenceError(orderError.message);
  }

  if (!order) {
    return null;
  }

  const { data: orderItem, error: itemError } = await supabase
    .from("order_items")
    .select("product_slug, product_title, product_edition")
    .eq("order_id", order.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (itemError) {
    throw new OrderPersistenceError(itemError.message);
  }

  return {
    status: order.status,
    persisted: true,
    productSlug: orderItem?.product_slug ?? null,
    productTitle: orderItem?.product_title ?? null,
    productEdition: orderItem?.product_edition ?? null,
    currency: order.currency,
    amountTotal: order.amount_total,
  };
}

export async function getSanitizedOrderStatus(
  checkoutSessionId: string,
): Promise<{ status: OrderStatus | "unknown"; persisted: boolean }> {
  const summary = await getOrderSummaryByCheckoutSessionId(checkoutSessionId);

  if (!summary) {
    return {
      status: "unknown",
      persisted: false,
    };
  }

  return {
    status: summary.status,
    persisted: true,
  };
}
