"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type SyncOutcome = "created" | "updated" | "skipped" | "failed";

type SyncProgressItem = {
  slug: string;
  title: string;
  outcome: SyncOutcome;
  message: string;
};

type SyncSummary = {
  total: number;
  created: number;
  updated: number;
  skipped: number;
  failed: number;
};

const outcomeLabels: Record<SyncOutcome, string> = {
  created: "Created",
  updated: "Updated",
  skipped: "Skipped",
  failed: "Failed",
};

const outcomePrefix: Record<SyncOutcome, string> = {
  created: "✓",
  updated: "✓",
  skipped: "✓",
  failed: "✗",
};

export default function StripeBulkSyncPanel() {
  const router = useRouter();
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<SyncProgressItem[]>([]);
  const [summary, setSummary] = useState<SyncSummary | null>(null);

  async function syncWithStripe() {
    setRunning(true);
    setError(null);
    setItems([]);
    setSummary(null);

    try {
      const response = await fetch("/api/admin/stripe/sync", {
        method: "POST",
        credentials: "same-origin",
        cache: "no-store",
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(data.error ?? "Bulk Stripe sync could not be started.");
      }

      if (!response.body) {
        throw new Error("Bulk Stripe sync returned no response body.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.trim()) {
            continue;
          }

          const event = JSON.parse(line) as
            | {
                type: "item";
                slug: string;
                title: string;
                outcome: SyncOutcome;
                message: string;
              }
            | {
                type: "summary";
                total: number;
                created: number;
                updated: number;
                skipped: number;
                failed: number;
              }
            | {
                type: "error";
                message: string;
              };

          if (event.type === "item") {
            setItems((current) => [
              ...current,
              {
                slug: event.slug,
                title: event.title,
                outcome: event.outcome,
                message: event.message,
              },
            ]);
            continue;
          }

          if (event.type === "summary") {
            setSummary({
              total: event.total,
              created: event.created,
              updated: event.updated,
              skipped: event.skipped,
              failed: event.failed,
            });
            router.refresh();
            continue;
          }

          if (event.type === "error") {
            throw new Error(event.message);
          }
        }
      }
    } catch (syncError) {
      setError(
        syncError instanceof Error
          ? syncError.message
          : "Bulk Stripe sync failed.",
      );
    } finally {
      setRunning(false);
    }
  }

  return (
    <section className="mt-10 border border-[#ECE8E2] bg-white p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <h2 className="text-xl font-light tracking-[-0.02em]">
            Stripe synchronization
          </h2>
          <p className="mt-3 text-[15px] leading-7 text-neutral-600">
            Scan all editions and create or update Stripe Products and Prices
            where needed. Running sync twice will skip editions already in sync.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void syncWithStripe()}
          disabled={running}
          className="inline-flex items-center justify-center border border-[#111111] bg-[#111111] px-8 py-3.5 text-[11px] uppercase tracking-[0.18em] text-white transition-colors duration-300 hover:bg-transparent hover:text-[#111111] disabled:cursor-not-allowed disabled:border-neutral-300 disabled:bg-neutral-200 disabled:text-neutral-500 disabled:hover:bg-neutral-200 disabled:hover:text-neutral-500"
        >
          {running ? "Syncing with Stripe…" : "Sync with Stripe"}
        </button>
      </div>

      {error ? (
        <p className="mt-6 text-[13px] leading-6 text-neutral-700" role="alert">
          {error}
        </p>
      ) : null}

      {items.length > 0 ? (
        <div className="mt-8 border border-[#ECE8E2]">
          <div className="border-b border-[#ECE8E2] px-4 py-3 text-[11px] uppercase tracking-[0.28em] text-neutral-500">
            Progress
          </div>
          <ul className="max-h-72 overflow-y-auto">
            {items.map((item, index) => (
              <li
                key={`${item.slug}-${index}`}
                className="border-b border-[#ECE8E2] px-4 py-3 last:border-b-0"
              >
                <p className="text-[14px] text-[#111111]">
                  <span
                    className={
                      item.outcome === "failed"
                        ? "text-neutral-700"
                        : "text-neutral-600"
                    }
                  >
                    {outcomePrefix[item.outcome]} {outcomeLabels[item.outcome]}
                  </span>
                  <span className="text-neutral-400"> · </span>
                  <span>{item.title}</span>
                  <span className="font-mono text-xs text-neutral-500">
                    {" "}
                    ({item.slug})
                  </span>
                </p>
                <p className="mt-1 text-[12px] leading-5 text-neutral-500">
                  {item.message}
                </p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {summary ? (
        <div className="mt-8 border border-[#ECE8E2] p-6">
          <p className="text-[11px] uppercase tracking-[0.28em] text-neutral-500">
            Final report
          </p>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <SummaryStat label="Total" value={summary.total} />
            <SummaryStat label="Created" value={summary.created} />
            <SummaryStat label="Updated" value={summary.updated} />
            <SummaryStat label="Skipped" value={summary.skipped} />
            <SummaryStat label="Failed" value={summary.failed} />
          </dl>
        </div>
      ) : null}
    </section>
  );
}

function SummaryStat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-[0.24em] text-neutral-500">
        {label}
      </dt>
      <dd className="mt-2 text-2xl font-light tracking-[-0.02em]">{value}</dd>
    </div>
  );
}
