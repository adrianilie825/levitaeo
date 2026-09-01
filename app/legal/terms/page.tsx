import BrandPageShell from "@/components/brand/BrandPageShell";
import EditorialPageHero from "@/components/brand/EditorialPageHero";
import LegalDocument from "@/components/brand/LegalDocument";
import { termsOfServiceContent } from "@/lib/content/legal";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Terms of Service",
  description:
    "Terms governing your use of Levitaeo and purchase of digital editions.",
  path: "/legal/terms",
});

export default function TermsOfServicePage() {
  return (
    <BrandPageShell>
      <EditorialPageHero
        eyebrow={termsOfServiceContent.eyebrow}
        title={termsOfServiceContent.title}
        description={termsOfServiceContent.intro}
      />
      <LegalDocument
        lastUpdated={termsOfServiceContent.lastUpdated}
        sections={termsOfServiceContent.sections}
      />
    </BrandPageShell>
  );
}
