import BrandPageShell from "@/components/brand/BrandPageShell";
import EditorialPageHero from "@/components/brand/EditorialPageHero";
import PhilosophyValuesGrid from "@/components/brand/PhilosophyValuesGrid";
import { philosophyValues } from "@/lib/content/brand";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Philosophy",
  description:
    "The five editorial values that guide every Levitaeo edition — timeless, minimal, curated, authentic, and collectible.",
  path: "/about/philosophy",
});

export default function PhilosophyPage() {
  return (
    <BrandPageShell>
      <EditorialPageHero
        eyebrow="Philosophy"
        title={
          <>
            Values we return to
            <br />
            with every edition.
          </>
        }
        description="Levitaeo is shaped by a small set of principles — not as slogans, but as standards that inform how we research, curate, design, and publish."
      />

      <section className="mx-auto max-w-7xl px-6 py-12 md:py-16 lg:px-10">
        <PhilosophyValuesGrid values={philosophyValues} />
      </section>
    </BrandPageShell>
  );
}
