import Image from "next/image";
import Link from "next/link";
import { COLLECTIONS_PAGE_CONTAINER } from "@/lib/catalog/collections-page-data";
import { formatEditionLabel, getProductPath } from "@/lib/products-db";
import type { Product } from "@/types/product";

const SKYLINES_HERO_IMAGE = "/images/collections/skylines-clean.png";

const sectionSpacing = "py-10 md:py-14 lg:py-16";
const statementSpacing = "py-12 md:py-14 lg:py-16";

type SkylinesCollectionPageProps = {
  editions: Product[];
};

function getEditionGridClass(index: number, total: number): string {
  if (total === 1) {
    return "col-span-full lg:col-span-10 lg:col-start-2";
  }

  if (total === 2) {
    return "col-span-full lg:col-span-6";
  }

  const patterns = [
    "col-span-full lg:col-span-7",
    "col-span-full lg:col-span-5",
    "col-span-full lg:col-span-6",
    "col-span-full lg:col-span-6",
  ];

  return patterns[index % patterns.length] ?? "col-span-full lg:col-span-6";
}

function getEditionAspectClass(index: number): string {
  return index % 2 === 0 ? "aspect-[16/9]" : "aspect-[5/4]";
}

function SkylinesEditionCard({
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
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 45vw"
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

        {product.subtitle?.trim() ? (
          <p className="mt-2 text-[12px] tracking-[0.06em] text-neutral-500">
            {product.subtitle.trim()}
          </p>
        ) : null}
      </div>
    </Link>
  );
}

function SkylinesOpening() {
  return (
    <section className="border-b border-[#ECE8E2]">
      <div
        className={`${COLLECTIONS_PAGE_CONTAINER} pt-7 pb-10 md:pt-9 md:pb-12 lg:pb-14`}
      >
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#141414] sm:aspect-[2/1] lg:aspect-[21/9]">
          <Image
            src={SKYLINES_HERO_IMAGE}
            alt=""
            fill
            priority
            sizes="(max-width: 768px) 100vw, 1400px"
            className="object-cover object-[38%_50%] sm:object-[34%_50%] lg:object-[30%_50%]"
            aria-hidden
          />

          <div className="absolute inset-0 flex flex-col justify-center px-5 py-11 sm:px-8 md:px-10 md:py-10 lg:px-12">
            <div className="max-w-lg lg:-translate-y-[60px]">
              <p className="text-[13px] font-normal uppercase tracking-[0.4em] text-white/90 sm:text-[11px] sm:tracking-[0.44em]">
                Skylines
              </p>

              <h1 className="mt-5 text-[2.85rem] font-light leading-[1.04] tracking-[-0.02em] text-white sm:mt-5 sm:text-[2.35rem] sm:leading-[1.08] lg:text-[2.65rem] lg:leading-[1.06]">
                Cities reduced
                <br />
                to their essential line.
              </h1>

              <p className="mt-5 max-w-md text-[17px] leading-[1.65] text-white/88 sm:mt-5 sm:text-[15px] sm:leading-8">
                Graphic studies of urban identity, silhouette, rhythm and scale.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SkylinesStatement() {
  return (
    <section className={statementSpacing}>
      <div className={COLLECTIONS_PAGE_CONTAINER}>
        <div className="max-w-2xl lg:max-w-xl">
          <p className="text-[15px] leading-7 text-neutral-600 sm:text-base sm:leading-8">
            Skylines distills the character of a city into form and horizon.
          </p>

          <p className="mt-6 text-[15px] leading-7 text-neutral-600 sm:mt-7 sm:text-base sm:leading-8">
            A collection shaped by architecture, density, distance and the
            unmistakable rhythm of place.
          </p>
        </div>
      </div>
    </section>
  );
}

function SkylinesEditions({ editions }: { editions: Product[] }) {
  return (
    <section
      className={`border-t border-[#ECE8E2] ${sectionSpacing}`}
      aria-labelledby="skylines-editions"
    >
      <div className={COLLECTIONS_PAGE_CONTAINER}>
        <div className="max-w-xl">
          <p className="text-[11px] font-normal uppercase tracking-[0.44em] text-neutral-500">
            The Editions
          </p>

          <h2
            id="skylines-editions"
            className="mt-5 text-[1.75rem] font-light leading-[1.12] tracking-[-0.02em] sm:text-[2rem]"
          >
            Explore the collection.
          </h2>
        </div>

        {editions.length > 0 ? (
          <div className="mt-12 grid grid-cols-1 gap-10 sm:gap-y-12 lg:mt-14 lg:grid-cols-12 lg:gap-x-8 lg:gap-y-14">
            {editions.map((product, index) => (
              <div
                key={product.slug}
                className={getEditionGridClass(index, editions.length)}
              >
                <SkylinesEditionCard
                  product={product}
                  aspectClassName={getEditionAspectClass(index)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-14 border border-[#ECE8E2] bg-[#F7F5F1]/70 px-8 py-14 text-center md:px-12 md:py-16">
            <p className="text-xl font-light tracking-[-0.01em] text-[#111111] sm:text-2xl">
              New horizons are being drawn.
            </p>

            <p className="mx-auto mt-4 max-w-md text-[15px] leading-7 text-neutral-600">
              A new series of Skylines editions is currently in development.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

export default function SkylinesCollectionPage({
  editions,
}: SkylinesCollectionPageProps) {
  return (
    <>
      <SkylinesOpening />
      <SkylinesStatement />
      <SkylinesEditions editions={editions} />
    </>
  );
}
