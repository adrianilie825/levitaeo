import type { LegalSection } from "@/lib/content/legal";

type LegalDocumentProps = {
  lastUpdated: string;
  sections: LegalSection[];
};

export default function LegalDocument({
  lastUpdated,
  sections,
}: LegalDocumentProps) {
  return (
    <section className="mx-auto max-w-7xl px-6 py-12 md:py-16 lg:px-10">
      <div className="mx-auto max-w-3xl">
        <p className="text-[12px] tracking-[0.08em] text-neutral-500">
          Last updated {lastUpdated}
        </p>

        <div className="mt-12 space-y-14">
          {sections.map((section) => (
            <article key={section.title}>
              <h2 className="text-xl font-light tracking-[-0.01em] text-[#111111] sm:text-2xl">
                {section.title}
              </h2>
              <div className="mt-5 space-y-4">
                {section.paragraphs.map((paragraph) => (
                  <p
                    key={paragraph.slice(0, 48)}
                    className="text-[15px] leading-8 text-neutral-600 sm:text-base"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
