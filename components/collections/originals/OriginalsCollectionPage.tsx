import Image from "next/image";
import Link from "next/link";
import { COLLECTIONS_PAGE_CONTAINER } from "@/lib/catalog/collections-page-data";
import { formatEditionLabel, getProductPath } from "@/lib/products-db";
import type { Product } from "@/types/product";

const sectionSpacing = "py-10 md:py-14 lg:py-16";
const statementSpacing = "py-12 md:py-14 lg:py-16";

type OriginalsCollectionPageProps = {
  heroImage: string;
  editions: Product[];
};

function getEditionAvailabilityLine(product: Product): string | null {
  if (product.status !== "coming-soon") {
    return null;
  }

  const text = product.availabilityText?.trim();
  return text || "Coming soon";
}

function getGalleryWidthClass(index: number, total: number): string {
  if (total === 1) {
    return "mx-auto w-full max-w-2xl";
  }

  if (total === 2) {
    return index === 0
      ? "w-full lg:max-w-[58%]"
      : "w-full lg:ml-auto lg:max-w-[58%]";
  }

  const patterns = [
    "w-full lg:max-w-[72%]",
    "w-full lg:ml-auto lg:max-w-[58%]",
    "w-full lg:max-w-[64%]",
  ];

  return patterns[index % patterns.length] ?? "w-full lg:max-w-[68%]";
}

function OriginalsEditionEntry({
  product,
  widthClassName,
}: {
  product: Product;
  widthClassName: string;
}) {
  const href = getProductPath(product);
  const availabilityLine = getEditionAvailabilityLine(product);

  return (
    <article className={widthClassName}>
      <Link
        href={href}
        aria-label={`View ${product.title}`}
        className="group block"
      >
        <div className="relative aspect-[3/2] w-full overflow-hidden bg-[#F5F3EF] sm:aspect-[4/3]">
          <Image
            src={product.image}
            alt={product.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 72vw, 960px"
            className="object-cover transition-opacity duration-700 ease-out group-hover:opacity-95"
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

          {availabilityLine ? (
            <p className="mt-2 text-[12px] tracking-[0.06em] text-neutral-500">
              {availabilityLine}
            </p>
          ) : null}
        </div>
      </Link>
    </article>
  );
}

function OriginalsOpening({ heroImage }: { heroImage: string }) {
  return (
    <section className="border-b border-[#ECE8E2]">
      <div
        className={`${COLLECTIONS_PAGE_CONTAINER} pt-10 pb-12 md:pt-14 md:pb-16 lg:pt-16 lg:pb-20`}
      >
        <div className="lg:grid lg:grid-cols-12 lg:items-end lg:gap-x-12 xl:gap-x-16">
          <div className="lg:col-span-7 xl:col-span-6">
            <p className="text-[11px] font-normal uppercase tracking-[0.44em] text-neutral-500">
              Originals
            </p>

            <h1 className="mt-6 text-[2.35rem] font-light leading-[1.1] tracking-[-0.02em] sm:text-[2.65rem] lg:mt-7 lg:text-[3rem] lg:leading-[1.08]">
              Made once.
              <br />
              Collected with intention.
            </h1>

            <p className="mt-6 max-w-md text-[15px] leading-7 text-neutral-600 sm:text-base sm:leading-8 lg:mt-7">
              Limited digital editions created as individual works rather than
              recurring series.
            </p>
          </div>

          <div className="mt-10 lg:col-span-4 lg:col-start-9 lg:mt-0">
            <div className="relative aspect-[3/4] w-full max-w-[240px] overflow-hidden bg-[#F5F3EF] sm:max-w-[280px] lg:ml-auto lg:max-w-none">
              <Image
                src={heroImage}
                alt="Originals collection"
                fill
                priority
                sizes="(max-width: 1024px) 280px, 320px"
                className="object-cover object-center"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function OriginalsStatement() {
  return (
    <section className={statementSpacing}>
      <div className={COLLECTIONS_PAGE_CONTAINER}>
        <div className="max-w-2xl lg:max-w-xl">
          <p className="text-[15px] leading-7 text-neutral-600 sm:text-base sm:leading-8">
            Originals is where Levitaeo becomes most personal.
          </p>

          <p className="mt-6 text-[15px] leading-7 text-neutral-600 sm:mt-7 sm:text-base sm:leading-8">
            Independent works released in limited editions, each with its own
            identity, number and place within the collection.
          </p>
        </div>
      </div>
    </section>
  );
}

function OriginalsGallery({ editions }: { editions: Product[] }) {
  return (
    <section
      className={`border-t border-[#ECE8E2] ${sectionSpacing}`}
      aria-labelledby="originals-gallery"
    >
      <div className={COLLECTIONS_PAGE_CONTAINER}>
        <div className="max-w-xl">
          <p className="text-[11px] font-normal uppercase tracking-[0.44em] text-neutral-500">
            The Originals
          </p>

          <h2
            id="originals-gallery"
            className="mt-5 text-[1.75rem] font-light leading-[1.12] tracking-[-0.02em] sm:text-[2rem]"
          >
            Limited editions.
          </h2>
        </div>

        {editions.length > 0 ? (
          <div className="mt-12 flex flex-col gap-14 sm:gap-16 lg:mt-16 lg:gap-20">
            {editions.map((product, index) => (
              <OriginalsEditionEntry
                key={product.slug}
                product={product}
                widthClassName={getGalleryWidthClass(index, editions.length)}
              />
            ))}
          </div>
        ) : (
          <div className="mt-14 border border-[#ECE8E2] bg-[#F7F5F1]/70 px-8 py-14 text-center md:px-12 md:py-16">
            <p className="text-xl font-light tracking-[-0.01em] text-[#111111] sm:text-2xl">
              New originals are being prepared.
            </p>

            <p className="mx-auto mt-4 max-w-md text-[15px] leading-7 text-neutral-600">
              A new series of limited editions is currently in development.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

export default function OriginalsCollectionPage({
  heroImage,
  editions,
}: OriginalsCollectionPageProps) {
  return (
    <>
      <OriginalsOpening heroImage={heroImage} />
      <OriginalsStatement />
      <OriginalsGallery editions={editions} />
    </>
  );
}
