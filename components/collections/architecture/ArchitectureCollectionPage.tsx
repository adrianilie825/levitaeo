import Image from "next/image";
import Link from "next/link";
import { COLLECTIONS_PAGE_CONTAINER } from "@/lib/catalog/collections-page-data";
import { formatEditionLabel, getProductPath } from "@/lib/products-db";
import type { Product } from "@/types/product";

const sectionSpacing = "py-10 md:py-14 lg:py-16";

type ArchitectureCollectionPageProps = {
  heroImage: string;
  editions: Product[];
};

function getEditionGridClass(index: number, total: number): string {
  if (total === 1) {
    return "col-span-full lg:col-span-6 lg:col-start-4";
  }

  if (total === 2) {
    return index === 0
      ? "col-span-full lg:col-span-7"
      : "col-span-full lg:col-span-5";
  }

  const patterns = [
    "col-span-full lg:col-span-7",
    "col-span-full lg:col-span-5",
    "col-span-full sm:col-span-1 lg:col-span-6",
    "col-span-full sm:col-span-1 lg:col-span-6",
  ];

  return patterns[index % patterns.length] ?? "col-span-full lg:col-span-6";
}

function getEditionAspectClass(index: number): string {
  return index % 2 === 0 ? "aspect-[5/4]" : "aspect-[4/5]";
}

function ArchitectureEditionCard({
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
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
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

function ArchitectureHero({ heroImage }: { heroImage: string }) {
  return (
    <section className="border-b border-[#ECE8E2]">
      <div className={`${COLLECTIONS_PAGE_CONTAINER} pt-7 pb-10 md:pt-9 md:pb-12 lg:pb-14`}>
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#F5F3EF] sm:aspect-[16/9]">
          <Image
            src={heroImage}
            alt="Architecture collection"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 1400px"
            className="object-cover"
          />
        </div>

        <div className="mt-8 max-w-2xl md:mt-10 lg:mt-12">
          <p className="text-[11px] font-normal uppercase tracking-[0.44em] text-neutral-500">
            Architecture
          </p>

          <h1 className="mt-5 text-[2.25rem] font-light leading-[1.08] tracking-[-0.02em] sm:text-[2.5rem] lg:text-[3rem] lg:leading-[1.06]">
            Form, structure,
            <br />
            and the spaces between.
          </h1>

          <p className="mt-5 max-w-xl text-[15px] leading-7 text-neutral-600 sm:text-base sm:leading-8">
            Architectural studies shaped by geometry, proportion, material and
            light.
          </p>
        </div>
      </div>
    </section>
  );
}

function ArchitectureIntroduction() {
  return (
    <section className={`border-b border-[#ECE8E2] ${sectionSpacing}`}>
      <div className={COLLECTIONS_PAGE_CONTAINER}>
        <div className="max-w-2xl">
          <p className="text-[15px] leading-7 text-neutral-600 sm:text-base sm:leading-8">
            Architecture explores the relationship between structure and
            silence.
          </p>

          <p className="mt-5 text-[15px] leading-7 text-neutral-600 sm:text-base sm:leading-8">
            A curated series of architectural compositions where geometry,
            material and light become the subject.
          </p>
        </div>
      </div>
    </section>
  );
}

function ArchitectureEditions({ editions }: { editions: Product[] }) {
  return (
    <section className={sectionSpacing} aria-labelledby="architecture-editions">
      <div className={COLLECTIONS_PAGE_CONTAINER}>
        <div className="max-w-xl">
          <p className="text-[11px] font-normal uppercase tracking-[0.44em] text-neutral-500">
            The Editions
          </p>

          <h2
            id="architecture-editions"
            className="mt-5 text-[1.75rem] font-light leading-[1.12] tracking-[-0.02em] sm:text-[2rem]"
          >
            Explore the collection.
          </h2>
        </div>

        {editions.length > 0 ? (
          <div className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-12 lg:mt-14 lg:grid-cols-12 lg:gap-x-8 lg:gap-y-16">
            {editions.map((product, index) => (
              <div
                key={product.slug}
                className={getEditionGridClass(index, editions.length)}
              >
                <ArchitectureEditionCard
                  product={product}
                  aspectClassName={getEditionAspectClass(index)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-14 border border-[#ECE8E2] bg-[#F7F5F1]/70 px-8 py-16 text-center md:px-12 md:py-20">
            <p className="text-xl font-light tracking-[-0.01em] text-[#111111] sm:text-2xl">
              Architectural studies are being curated.
            </p>

            <p className="mx-auto mt-4 max-w-md text-[15px] leading-7 text-neutral-600">
              A new series of compositions is currently in development.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

export default function ArchitectureCollectionPage({
  heroImage,
  editions,
}: ArchitectureCollectionPageProps) {
  return (
    <>
      <ArchitectureHero heroImage={heroImage} />
      <ArchitectureIntroduction />
      <ArchitectureEditions editions={editions} />
    </>
  );
}
