import Image from "next/image";
import Link from "next/link";
import { COLLECTIONS_PAGE_CONTAINER } from "@/lib/catalog/collections-page-data";
import { formatEditionLabel, getProductPath } from "@/lib/products-db";
import type { Product } from "@/types/product";

const sectionSpacing = "py-10 md:py-14 lg:py-16";
const statementSpacing = "py-14 md:py-16 lg:py-24";

type BotanicalCollectionPageProps = {
  heroImage: string;
  editions: Product[];
};

function getEditionGridClass(index: number, total: number): string {
  if (total === 1) {
    return "col-span-full sm:max-w-sm sm:mx-auto lg:max-w-none lg:col-span-4 lg:col-start-5";
  }

  if (total === 2) {
    return "col-span-full sm:col-span-1 lg:col-span-5";
  }

  const patterns = [
    "col-span-full sm:col-span-1 lg:col-span-5",
    "col-span-full sm:col-span-1 lg:col-span-4 lg:col-start-8",
    "col-span-full sm:col-span-1 lg:col-span-4",
    "col-span-full sm:col-span-1 lg:col-span-5 lg:col-start-7",
  ];

  return patterns[index % patterns.length] ?? "col-span-full lg:col-span-5";
}

function getEditionAspectClass(index: number): string {
  return index % 3 === 0 ? "aspect-[3/4]" : "aspect-[4/5]";
}

function BotanicalEditionCard({
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
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 40vw, 28vw"
          className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.015]"
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

function BotanicalOpening({ heroImage }: { heroImage: string }) {
  return (
    <section className="border-b border-[#ECE8E2]">
      <div className={`${COLLECTIONS_PAGE_CONTAINER} pt-7 pb-12 md:pt-9 md:pb-14 lg:pb-16`}>
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-x-14 xl:gap-x-20">
          <div className="max-w-xl lg:py-4">
            <p className="text-[11px] font-normal uppercase tracking-[0.44em] text-neutral-500">
              Botanical
            </p>

            <h1 className="mt-5 text-[2.25rem] font-light leading-[1.1] tracking-[-0.02em] sm:text-[2.5rem] lg:text-[2.85rem] lg:leading-[1.08]">
              Studies in form,
              <br />
              texture and growth.
            </h1>

            <p className="mt-5 text-[15px] leading-7 text-neutral-600 sm:text-base sm:leading-8">
              Botanical compositions shaped by line, repetition, fragility and
              organic structure.
            </p>
          </div>

          <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#F5F3EF] sm:aspect-[5/6] lg:aspect-[4/5] lg:max-w-[520px] lg:justify-self-end">
            <Image
              src={heroImage}
              alt="Botanical collection"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 520px"
              className="object-cover object-center"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function BotanicalStatement() {
  return (
    <section className={statementSpacing}>
      <div className={COLLECTIONS_PAGE_CONTAINER}>
        <div className="max-w-xl lg:max-w-2xl">
          <p className="text-[15px] leading-7 text-neutral-600 sm:text-base sm:leading-8">
            Botanical examines nature at a more intimate scale.
          </p>

          <p className="mt-6 text-[15px] leading-7 text-neutral-600 sm:mt-8 sm:text-base sm:leading-8">
            A study of leaves, stems, rhythm and organic form — reduced to
            composition, texture and light.
          </p>
        </div>
      </div>
    </section>
  );
}

function BotanicalEditions({ editions }: { editions: Product[] }) {
  return (
    <section
      className={`border-t border-[#ECE8E2] ${sectionSpacing}`}
      aria-labelledby="botanical-editions"
    >
      <div className={COLLECTIONS_PAGE_CONTAINER}>
        <div className="max-w-xl">
          <p className="text-[11px] font-normal uppercase tracking-[0.44em] text-neutral-500">
            The Editions
          </p>

          <h2
            id="botanical-editions"
            className="mt-5 text-[1.75rem] font-light leading-[1.12] tracking-[-0.02em] sm:text-[2rem]"
          >
            Explore the collection.
          </h2>
        </div>

        {editions.length > 0 ? (
          <div className="mt-12 grid grid-cols-1 gap-12 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-14 lg:mt-16 lg:grid-cols-12 lg:gap-x-10 lg:gap-y-16">
            {editions.map((product, index) => (
              <div
                key={product.slug}
                className={getEditionGridClass(index, editions.length)}
              >
                <BotanicalEditionCard
                  product={product}
                  aspectClassName={getEditionAspectClass(index)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-16 border border-[#ECE8E2] bg-[#F7F5F1]/70 px-8 py-16 text-center md:px-12 md:py-20">
            <p className="text-xl font-light tracking-[-0.01em] text-[#111111] sm:text-2xl">
              New forms are taking root.
            </p>

            <p className="mx-auto mt-4 max-w-md text-[15px] leading-7 text-neutral-600">
              A new series of Botanical editions is currently in development.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

export default function BotanicalCollectionPage({
  heroImage,
  editions,
}: BotanicalCollectionPageProps) {
  return (
    <>
      <BotanicalOpening heroImage={heroImage} />
      <BotanicalStatement />
      <BotanicalEditions editions={editions} />
    </>
  );
}
