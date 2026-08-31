import Image from "next/image";
import Link from "next/link";
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
            Levitaeo
          </p>

          <h1 className="mt-6 text-[2.75rem] font-light leading-[1.08] tracking-[-0.025em] sm:text-[3.25rem] lg:mt-8 lg:text-[4.75rem] lg:leading-[1.02]">
            A curated editorial collection
            <br />
            of premium digital art editions.
          </h1>

          <p className="mt-8 max-w-[22rem] text-[15px] leading-[1.75] text-neutral-600 sm:max-w-md sm:text-base sm:leading-8 lg:max-w-lg lg:text-[17px]">
            Levitaeo publishes distinctive digital artworks for screens,
            interiors, and personal collections — selected with the care of a
            fine editorial house.
          </p>

          <div className="mt-10 lg:mt-11">
            <Link
              href="/collections"
              className="inline-flex items-center justify-center border border-[#111111] bg-[#111111] px-8 py-3.5 text-[11px] uppercase tracking-[0.18em] text-white transition-colors duration-300 hover:bg-[#FAFAF8] hover:text-[#111111]"
            >
              Explore Collections
            </Link>
          </div>

          <p className="mt-10 text-[11px] leading-relaxed tracking-[0.12em] text-neutral-500 lg:mt-12">
            Curated editions · Premium resolution · Instant access
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
      <Newsletter />
      <Footer />
    </main>
  );
}