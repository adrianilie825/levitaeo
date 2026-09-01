"use client";

import Link from "next/link";
import { useState } from "react";

type BuyButtonProps = {
  productSlug: string;
  loginReturnPath: string;
  disabled?: boolean;
  label?: string;
  className?: string;
};

const defaultClassName =
  "inline-flex items-center justify-center border border-[#111111] bg-[#111111] px-8 py-3.5 text-[11px] uppercase tracking-[0.18em] text-white transition-colors duration-300 hover:bg-transparent hover:text-[#111111] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111111] disabled:cursor-not-allowed disabled:border-neutral-300 disabled:bg-neutral-200 disabled:text-neutral-500 disabled:hover:bg-neutral-200 disabled:hover:text-neutral-500 motion-reduce:transition-none";

export default function BuyButton({
  productSlug,
  loginReturnPath,
  disabled = false,
  label = "Acquire Edition",
  className,
}: BuyButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    if (disabled || loading) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productSlug }),
      });

      const data = (await response.json()) as {
        url?: string;
        error?: string;
        loginUrl?: string;
      };

      if (response.status === 401) {
        const nextPath = encodeURIComponent(loginReturnPath);
        window.location.assign(`/login?next=${nextPath}`);
        return;
      }

      if (!response.ok || !data.url) {
        setError(
          data.error ?? "Checkout could not be started. Please try again.",
        );
        return;
      }

      window.location.assign(data.url);
    } catch {
      setError("Checkout could not be started. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || loading}
        aria-busy={loading}
        className={className ? `${defaultClassName} ${className}` : defaultClassName}
      >
        {loading ? "Redirecting…" : label}
      </button>
      {error ? (
        <p className="text-[12px] leading-5 text-neutral-600" role="status">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function SignInToPurchaseLink({
  loginReturnPath,
  className = "",
}: {
  loginReturnPath: string;
  className?: string;
}) {
  const href = `/login?next=${encodeURIComponent(loginReturnPath)}`;

  return (
    <Link
      href={href}
      className={
        className ||
        "inline-flex w-full items-center justify-center border border-[#111111] bg-[#111111] px-8 py-3.5 text-[11px] uppercase tracking-[0.18em] text-white transition-colors duration-300 hover:bg-transparent hover:text-[#111111] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111111]"
      }
    >
      Sign in to collect
    </Link>
  );
}

export function ViewInLibraryLink({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/library"
      className={
        className ||
        "inline-flex w-full items-center justify-center border border-[#111111] bg-[#111111] px-8 py-3.5 text-[11px] uppercase tracking-[0.18em] text-white transition-colors duration-300 hover:bg-transparent hover:text-[#111111] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111111]"
      }
    >
      View in Library
    </Link>
  );
}
