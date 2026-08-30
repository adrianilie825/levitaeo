import Footer from "@/components/Footer";
import NavbarWithAuth from "@/components/NavbarWithAuth";
import CollectionCard from "@/components/CollectionCard";
import JsonLd from "@/components/JsonLd";
import { getPublicCollectionsWithStats } from "@/lib/catalog/collections-public";
import { collectionPageJsonLd, createPageMetadata } from "@/lib/seo";
import Link from "next/link";

const collectionsDescription =
  "Explore Levitaeo collections of curated digital editions for screens, interiors, and personal collections.";

export const metadata = createPageMetadata({
  title: "Collections",
  description: collectionsDescription,
  path: "/collections",
});

export default async function CollectionsPage() {
  const collections = await getPublicCollectionsWithStats();

  return (
    <main className="bg-[#FAFAF8] text-[#111111]">
      <JsonLd
        data={collectionPageJsonLd({
          name: "Levitaeo Collections",
          description: collectionsDescription,
          path: "/collections",
        })}
      />
      <NavbarWithAuth />

      <section className="border-b border-[#ECE8E2]">
        <div className="mx-auto max-w-7xl px-6 pt-12 pb-10 md:pt-16 md:pb-14 lg:px-10">
          <p className="text-[11px] font-normal uppercase tracking-[0.44em] text-neutral-500">
            Levitaeo Collections
          </p>

          <h1 className="mt-6 max-w-3xl text-[2.5rem] font-light leading-[1.1] tracking-[-0.02em] sm:text-4xl lg:text-[3.5rem] lg:leading-[1.06]">
            Art for screens,
            <br />
            spaces, and collectors.
          </h1>

          <p className="mt-6 max-w-2xl text-[15px] leading-7 text-neutral-600 sm:text-base sm:leading-8">
            Explore curated digital editions created with a focus on balance,
            atmosphere, and lasting visual character.
          </p>
        </div>
      </section>

      <section
        className="mx-auto max-w-7xl px-6 py-12 md:py-16 lg:px-10"
        aria-label="Collection listings"
      >
        <div className="grid gap-12 md:grid-cols-2 md:gap-x-10 md:gap-y-16">
          {collections.map((collection) => (
            <CollectionCard
              key={collection.slug}
              collection={collection}
              variant="grid"
            />
          ))}
        </div>
      </section>

      <section className="border-t border-[#ECE8E2] py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-x-16 xl:gap-x-20">
            <div>
              <p className="text-[11px] font-normal uppercase tracking-[0.44em] text-neutral-500">
                The Levitaeo Approach
              </p>

              <h2 className="mt-6 text-[2rem] font-light leading-[1.12] tracking-[-0.02em] sm:text-3xl lg:text-[2.5rem]">
                Fewer pieces.
                <br />
                Stronger character.
              </h2>
            </div>

            <div className="lg:pt-10">
              <p className="max-w-lg text-[15px] leading-7 text-neutral-600 sm:text-base sm:leading-8">
                Each collection is developed as a focused visual world rather
                than an endless catalogue. Every edition is selected to feel
                distinct, considered, and worth returning to.
              </p>

              <Link
                href="#"
                className="mt-6 inline-block text-[12px] tracking-[0.1em] text-neutral-600 underline-offset-4 transition-colors hover:text-[#111111] hover:underline"
              >
                Discover our story
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
