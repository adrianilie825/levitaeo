import AboutSectionCard from "@/components/brand/AboutSectionCard";
import BrandPageShell from "@/components/brand/BrandPageShell";
import EditorialPageHero from "@/components/brand/EditorialPageHero";
import { aboutSections, whyLevitaeoExists } from "@/lib/content/brand";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "About",
  description:
    "Discover the story, philosophy, and editorial process behind Levitaeo — a curated publication for distinctive digital art.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <BrandPageShell>
      <EditorialPageHero
        eyebrow="About Levitaeo"
        title={
          <>
            A publication for
            <br />
            digital art worth keeping.
          </>
        }
        description="Levitaeo publishes curated digital editions with the calm, timeless sensibility of a fine editorial house — not the urgency of a marketplace."
      />

      <section className="mx-auto max-w-7xl px-6 py-12 md:py-16 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-3">
          {aboutSections.map((section) => (
            <AboutSectionCard key={section.href} {...section} />
          ))}
        </div>
      </section>

      <section className="border-t border-[#ECE8E2] py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-x-16 xl:gap-x-20">
            <div>
              <p className="text-[11px] font-normal uppercase tracking-[0.44em] text-neutral-500">
                {whyLevitaeoExists.eyebrow}
              </p>

              <h2 className="mt-6 text-[2rem] font-light leading-[1.12] tracking-[-0.02em] sm:text-3xl lg:text-[2.5rem]">
                {whyLevitaeoExists.title}
              </h2>
            </div>

            <div className="space-y-6 lg:pt-10">
              {whyLevitaeoExists.paragraphs.map((paragraph) => (
                <p
                  key={paragraph.slice(0, 32)}
                  className="max-w-lg text-[15px] leading-7 text-neutral-600 sm:text-base sm:leading-8"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>
    </BrandPageShell>
  );
}
