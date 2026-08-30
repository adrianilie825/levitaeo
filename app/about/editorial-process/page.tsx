import BrandPageShell from "@/components/brand/BrandPageShell";
import EditorialPageHero from "@/components/brand/EditorialPageHero";
import EditorialProcessFlow from "@/components/brand/EditorialProcessFlow";
import { editorialProcessSteps } from "@/lib/content/brand";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Editorial Process",
  description:
    "How Levitaeo editions move from research to collection — a deliberate editorial sequence for distinctive digital art.",
  path: "/about/editorial-process",
});

export default function EditorialProcessPage() {
  return (
    <BrandPageShell>
      <EditorialPageHero
        eyebrow="Editorial Process"
        title={
          <>
            From first observation
            <br />
            to lasting collection.
          </>
        }
        description="Every Levitaeo edition follows a considered path. Nothing is rushed to market — each stage exists to protect the integrity of the work."
      />

      <section className="mx-auto max-w-7xl px-6 py-12 md:py-16 lg:px-10">
        <EditorialProcessFlow steps={editorialProcessSteps} />
      </section>
    </BrandPageShell>
  );
}
