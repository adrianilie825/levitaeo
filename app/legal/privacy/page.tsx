import BrandPageShell from "@/components/brand/BrandPageShell";
import EditorialPageHero from "@/components/brand/EditorialPageHero";
import LegalDocument from "@/components/brand/LegalDocument";
import { privacyPolicyContent } from "@/lib/content/legal";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Privacy Policy",
  description:
    "How Levitaeo collects, uses, and protects your personal information.",
  path: "/legal/privacy",
});

export default function PrivacyPolicyPage() {
  return (
    <BrandPageShell>
      <EditorialPageHero
        eyebrow={privacyPolicyContent.eyebrow}
        title={privacyPolicyContent.title}
        description={privacyPolicyContent.intro}
      />
      <LegalDocument
        lastUpdated={privacyPolicyContent.lastUpdated}
        sections={privacyPolicyContent.sections}
      />
    </BrandPageShell>
  );
}
