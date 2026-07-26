import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import Footer from "@/components/Footer";
import NavbarWithAuth from "@/components/NavbarWithAuth";
import SignOutButton from "@/components/SignOutButton";
import {
  getAuthenticatedUser,
  linkPurchasesToAuthenticatedUser,
} from "@/lib/auth";
import { getCurrentUserEntitlements } from "@/lib/entitlements";

export const metadata: Metadata = {
  title: "My Account",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ signed_in?: string }>;
};

export default async function AccountPage({ searchParams }: PageProps) {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login?next=/account");
  }

  const { signed_in: signedIn } = await searchParams;

  let purchasesLinked = false;

  try {
    const linkResult = await linkPurchasesToAuthenticatedUser(user);
    purchasesLinked =
      linkResult.ordersLinked > 0 || linkResult.entitlementsLinked > 0;
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[account] Purchase linking failed:", error);
    }
  }

  let entitlementCount = 0;
  let entitlementsError = false;

  try {
    const entitlements = await getCurrentUserEntitlements();
    entitlementCount = entitlements.length;
  } catch (error) {
    entitlementsError = true;
    if (process.env.NODE_ENV === "development") {
      console.error("[account] Entitlement query failed:", error);
    }
  }

  return (
    <main className="bg-[#FAFAF8] text-[#111111]">
      <NavbarWithAuth />
      <section className="mx-auto max-w-3xl px-6 py-16 md:py-20 lg:px-10">
        <p className="text-[11px] uppercase tracking-[0.32em] text-neutral-500">
          Levitaeo Account
        </p>
        <h1 className="mt-5 text-3xl font-light tracking-[-0.02em] sm:text-4xl">
          My Account
        </h1>

        <p className="mt-6 text-[15px] leading-7 text-neutral-600">
          Signed in as{" "}
          <span className="text-[#111111]">{user.email ?? "your account"}</span>
        </p>

        {signedIn === "true" ? (
          <p className="mt-4 text-[13px] leading-6 text-neutral-500">
            You are now signed in to Levitaeo.
          </p>
        ) : null}

        {purchasesLinked ? (
          <p className="mt-4 text-[13px] leading-6 text-neutral-600">
            Your previous purchases have been connected to this account.
          </p>
        ) : null}

        <section className="mt-10 border-t border-[#ECE8E2] pt-10">
          <h2 className="text-xl font-light tracking-[-0.02em]">
            Your Levitaeo collection
          </h2>
          <p className="mt-4 max-w-xl text-[15px] leading-7 text-neutral-600">
            Access every edition you own in your personal library.
          </p>
          {entitlementsError ? (
            <p className="mt-4 text-[13px] leading-6 text-neutral-600" role="alert">
              We could not load your edition count right now. Your library may
              still be available.
            </p>
          ) : entitlementCount > 0 ? (
            <p className="mt-4 text-[13px] leading-6 text-neutral-500">
              {entitlementCount} active{" "}
              {entitlementCount === 1 ? "edition" : "editions"} connected to
              this account.
            </p>
          ) : null}
        </section>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
          <Link
            href="/library"
            className="inline-flex items-center justify-center border border-[#111111] bg-[#111111] px-8 py-3.5 text-[11px] uppercase tracking-[0.18em] text-white transition-colors duration-300 hover:bg-transparent hover:text-[#111111]"
          >
            My Library
          </Link>
          <Link
            href="/collections"
            className="inline-flex items-center justify-center border border-[#ECE8E2] px-8 py-3.5 text-[11px] uppercase tracking-[0.18em] text-[#111111] transition-colors hover:border-[#111111]"
          >
            View Collections
          </Link>
          <SignOutButton />
        </div>
      </section>
      <Footer />
    </main>
  );
}
