"use client";

import { useState } from "react";

type BuyButtonProps = {
  productSlug: string;
  disabled?: boolean;
  label?: string;
  className?: string;
};

const defaultClassName =
  "inline-flex items-center justify-center border border-[#111111] bg-[#111111] px-8 py-3.5 text-[11px] uppercase tracking-[0.18em] text-white transition-colors duration-300 hover:bg-transparent hover:text-[#111111] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111111] disabled:cursor-not-allowed disabled:border-neutral-300 disabled:bg-neutral-200 disabled:text-neutral-500 disabled:hover:bg-neutral-200 disabled:hover:text-neutral-500 motion-reduce:transition-none";

export default function BuyButton({
  productSlug,
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

      const data = (await response.json()) as { url?: string; error?: string };

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
