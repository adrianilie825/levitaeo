import type { EditorialProcessStep } from "@/lib/content/brand";

type StepIconProps = {
  step: string;
};

function StepIcon({ step }: StepIconProps) {
  const className = "h-5 w-5 stroke-[#111111]";

  switch (step) {
    case "Research":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <circle cx="11" cy="11" r="6" strokeWidth="1.25" />
          <path d="M16 16l4 4" strokeWidth="1.25" strokeLinecap="round" />
        </svg>
      );
    case "Curation":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <path d="M5 7h14M5 12h10M5 17h6" strokeWidth="1.25" strokeLinecap="round" />
        </svg>
      );
    case "Design":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <path
            d="M4 20l8.5-8.5M14 6l4 4M10 10l4 4M6 18l2-2"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "Publication":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <path
            d="M6 4h10l4 4v12a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z"
            strokeWidth="1.25"
            strokeLinejoin="round"
          />
          <path d="M16 4v4h4M8 12h8M8 16h5" strokeWidth="1.25" strokeLinecap="round" />
        </svg>
      );
    case "Collection":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <rect x="4" y="4" width="7" height="7" strokeWidth="1.25" />
          <rect x="13" y="4" width="7" height="7" strokeWidth="1.25" />
          <rect x="4" y="13" width="7" height="7" strokeWidth="1.25" />
          <rect x="13" y="13" width="7" height="7" strokeWidth="1.25" />
        </svg>
      );
    default:
      return null;
  }
}

type EditorialProcessFlowProps = {
  steps: EditorialProcessStep[];
};

export default function EditorialProcessFlow({
  steps,
}: EditorialProcessFlowProps) {
  return (
    <div className="mx-auto max-w-2xl">
      {steps.map((step, index) => (
        <div key={step.title}>
          <article className="border border-[#ECE8E2] bg-[#FAFAF8] px-8 py-10 md:px-10 md:py-12">
            <div className="flex items-start gap-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center border border-[#ECE8E2] bg-[#F7F5F1]/70">
                <StepIcon step={step.title} />
              </div>

              <div>
                <p className="text-[11px] tracking-[0.28em] text-neutral-400">
                  {String(index + 1).padStart(2, "0")}
                </p>

                <h2 className="mt-2 text-xl font-light tracking-[-0.01em] text-[#111111] sm:text-2xl">
                  {step.title}
                </h2>

                <p className="mt-4 text-[15px] leading-7 text-neutral-600">
                  {step.description}
                </p>
              </div>
            </div>
          </article>

          {index < steps.length - 1 ? (
            <div className="flex justify-center py-3" aria-hidden="true">
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-neutral-300" fill="none">
                <path
                  d="M12 5v14M7 14l5 5 5-5"
                  stroke="currentColor"
                  strokeWidth="1.25"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
