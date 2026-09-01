"use client";

import { useState } from "react";
import type { FaqTopic } from "@/lib/content/brand";

type FaqAccordionProps = {
  topics: FaqTopic[];
};

function FaqItemRow({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const panelId = question.replace(/\s+/g, "-").toLowerCase();

  return (
    <div className="border-b border-[#ECE8E2] last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="flex w-full items-start justify-between gap-6 py-6 text-left transition-colors hover:text-neutral-700"
      >
        <span className="text-[15px] font-light leading-7 text-[#111111] sm:text-base">
          {question}
        </span>
        <span
          aria-hidden="true"
          className="mt-1 shrink-0 text-[18px] font-light leading-none text-neutral-400"
        >
          {isOpen ? "−" : "+"}
        </span>
      </button>

      <div
        id={panelId}
        hidden={!isOpen}
        className="pb-6 text-[15px] leading-7 text-neutral-600"
      >
        {answer}
      </div>
    </div>
  );
}

export default function FaqAccordion({ topics }: FaqAccordionProps) {
  const [openKey, setOpenKey] = useState<string | null>(null);

  return (
    <div className="space-y-16">
      {topics.map((topic) => (
        <section
          key={topic.id}
          id={topic.id}
          aria-labelledby={`faq-${topic.id}`}
        >
          <div className="flex flex-wrap items-baseline gap-3">
            <h2
              id={`faq-${topic.id}`}
              className="text-[11px] uppercase tracking-[0.32em] text-neutral-500"
            >
              {topic.title}
            </h2>
            {topic.comingSoon ? (
              <span className="text-[11px] tracking-[0.12em] text-neutral-400">
                Coming Soon
              </span>
            ) : null}
          </div>

          <div className="mt-6 border-t border-[#ECE8E2]">
            {topic.items.map((item) => {
              const key = `${topic.id}-${item.question}`;
              return (
                <FaqItemRow
                  key={key}
                  question={item.question}
                  answer={item.answer}
                  isOpen={openKey === key}
                  onToggle={() =>
                    setOpenKey((current) => (current === key ? null : key))
                  }
                />
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
