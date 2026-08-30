import BrandPageShell from "@/components/brand/BrandPageShell";
import EditorialPageHero from "@/components/brand/EditorialPageHero";
import FaqAccordion from "@/components/brand/FaqAccordion";
import { faqTopics } from "@/lib/content/brand";
import { createPageMetadata } from "@/lib/seo";
import Link from "next/link";

export const metadata = createPageMetadata({
  title: "FAQ",
  description:
    "Answers about Levitaeo digital editions, downloads, licensing, printing, payments, and upcoming membership.",
  path: "/faq",
});

export default function FaqPage() {
  return (
    <BrandPageShell>
      <EditorialPageHero
        eyebrow="Support"
        title="Questions, answered with clarity."
        description="Everything you need to know about collecting, downloading, and living with Levitaeo editions."
      />

      <section className="mx-auto max-w-3xl px-6 py-12 md:py-16 lg:px-10">
        <FaqAccordion topics={faqTopics} />

        <div className="mt-16 border-t border-[#ECE8E2] pt-10">
          <p className="text-[11px] uppercase tracking-[0.32em] text-neutral-500">
            Still need help?
          </p>
          <p className="mt-4 text-[15px] leading-7 text-neutral-600">
            If your question is not covered here, we are happy to assist.
          </p>
          <Link
            href="/contact"
            className="mt-6 inline-block text-[12px] tracking-[0.1em] text-neutral-600 underline-offset-4 transition-colors hover:text-[#111111] hover:underline"
          >
            Contact Levitaeo
          </Link>
        </div>
      </section>
    </BrandPageShell>
  );
}
