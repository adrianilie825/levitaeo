"use client";

import { useSearchParams } from "next/navigation";

export default function CheckoutNotice() {
  const searchParams = useSearchParams();
  const checkoutStatus = searchParams.get("checkout");

  if (checkoutStatus !== "cancelled") {
    return null;
  }

  return (
    <p
      className="mb-6 border border-[#ECE8E2] bg-[#F7F5F1] px-4 py-3 text-[13px] leading-6 text-neutral-600"
      role="status"
    >
      Checkout was cancelled. No payment was taken.
    </p>
  );
}
