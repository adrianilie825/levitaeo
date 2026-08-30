import BrandPageShell from "@/components/brand/BrandPageShell";
import EditorialPageHero from "@/components/brand/EditorialPageHero";
import { contactContent } from "@/lib/content/brand";
import { createPageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import Link from "next/link";

export const metadata = createPageMetadata({
  title: "Contact",
  description:
    "Get in touch with Levitaeo — questions about editions, your library, or future collaborations.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <BrandPageShell>
      <EditorialPageHero
        eyebrow={contactContent.eyebrow}
        title={contactContent.title}
        description={contactContent.intro}
      />

      <section className="mx-auto max-w-3xl px-6 py-12 md:py-16 lg:px-10">
        <div className="border border-[#ECE8E2] bg-[#F7F5F1]/40 px-8 py-12 md:px-12 md:py-16">
          <p className="text-[11px] uppercase tracking-[0.32em] text-neutral-500">
            Email
          </p>

          <a
            href={`mailto:${siteConfig.contactEmail}`}
            className="mt-5 inline-block text-2xl font-light tracking-[-0.02em] text-[#111111] transition-colors hover:text-neutral-600 sm:text-3xl"
          >
            {siteConfig.contactEmail}
          </a>

          <p className="mt-8 max-w-md text-[15px] leading-7 text-neutral-600">
            {contactContent.responseNote}
          </p>
        </div>

        <div className="mt-12 grid gap-10 sm:grid-cols-2">
          <div>
            <p className="text-[11px] uppercase tracking-[0.32em] text-neutral-500">
              Collections
            </p>
            <p className="mt-4 text-[15px] leading-7 text-neutral-600">
              Explore our curated digital editions and discover work for your
              spaces.
            </p>
            <Link
              href="/collections"
              className="mt-4 inline-block text-[12px] tracking-[0.1em] text-neutral-600 underline-offset-4 transition-colors hover:text-[#111111] hover:underline"
            >
              View collections
            </Link>
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-[0.32em] text-neutral-500">
              FAQ
            </p>
            <p className="mt-4 text-[15px] leading-7 text-neutral-600">
              Many common questions about downloads, licensing, and payments are
              answered in our FAQ.
            </p>
            <Link
              href="/faq"
              className="mt-4 inline-block text-[12px] tracking-[0.1em] text-neutral-600 underline-offset-4 transition-colors hover:text-[#111111] hover:underline"
            >
              Read the FAQ
            </Link>
          </div>
        </div>
      </section>
    </BrandPageShell>
  );
}
