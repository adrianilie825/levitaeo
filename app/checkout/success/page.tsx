import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";
import NavbarWithAuth from "@/components/NavbarWithAuth";
import {
  formatEditionLabel,
  getProductBySlug,
} from "@/lib/products-db";
import {
  getOrderSummaryByCheckoutSessionId,
} from "@/lib/orders";
import { getStripe } from "@/lib/stripe";
import { getAuthenticatedUser } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/admin";

export const metadata: Metadata = {
  title: "Payment Confirmation",
  robots: {
    index: false,
    follow: false,
  },
};

type PageProps = {
  searchParams: Promise<{ session_id?: string }>;
};

function formatPaidAmount(amountTotal: number | null, currency: string | null) {
  if (amountTotal === null || !currency) {
    return null;
  }

  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amountTotal / 100);
}

export default async function CheckoutSuccessPage({ searchParams }: PageProps) {
  const { session_id: sessionId } = await searchParams;

  if (!sessionId) {
    return (
      <ConfirmationShell>
        <h1 className="text-3xl font-light tracking-[-0.02em] sm:text-4xl">
          We could not verify this checkout.
        </h1>
        <p className="mt-6 text-[15px] leading-7 text-neutral-600">
          Return to Collections and try again if you still wish to purchase an
          edition.
        </p>
        <ActionLink href="/collections">Back to Collections</ActionLink>
      </ConfirmationShell>
    );
  }

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items"],
    });

    if (session.payment_status !== "paid") {
      const productSlug = session.metadata?.productSlug;
      const productPath = productSlug
        ? `/collections/originals/${productSlug}`
        : "/collections/originals";

      return (
        <ConfirmationShell>
          <h1 className="text-3xl font-light tracking-[-0.02em] sm:text-4xl">
            Payment not confirmed
          </h1>
          <p className="mt-6 text-[15px] leading-7 text-neutral-600">
            The payment may still be processing or was not completed.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <ActionLink href={productPath}>Back to edition</ActionLink>
            <ActionLink href="/collections" subdued>
              Back to Collections
            </ActionLink>
          </div>
        </ConfirmationShell>
      );
    }

    let orderSummary: Awaited<
      ReturnType<typeof getOrderSummaryByCheckoutSessionId>
    > = null;
    let persistenceUnavailable = false;

    if (isSupabaseConfigured()) {
      try {
        orderSummary = await getOrderSummaryByCheckoutSessionId(sessionId);
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.error(
            "[checkout-success] Failed to load order summary:",
            error,
          );
        }
        persistenceUnavailable = true;
      }
    } else {
      persistenceUnavailable = true;
    }

    const productSlug =
      orderSummary?.productSlug ?? session.metadata?.productSlug ?? null;
    const product = productSlug ? await getProductBySlug(productSlug) : undefined;
    const isPersistedPaid =
      orderSummary?.persisted === true && orderSummary.status === "paid";

    const paidAmount = formatPaidAmount(
      orderSummary?.amountTotal ?? session.amount_total,
      orderSummary?.currency ?? session.currency ?? null,
    );

    const title = isPersistedPaid ? "Payment confirmed" : "Payment received";
    const supportingCopy = isPersistedPaid
      ? "Your Levitaeo edition has been secured."
      : "We are finalising your Levitaeo edition. This usually takes only a few moments.";

    const editionTitle = orderSummary?.productTitle ?? product?.title ?? null;
    const editionNumber =
      orderSummary?.productEdition ?? product?.edition ?? null;
    const authenticatedUser = await getAuthenticatedUser();

    return (
      <ConfirmationShell>
        <p className="text-[11px] uppercase tracking-[0.32em] text-neutral-500">
          Levitaeo Checkout
        </p>
        <h1 className="mt-5 text-3xl font-light tracking-[-0.02em] sm:text-4xl">
          {title}
        </h1>
        <p className="mt-6 text-[15px] leading-7 text-neutral-600">
          {supportingCopy}
        </p>

        {persistenceUnavailable && process.env.NODE_ENV === "development" ? (
          <p className="mt-4 max-w-xl text-[13px] leading-6 text-neutral-500">
            Order persistence is not configured locally. Stripe payment
            verification succeeded, but Supabase was unavailable for
            confirmation.
          </p>
        ) : null}

        <dl className="mt-8 space-y-4 border-t border-[#ECE8E2] pt-8 text-[13px] leading-6">
          {editionTitle ? (
            <div className="grid grid-cols-[8rem_1fr] gap-4">
              <dt className="text-neutral-500">Edition</dt>
              <dd>{editionTitle}</dd>
            </div>
          ) : null}
          {editionNumber ? (
            <div className="grid grid-cols-[8rem_1fr] gap-4">
              <dt className="text-neutral-500">Number</dt>
              <dd>{formatEditionLabel(editionNumber)}</dd>
            </div>
          ) : null}
          {paidAmount ? (
            <div className="grid grid-cols-[8rem_1fr] gap-4">
              <dt className="text-neutral-500">Amount paid</dt>
              <dd>{paidAmount}</dd>
            </div>
          ) : null}
          {session.customer_details?.email ? (
            <div className="grid grid-cols-[8rem_1fr] gap-4">
              <dt className="text-neutral-500">Email</dt>
              <dd>{session.customer_details.email}</dd>
            </div>
          ) : null}
        </dl>

        {productSlug ? (
          <div className="mt-8">
            <ActionLink href={`/collections/originals/${productSlug}`}>
              View your edition
            </ActionLink>
          </div>
        ) : null}

        <section className="mt-10 border-t border-[#ECE8E2] pt-8">
          {authenticatedUser ? (
            <>
              <ActionLink href="/library">View My Library</ActionLink>
              <div className="mt-4">
                <ActionLink href="/account" subdued>
                  View My Account
                </ActionLink>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-xl font-light tracking-[-0.02em]">
                Secure your collection
              </h2>
              <p className="mt-4 max-w-xl text-[15px] leading-7 text-neutral-600">
                Sign in with the same email used at checkout to connect this
                edition to your Levitaeo account and access your library.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <ActionLink href="/login?next=/library">
                  Access My Library
                </ActionLink>
                <ActionLink href="/login?next=/account" subdued>
                  Access My Account
                </ActionLink>
              </div>
            </>
          )}
        </section>

        <p className="mt-8 max-w-xl text-[13px] leading-6 text-neutral-500">
          Purchased editions appear in My Library with secure, short-lived
          download links after payment is confirmed.
        </p>
      </ConfirmationShell>
    );
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[checkout-success] Failed to retrieve session:", error);
    }

    return (
      <ConfirmationShell>
        <h1 className="text-3xl font-light tracking-[-0.02em] sm:text-4xl">
          We could not verify this checkout.
        </h1>
        <p className="mt-6 text-[15px] leading-7 text-neutral-600">
          Return to Collections and try again if you still wish to purchase an
          edition.
        </p>
        <ActionLink href="/collections">Back to Collections</ActionLink>
      </ConfirmationShell>
    );
  }
}

function ConfirmationShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="bg-[#FAFAF8] text-[#111111]">
      <NavbarWithAuth />
      <section className="mx-auto max-w-3xl px-6 py-16 md:py-20 lg:px-10">
        {children}
      </section>
      <Footer />
    </main>
  );
}

function ActionLink({
  href,
  children,
  subdued = false,
}: {
  href: string;
  children: React.ReactNode;
  subdued?: boolean;
}) {
  return (
    <Link
      href={href}
      className={
        subdued
          ? "inline-flex text-[12px] tracking-[0.1em] text-neutral-600 underline-offset-4 transition-colors hover:text-[#111111] hover:underline"
          : "inline-flex items-center justify-center border border-[#111111] bg-[#111111] px-8 py-3.5 text-[11px] uppercase tracking-[0.18em] text-white transition-colors duration-300 hover:bg-transparent hover:text-[#111111]"
      }
    >
      {children}
    </Link>
  );
}
