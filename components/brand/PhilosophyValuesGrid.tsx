import type { BrandValue } from "@/lib/content/brand";

type PhilosophyValuesGridProps = {
  values: BrandValue[];
};

export default function PhilosophyValuesGrid({
  values,
}: PhilosophyValuesGridProps) {
  return (
    <div className="grid gap-8 md:grid-cols-2 lg:gap-10">
      {values.map((value, index) => (
        <article
          key={value.title}
          className="border border-[#ECE8E2] bg-[#F7F5F1]/40 px-8 py-10 md:px-10 md:py-12"
        >
          <p className="text-[11px] tracking-[0.28em] text-neutral-400">
            {String(index + 1).padStart(2, "0")}
          </p>

          <h2 className="mt-5 text-2xl font-light tracking-[-0.02em] text-[#111111]">
            {value.title}
          </h2>

          <p className="mt-4 max-w-md text-[15px] leading-7 text-neutral-600">
            {value.description}
          </p>
        </article>
      ))}
    </div>
  );
}
