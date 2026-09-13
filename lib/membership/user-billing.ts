import "server-only";

import type { User } from "@supabase/supabase-js";
import type Stripe from "stripe";
import {
  MembershipPersistenceError,
  MembershipValidationError,
} from "@/lib/membership/errors";
import { extractStripeId } from "@/lib/membership/stripe-ids";
import { getStripe } from "@/lib/stripe";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";
import type { UserBillingRow } from "@/types/database";

export async function getUserBillingByUserId(
  userId: string,
): Promise<UserBillingRow | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("user_billing")
    .select("user_id, stripe_customer_id, created_at, updated_at")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new MembershipPersistenceError(
      `Failed to load user billing: ${error.message}`,
    );
  }

  return (data as UserBillingRow | null) ?? null;
}

export async function getUserIdByStripeCustomerId(
  stripeCustomerId: string,
): Promise<string | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const normalizedCustomerId = stripeCustomerId.trim();

  if (!normalizedCustomerId) {
    return null;
  }

  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("user_billing")
    .select("user_id")
    .eq("stripe_customer_id", normalizedCustomerId)
    .maybeSingle();

  if (error) {
    throw new MembershipPersistenceError(
      `Failed to resolve user by Stripe customer: ${error.message}`,
    );
  }

  return data?.user_id ?? null;
}

export async function persistUserBillingMapping(input: {
  userId: string;
  stripeCustomerId: string;
}): Promise<UserBillingRow> {
  if (!isSupabaseConfigured()) {
    throw new MembershipPersistenceError("Supabase is not configured.");
  }

  const userId = input.userId.trim();
  const stripeCustomerId = input.stripeCustomerId.trim();

  if (!userId || !stripeCustomerId) {
    throw new MembershipValidationError(
      "User ID and Stripe customer ID are required.",
    );
  }

  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("user_billing")
    .upsert(
      {
        user_id: userId,
        stripe_customer_id: stripeCustomerId,
      },
      { onConflict: "user_id" },
    )
    .select("user_id, stripe_customer_id, created_at, updated_at")
    .single();

  if (error || !data) {
    throw new MembershipPersistenceError(
      `Failed to persist user billing mapping: ${error?.message ?? "unknown error"}`,
    );
  }

  return data as UserBillingRow;
}

export async function resolveOrCreateStripeCustomer(user: User): Promise<string> {
  if (!user.id) {
    throw new MembershipValidationError("Authenticated user ID is required.");
  }

  const existing = await getUserBillingByUserId(user.id);

  if (existing?.stripe_customer_id) {
    return existing.stripe_customer_id;
  }

  const stripe = getStripe();
  const customer = await stripe.customers.create({
    ...(user.email ? { email: user.email } : {}),
    metadata: {
      supabaseUserId: user.id,
    },
  });

  await persistUserBillingMapping({
    userId: user.id,
    stripeCustomerId: customer.id,
  });

  return customer.id;
}

export async function ensureUserBillingFromStripeCustomer(input: {
  userId: string;
  stripeCustomer: string | Stripe.Customer | Stripe.DeletedCustomer | null;
}): Promise<void> {
  const stripeCustomerId = extractStripeId(input.stripeCustomer);

  if (!stripeCustomerId) {
    throw new MembershipValidationError("Stripe customer ID is missing.");
  }

  await persistUserBillingMapping({
    userId: input.userId,
    stripeCustomerId,
  });
}
