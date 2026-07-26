import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";
import MagicLinkForm from "@/components/MagicLinkForm";
import NavbarWithAuth from "@/components/NavbarWithAuth";
import { getSafeNextPath } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Sign In",
  robots: {
    index: false,
    follow: false,
  },
};

type PageProps = {
  searchParams: Promise<{ next?: string; error?: string }>;
};

export default async function LoginPage({ searchParams }: PageProps) {
  const { next, error } = await searchParams;
  const nextPath = getSafeNextPath(next);

  return (
    <main className="bg-[#FAFAF8] text-[#111111]">
      <NavbarWithAuth />
      <section className="mx-auto max-w-3xl px-6 py-16 md:py-20 lg:px-10">
        <p className="text-[11px] uppercase tracking-[0.32em] text-neutral-500">
          Levitaeo Account
        </p>
        <h1 className="mt-5 text-3xl font-light tracking-[-0.02em] sm:text-4xl">
          Access your collection
        </h1>
        <p className="mt-6 max-w-xl text-[15px] leading-7 text-neutral-600">
          Enter your email and we&apos;ll send you a secure sign-in link.
        </p>

        {error === "auth_callback" ? (
          <p className="mt-4 max-w-xl text-[13px] leading-6 text-neutral-600" role="alert">
            We could not complete sign-in. Please request a new magic link.
          </p>
        ) : null}

        <MagicLinkForm nextPath={nextPath} />

        <p className="mt-6 text-[13px] leading-6 text-neutral-500">
          No password required.
        </p>

        <div className="mt-10">
          <Link
            href="/collections"
            className="text-[12px] tracking-[0.1em] text-neutral-600 underline-offset-4 transition-colors hover:text-[#111111] hover:underline"
          >
            Back to Collections
          </Link>
        </div>
      </section>
      <Footer />
    </main>
  );
}
