import Image from "next/image";
import Link from "next/link";
import FeaturedArtwork from "@/components/FeaturedArtwork";
import FeaturedCollections from "@/components/FeaturedCollections";
import Footer from "@/components/Footer";
import NavbarWithAuth from "@/components/NavbarWithAuth";
import Newsletter from "@/components/Newsletter";
import WhyLevitaeo from "@/components/WhyLevitaeo";
import { createPageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const metadata = createPageMetadata({
  title: siteConfig.tagline,
  path: "/",
});

export default function Home() {
  return (
    <main className="bg-[#FAFAF8] text-[#111111]">
      <NavbarWithAuth />

      {/* HERO */}

      <section className="mx-auto max-w-7xl px-6 pt-10 pb-8 md:pt-14 md:pb-12 lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-14 lg:px-10 xl:gap-x-20">
        <div className="flex max-w-xl flex-col">
          <p className="text-[11px] font-normal uppercase tracking-[0.44em] text-neutral-500">
            Curated Digital Editions
          </p>

          <h1 className="mt-10 text-[2.75rem] font-light leading-[1.08] tracking-[-0.025em] sm:text-[3.25rem] lg:mt-12 lg:text-[4.75rem] lg:leading-[1.02]">
            Digital Art
            <br />
            Worth Collecting
          </h1>

          <p className="mt-9 max-w-[22rem] text-[15px] leading-[1.75] text-neutral-600 sm:max-w-md sm:text-base sm:leading-8 lg:mt-10 lg:max-w-lg lg:text-[17px]">
            A curated collection of distinctive digital artworks created for
            screens, spaces, and personal collections.
          </p>

          <div className="mt-11 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center lg:mt-12">
            <Link
              href="/collections"
              className="inline-flex items-center justify-center border border-[#111111] bg-[#111111] px-8 py-3.5 text-[11px] uppercase tracking-[0.18em] text-white transition-colors duration-300 hover:bg-[#FAFAF8] hover:text-[#111111]"
            >
              Explore the Collection
            </Link>
            <Link
              href="/collections/originals"
              className="inline-flex items-center justify-center border border-[#111111] bg-transparent px-8 py-3.5 text-[11px] uppercase tracking-[0.18em] text-[#111111] transition-colors duration-300 hover:bg-[#111111] hover:text-white"
            >
              View Originals
            </Link>
          </div>

          <p className="mt-12 text-[11px] leading-relaxed tracking-[0.12em] text-neutral-500 lg:mt-14">
            Independent editions · Instant access · Created for collectors
          </p>
        </div>

        <div className="mt-12 lg:mt-0 lg:flex lg:justify-end lg:pl-4">
          <div className="group relative w-full max-w-[440px] pb-14 lg:max-w-[520px]">
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[3px] border border-[#E8E4DE]">
              <Image
                src="/images/collections/originals.png"
                alt="Levitaeo Originals — Edition 001"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 520px"
                className="object-cover transition-transform duration-[850ms] ease-out group-hover:scale-[1.012]"
              />
            </div>

            <div className="absolute -bottom-px left-6 border border-[#ECE8E2] bg-[#FAFAF8] px-5 py-3.5 transition-transform duration-300 group-hover:-translate-y-1 lg:left-10">
              <p className="text-[10px] uppercase tracking-[0.4em] text-neutral-500">
                EDITION 001
              </p>
              <p className="mt-2 text-[13px] tracking-[0.04em] text-[#111111]">
                Levitaeo Originals
              </p>
            </div>
          </div>
        </div>
      </section>

      <FeaturedCollections />

      <WhyLevitaeo />
      <FeaturedArtwork />
      <Newsletter />
      <Footer />
    </main>
  );
}