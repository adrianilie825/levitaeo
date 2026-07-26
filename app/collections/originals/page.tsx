import Image from "next/image";
import Footer from "@/components/Footer";
import NavbarWithAuth from "@/components/NavbarWithAuth";
import Newsletter from "@/components/Newsletter";
import ProductCard from "@/components/ProductCard";
import JsonLd from "@/components/JsonLd";
import { getProductsByCollection } from "@/lib/products-db";
import { collectionPageJsonLd, createPageMetadata } from "@/lib/seo";

export const revalidate = 300;

const originalsDescription =
  "Explore Levitaeo Originals, a focused series of limited digital editions shaped by contrast, balance, atmosphere, and restraint.";

export const metadata = createPageMetadata({
  title: "Originals",
  description: originalsDescription,
  path: "/collections/originals",
  image: "/images/collections/originals.png",
});

const collectionDetails = [
  { label: "Edition type", value: "Limited digital editions" },
  { label: "Format", value: "High-resolution artwork" },
  {
    label: "Created for",
    value: "Screens, interiors, and personal collections",
  },
];

const principles = [
  {
    number: "01",
    title: "Distinct Character",
    text: "Each edition is designed to stand on its own.",
  },
  {
    number: "02",
    title: "Limited Release",
    text: "Collections remain focused and intentionally small.",
  },
  {
    number: "03",
    title: "Lasting Relevance",
    text: "Created beyond short-lived visual trends.",
  },
];

const originalsProductsPromise = getProductsByCollection("originals");

export default async function OriginalsCollectionPage() {
  const originalsProducts = await originalsProductsPromise;

  return (
    <main className="bg-[#FAFAF8] text-[#111111]">
      <JsonLd
        data={collectionPageJsonLd({
          name: "Levitaeo Originals",
          description: originalsDescription,
          path: "/collections/originals",
        })}
      />
      <NavbarWithAuth />

      <section className="border-b border-[#ECE8E2]">
        <div className="mx-auto max-w-7xl px-6 pt-10 pb-12 md:pt-14 md:pb-16 lg:px-10">
          <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-x-16 xl:gap-x-20">
            <div className="max-w-xl">
              <p className="text-[11px] font-normal uppercase tracking-[0.44em] text-neutral-500">
                Levitaeo Originals
              </p>

              <h1 className="mt-6 text-[2.25rem] font-light leading-[1.1] tracking-[-0.02em] sm:text-4xl lg:text-[3.25rem] lg:leading-[1.06]">
                Distinctive digital editions,
                <br />
                created to endure.
              </h1>

              <p className="mt-6 text-[15px] leading-7 text-neutral-600 sm:text-base sm:leading-8">
                Originals is a curated series of exclusive Levitaeo artworks
                shaped by contrast, balance, atmosphere, and visual restraint.
              </p>

              <dl className="mt-8 space-y-4 border-t border-[#ECE8E2] pt-8">
                {collectionDetails.map((item) => (
                  <div
                    key={item.label}
                    className="grid grid-cols-[7.5rem_1fr] gap-4 text-[13px] leading-6 sm:grid-cols-[8.5rem_1fr]"
                  >
                    <dt className="tracking-[0.06em] text-neutral-500">
                      {item.label}
                    </dt>
                    <dd className="text-[#111111]">{item.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="group relative mx-auto w-full max-w-[440px] lg:mx-0 lg:max-w-none lg:justify-self-end">
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[3px] border border-[#E8E4DE]">
                <Image
                  src="/images/collections/originals.png"
                  alt="Levitaeo Originals collection artwork"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                />
              </div>

              <div className="absolute bottom-5 left-5 border border-[#ECE8E2] bg-[#FAFAF8] px-4 py-3 lg:bottom-8 lg:left-8">
                <p className="text-[10px] uppercase tracking-[0.38em] text-neutral-500">
                  Levitaeo Originals
                </p>
                <p className="mt-1.5 text-[11px] tracking-[0.12em] text-[#111111]">
                  COLLECTION 001
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        className="mx-auto max-w-7xl px-6 py-12 md:py-16 lg:px-10"
        aria-labelledby="editions-heading"
      >
        <div className="max-w-2xl">
          <p className="text-[11px] font-normal uppercase tracking-[0.44em] text-neutral-500">
            The Editions
          </p>

          <h2
            id="editions-heading"
            className="mt-5 text-[2rem] font-light leading-[1.12] tracking-[-0.02em] sm:text-3xl"
          >
            Explore the collection.
          </h2>

          <p className="mt-5 text-[15px] leading-7 text-neutral-600 sm:text-base sm:leading-8">
            A focused series of digital works, each developed as a distinct
            visual edition.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-10 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-12 lg:grid-cols-3 lg:gap-x-10 lg:gap-y-14">
          {originalsProducts.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </section>

      <section className="border-t border-[#ECE8E2] py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="max-w-3xl">
            <p className="text-[11px] font-normal uppercase tracking-[0.44em] text-neutral-500">
              The Originals Philosophy
            </p>

            <h2 className="mt-6 text-[2rem] font-light leading-[1.12] tracking-[-0.02em] sm:text-3xl lg:text-[2.5rem]">
              Created with intention.
              <br />
              Released with restraint.
            </h2>

            <p className="mt-6 max-w-2xl text-[15px] leading-7 text-neutral-600 sm:text-base sm:leading-8">
              Originals is not an endless catalogue. Each work is introduced as
              part of a considered series, allowing every edition to retain its
              own identity and visual presence.
            </p>
          </div>

          <div className="mt-12 grid gap-10 md:mt-14 md:grid-cols-3 md:gap-0 md:divide-x md:divide-[#ECE8E2]">
            {principles.map((principle) => (
              <div
                key={principle.number}
                className="md:px-8 md:first:pl-0 md:last:pr-0 lg:px-10"
              >
                <p className="text-[11px] tracking-[0.28em] text-neutral-400">
                  {principle.number}
                </p>

                <h3 className="mt-4 text-lg font-light tracking-[-0.01em] text-[#111111] sm:text-xl">
                  {principle.title}
                </h3>

                <p className="mt-3 max-w-xs text-[15px] leading-7 text-neutral-600">
                  {principle.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Newsletter />
      <Footer />
    </main>
  );
}
