import Image from "next/image";
import Link from "next/link";
import { COLLECTIONS_PAGE_CONTAINER } from "@/lib/catalog/collections-page-data";
import { formatEditionLabel, getProductPath } from "@/lib/products-db";
import type { Product } from "@/types/product";

const sectionSpacing = "py-10 md:py-14 lg:py-16";
const introSpacing = "py-12 md:py-16 lg:py-20";

type NatureCollectionPageProps = {
  heroImage: string;
  editions: Product[];
};

function getEditionGridClass(index: number, total: number): string {
  if (total === 1) {
    return "col-span-full lg:col-span-8 lg:col-start-3";
  }

  if (total === 2) {
    return index === 0
      ? "col-span-full lg:col-span-8"
      : "col-span-full lg:col-span-4";
  }

  const patterns = [
    "col-span-full lg:col-span-8",
    "col-span-full lg:col-span-4",
    "col-span-full sm:col-span-1 lg:col-span-6",
    "col-span-full sm:col-span-1 lg:col-span-6",
  ];

  return patterns[index % patterns.length] ?? "col-span-full lg:col-span-6";
}

function getEditionAspectClass(index: number): string {
  return index % 2 === 0 ? "aspect-[16/10]" : "aspect-[4/5]";
}

function NatureEditionCard({
  product,
  aspectClassName,
}: {
  product: Product;
  aspectClassName: string;
}) {
  const href = getProductPath(product);

  return (
    <Link
      href={href}
      aria-label={`View ${product.title}`}
      className="group block"
    >
      <div
        className={`relative w-full overflow-hidden bg-[#F5F3EF] ${aspectClassName}`}
      >
        <Image
          src={product.image}
          alt={product.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 40vw"
          className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.015]"
        />
      </div>

      <div className="mt-5 md:mt-6">
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

function NatureHero({ heroImage }: { heroImage: string }) {
  return (
    <section className="border-b border-[#ECE8E2]">
      <div className={`${COLLECTIONS_PAGE_CONTAINER} pt-7 pb-10 md:pt-9 md:pb-12 lg:pb-14`}>
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#F5F3EF] sm:aspect-[16/9]">
          <Image
            src={heroImage}
            alt="Nature collection"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 1400px"
            className="object-cover"
          />
        </div>

        <div className="mt-8 max-w-2xl md:mt-10 lg:mt-12">
          <p className="text-[11px] font-normal uppercase tracking-[0.44em] text-neutral-500">
            Nature
          </p>

          <h1 className="mt-5 text-[2.25rem] font-light leading-[1.1] tracking-[-0.02em] sm:text-[2.5rem] lg:text-[3rem] lg:leading-[1.08]">
            Quiet landscapes,
            <br />
            shaped by light.
          </h1>

          <p className="mt-5 max-w-xl text-[15px] leading-7 text-neutral-600 sm:text-base sm:leading-8">
            Atmospheric studies of land, weather, texture and natural rhythm.
          </p>
        </div>
      </div>
    </section>
  );
}

function NatureIntroduction() {
  return (
    <section className={introSpacing}>
      <div className={COLLECTIONS_PAGE_CONTAINER}>
        <div className="max-w-2xl">
          <p className="text-[15px] leading-7 text-neutral-600 sm:text-base sm:leading-8">
            Nature explores the emotional character of landscape.
          </p>

          <p className="mt-6 text-[15px] leading-7 text-neutral-600 sm:mt-7 sm:text-base sm:leading-8">
            A curated series shaped by mist, shadow, distance and changing
            light.
          </p>
        </div>
      </div>
    </section>
  );
}

function NatureEditions({ editions }: { editions: Product[] }) {
  return (
    <section
      className={`border-t border-[#ECE8E2] ${sectionSpacing}`}
      aria-labelledby="nature-editions"
    >
      <div className={COLLECTIONS_PAGE_CONTAINER}>
        <div className="max-w-xl">
          <p className="text-[11px] font-normal uppercase tracking-[0.44em] text-neutral-500">
            The Editions
          </p>

          <h2
            id="nature-editions"
            className="mt-5 text-[1.75rem] font-light leading-[1.12] tracking-[-0.02em] sm:text-[2rem]"
          >
            Explore the collection.
          </h2>
        </div>

        {editions.length > 0 ? (
          <div className="mt-12 grid grid-cols-1 gap-12 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-14 lg:mt-16 lg:grid-cols-12 lg:gap-x-10 lg:gap-y-20">
            {editions.map((product, index) => (
              <div
                key={product.slug}
                className={getEditionGridClass(index, editions.length)}
              >
                <NatureEditionCard
                  product={product}
                  aspectClassName={getEditionAspectClass(index)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-16 border border-[#ECE8E2] bg-[#F7F5F1]/70 px-8 py-16 text-center md:px-12 md:py-20">
            <p className="text-xl font-light tracking-[-0.01em] text-[#111111] sm:text-2xl">
              Landscapes are being gathered.
            </p>

            <p className="mx-auto mt-4 max-w-md text-[15px] leading-7 text-neutral-600">
              A new series of Nature editions is currently in development.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

export default function NatureCollectionPage({
  heroImage,
  editions,
}: NatureCollectionPageProps) {
  return (
    <>
      <NatureHero heroImage={heroImage} />
      <NatureIntroduction />
      <NatureEditions editions={editions} />
    </>
  );
}
