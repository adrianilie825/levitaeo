import Image from "next/image";
import Link from "next/link";
import { COLLECTIONS_PAGE_CONTAINER } from "@/lib/catalog/collections-page-data";
import { formatEditionLabel, getProductPath } from "@/lib/products-db";
import type { Product } from "@/types/product";

const MINIMAL_HERO_IMAGE = "/images/collections/minimal-cover.png";

const sectionSpacing = "py-10 md:py-14 lg:py-16";

type MinimalCollectionPageProps = {
  editions: Product[];
};

function MinimalEditionCard({ product }: { product: Product }) {
  const href = getProductPath(product);

  return (
    <Link
      href={href}
      aria-label={`View ${product.title}`}
      className="group block"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-[#F5F3EF]">
        <Image
          src={product.image}
          alt={product.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          className="object-cover transition-opacity duration-700 ease-out group-hover:opacity-95"
        />
      </div>

      <div className="mt-4 md:mt-5">
        {product.edition?.trim() ? (
          <p className="text-[10px] uppercase tracking-[0.28em] text-neutral-500">
            {formatEditionLabel(product.edition)}
          </p>
        ) : null}

        <p className="mt-2 text-lg font-light tracking-[-0.01em] text-[#111111] sm:text-xl">
          {product.title}
        </p>
      </div>
    </Link>
  );
}

function MinimalOpeningComposition() {
  return (
    <section className="border-b border-[#ECE8E2]">
      <div
        className={`${COLLECTIONS_PAGE_CONTAINER} pt-7 pb-12 md:pt-9 md:pb-14 lg:pb-16`}
      >
        <div className="flex flex-col gap-10 md:gap-12 lg:grid lg:grid-cols-2 lg:items-stretch lg:gap-x-12 xl:gap-x-16">
          <div className="flex flex-col justify-between lg:py-1">
            <div className="max-w-md">
              <p className="text-[11px] font-normal uppercase tracking-[0.44em] text-neutral-500">
                Minimal
              </p>

              <h1 className="mt-5 text-[2.15rem] font-light leading-[1.12] tracking-[-0.02em] sm:text-[2.35rem] lg:text-[2.65rem]">
                Less, considered
                <br />
                more carefully.
              </h1>

              <p className="mt-5 text-[15px] leading-7 text-neutral-600 sm:text-base sm:leading-8">
                Studies in proportion, restraint, negative space and visual
                balance.
              </p>
            </div>

            <div className="mt-10 max-w-md md:mt-12 lg:mt-0 lg:pt-12">
              <p className="text-[15px] leading-7 text-neutral-600 sm:text-base sm:leading-8">
                Minimal explores what remains when everything unnecessary is
                removed.
              </p>

              <p className="mt-6 text-[15px] leading-7 text-neutral-600 sm:mt-7 sm:text-base sm:leading-8">
                Form, proportion and silence become the composition.
              </p>
            </div>
          </div>

          <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#F5F3EF] sm:aspect-[5/6] lg:aspect-auto lg:min-h-[520px]">
            <Image
              src={MINIMAL_HERO_IMAGE}
              alt="Minimal collection"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-center"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function MinimalEditions({ editions }: { editions: Product[] }) {
  return (
    <section
      className={sectionSpacing}
      aria-labelledby="minimal-editions"
    >
      <div className={COLLECTIONS_PAGE_CONTAINER}>
        <div className="max-w-xl">
          <p className="text-[11px] font-normal uppercase tracking-[0.44em] text-neutral-500">
            The Editions
          </p>

          <h2
            id="minimal-editions"
            className="mt-5 text-[1.75rem] font-light leading-[1.12] tracking-[-0.02em] sm:text-[2rem]"
          >
            Explore the collection.
          </h2>
        </div>

        {editions.length > 0 ? (
          <div className="mt-12 grid grid-cols-1 gap-10 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-12 lg:mt-14 lg:grid-cols-3 lg:gap-x-10 lg:gap-y-14">
            {editions.map((product) => (
              <MinimalEditionCard key={product.slug} product={product} />
            ))}
          </div>
        ) : (
          <div className="mt-14 border border-[#ECE8E2] bg-[#F7F5F1]/70 px-8 py-14 text-center md:px-12 md:py-16">
            <p className="text-xl font-light tracking-[-0.01em] text-[#111111] sm:text-2xl">
              The collection is taking shape.
            </p>

            <p className="mx-auto mt-4 max-w-md text-[15px] leading-7 text-neutral-600">
              A new series of Minimal editions is currently in development.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

export default function MinimalCollectionPage({
  editions,
}: MinimalCollectionPageProps) {
  return (
    <>
      <MinimalOpeningComposition />
      <MinimalEditions editions={editions} />
    </>
  );
}
