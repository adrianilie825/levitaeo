"use client";

import { useEffect, useState } from "react";

type CheckoutSuccessStatusProps = {
  sessionId: string;
  initialPersisted: boolean;
};

type OrderStatusResponse = {
  status?: string;
  persisted?: boolean;
  error?: string;
};

export default function CheckoutSuccessStatus({
  sessionId,
  initialPersisted,
}: CheckoutSuccessStatusProps) {
  const [persisted, setPersisted] = useState(initialPersisted);
  const [status, setStatus] = useState<string | null>(
    initialPersisted ? "paid" : "processing",
  );

  useEffect(() => {
    if (persisted) {
      return;
    }

    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 12;

    const poll = async () => {
      attempts += 1;

      try {
        const response = await fetch(
          `/api/orders/status?session_id=${encodeURIComponent(sessionId)}`,
          { cache: "no-store" },
        );
        const data = (await response.json()) as OrderStatusResponse;

        if (cancelled) {
          return;
        }

        if (data.persisted && data.status === "paid") {
          setPersisted(true);
          setStatus("paid");
          return;
        }

        if (attempts >= maxAttempts) {
          setStatus("processing");
          return;
        }

        window.setTimeout(poll, 2500);
      } catch {
        if (!cancelled && attempts < maxAttempts) {
          window.setTimeout(poll, 2500);
        }
      }
    };

    const timeoutId = window.setTimeout(poll, 1500);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [persisted, sessionId]);

  if (persisted) {
    return (
      <p className="mt-4 text-[13px] leading-6 text-neutral-500" role="status">
        Your library access is ready.
      </p>
    );
  }

  return (
    <p className="mt-4 text-[13px] leading-6 text-neutral-500" role="status">
      {status === "processing"
        ? "We are finalising your edition. This usually takes only a few moments."
        : "Finalising your purchase…"}
    </p>
  );
}
