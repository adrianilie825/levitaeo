import BrandPageShell from "@/components/brand/BrandPageShell";
import EditorialPageHero from "@/components/brand/EditorialPageHero";
import { ourStoryContent } from "@/lib/content/brand";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Our Story",
  description:
    "The vision behind Levitaeo — a calm, curated publication for digital art that endures.",
  path: "/about/our-story",
});

export default function OurStoryPage() {
  return (
    <BrandPageShell>
      <EditorialPageHero
        eyebrow={ourStoryContent.eyebrow}
        title={ourStoryContent.title}
        description={ourStoryContent.intro}
      />

      <section className="mx-auto max-w-7xl px-6 py-12 md:py-16 lg:px-10">
        <div className="mx-auto max-w-3xl space-y-16">
          {ourStoryContent.sections.map((section) => (
            <article key={section.title}>
              <h2 className="text-xl font-light tracking-[-0.01em] text-[#111111] sm:text-2xl">
                {section.title}
              </h2>
              <p className="mt-5 text-[15px] leading-8 text-neutral-600 sm:text-base">
                {section.body}
              </p>
            </article>
          ))}
        </div>
      </section>
    </BrandPageShell>
  );
}
