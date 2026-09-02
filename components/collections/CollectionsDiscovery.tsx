import Image from "next/image";
import Link from "next/link";
import {
  COLLECTIONS_PAGE_CONTAINER,
  type CollectionsDiscoveryItem,
  type OriginalsGalleryEdition,
} from "@/lib/catalog/collections-page-data";

type CollectionsDiscoveryProps = {
  collections: CollectionsDiscoveryItem[];
  originalsGallery: OriginalsGalleryEdition[];
};

const sectionSpacing = "py-10 md:py-14 lg:py-16";

/** Tighter vertical rhythm for the first viewport only (intro + Architecture). */
const introSpacing = "pt-7 pb-5 md:pt-9 md:pb-6 lg:pt-9 lg:pb-6";
const architectureSectionSpacing =
  "pt-4 pb-10 md:pt-5 md:pb-14 lg:pt-5 lg:pb-16";

function ExploreArrow({ label = "EXPLORE →" }: { label?: string }) {
  return (
    <span className="mt-4 inline-block text-[10px] uppercase tracking-[0.22em] text-white transition-transform duration-500 group-hover:translate-x-1">
      {label}
    </span>
  );
}

function SectionIndexLabel({
  index,
  title,
  className = "text-white",
}: {
  index: string;
  title: string;
  className?: string;
}) {
  return (
    <p
      className={`text-[10px] uppercase tracking-[0.34em] ${className}`}
    >
      {index} — {title}
    </p>
  );
}

function CollectionsIntro() {
  return (
    <section className={`border-b border-[#ECE8E2] ${introSpacing}`}>
      <div className={COLLECTIONS_PAGE_CONTAINER}>
        <p className="text-[11px] font-normal uppercase tracking-[0.44em] text-neutral-500">
          Collections
        </p>

        <h1 className="mt-5 max-w-2xl text-[2.25rem] font-light leading-[1.1] tracking-[-0.02em] sm:text-[2.5rem] lg:text-[2.75rem]">
          Six perspectives.
          <br />
          One considered collection.
        </h1>

        <p className="mt-5 max-w-xl text-[15px] leading-7 text-neutral-600 sm:text-base sm:leading-8">
          Explore Levitaeo through architecture, nature, botanical studies,
          minimal compositions, city skylines and limited originals.
        </p>
      </div>
    </section>
  );
}

function ArchitectureSection({ collection }: { collection: CollectionsDiscoveryItem }) {
  return (
    <section className={architectureSectionSpacing}>
      <div className={COLLECTIONS_PAGE_CONTAINER}>
        <Link
          href={collection.href}
          aria-label={`Explore ${collection.title} collection`}
          className="group block w-full overflow-hidden"
        >
          <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#F5F3EF] sm:aspect-[16/9]">
            <Image
              src={collection.discoveryImage}
              alt={`${collection.title} collection`}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 1400px"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
            />

            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 md:p-10">
              <SectionIndexLabel index={collection.index} title="Architecture" />
              <p className="mt-3 max-w-md text-[15px] leading-7 text-white/90 sm:text-base sm:leading-8">
                Form, structure and the spaces between.
              </p>
              <ExploreArrow />
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
}

function DualCollectionTile({
  collection,
  tagline,
}: {
  collection: CollectionsDiscoveryItem;
  tagline: string;
}) {
  return (
    <Link
      href={collection.href}
      aria-label={`Explore ${collection.title} collection`}
      className="group relative block h-full min-h-[280px] overflow-hidden bg-[#F5F3EF] sm:min-h-[360px] md:min-h-0 md:aspect-[4/5]"
    >
      <Image
        src={collection.discoveryImage}
        alt={`${collection.title} collection`}
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
      />

      <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 md:p-8">
        <SectionIndexLabel index={collection.index} title={collection.title} />
        <p className="mt-2 max-w-xs text-[13px] leading-6 text-white/85 sm:text-[14px] sm:leading-7">
          {tagline}
        </p>
        <ExploreArrow />
      </div>
    </Link>
  );
}

function NatureBotanicalSection({
  nature,
  botanical,
}: {
  nature: CollectionsDiscoveryItem;
  botanical: CollectionsDiscoveryItem;
}) {
  return (
    <section className={sectionSpacing}>
      <div className={COLLECTIONS_PAGE_CONTAINER}>
        <div className="grid grid-cols-1 gap-[2px] md:grid-cols-2 md:items-stretch">
          <DualCollectionTile
            collection={nature}
            tagline="Quiet landscapes shaped by light, texture, and natural rhythm."
          />
          <DualCollectionTile
            collection={botanical}
            tagline="Quiet studies of flora, texture, and organic silhouette."
          />
        </div>
      </div>
    </section>
  );
}

function MinimalSection({ collection }: { collection: CollectionsDiscoveryItem }) {
  return (
    <section className={`border-y border-[#ECE8E2] ${sectionSpacing}`}>
      <div className={COLLECTIONS_PAGE_CONTAINER}>
        <div className="grid items-center gap-8 lg:grid-cols-[3fr_2fr] lg:gap-x-12 xl:gap-x-16">
          <Link
            href={collection.href}
            aria-label={`Explore ${collection.title} collection`}
            className="group block overflow-hidden"
          >
            <div className="relative aspect-[5/4] w-full overflow-hidden bg-[#F5F3EF] lg:aspect-[4/3]">
              <Image
                src={collection.discoveryImage}
                alt={`${collection.title} collection`}
                fill
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
              />
            </div>
          </Link>

          <div className="flex flex-col justify-center lg:py-4">
            <SectionIndexLabel
              index={collection.index}
              title="Minimal"
              className="text-neutral-500"
            />

            <h2 className="mt-4 text-[1.75rem] font-light leading-[1.12] tracking-[-0.02em] sm:text-[2rem] lg:text-[2.25rem]">
              Reduction as a form of expression.
            </h2>

            <p className="mt-5 max-w-md text-[15px] leading-7 text-neutral-600 sm:text-base sm:leading-8">
              A study of proportion, material, shadow and silence.
            </p>

            <Link
              href={collection.href}
              className="mt-8 inline-block text-[10px] uppercase tracking-[0.22em] text-[#111111] transition-transform duration-500 hover:translate-x-1"
            >
              Explore Minimal →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function SkylinesSection({ collection }: { collection: CollectionsDiscoveryItem }) {
  return (
    <section className={sectionSpacing}>
      <div className={COLLECTIONS_PAGE_CONTAINER}>
        <Link
          href={collection.href}
          aria-label={`Explore ${collection.title} collection`}
          className="group block w-full overflow-hidden"
        >
          <Image
            src={collection.discoveryImage}
            alt="Skylines collection — architectural city studies"
            width={1672}
            height={941}
            sizes="(max-width: 768px) 100vw, 1400px"
            className="h-auto w-full object-contain object-center transition-opacity duration-700 group-hover:opacity-95"
          />
        </Link>
      </div>
    </section>
  );
}

function OriginalsSection({
  collection,
  gallery,
}: {
  collection: CollectionsDiscoveryItem;
  gallery: OriginalsGalleryEdition[];
}) {
  return (
    <section className={`border-t border-[#ECE8E2] ${sectionSpacing}`}>
      <div className={COLLECTIONS_PAGE_CONTAINER}>
        <div className="max-w-2xl">
          <SectionIndexLabel
            index={collection.index}
            title="Originals"
            className="text-neutral-500"
          />

          <h2 className="mt-4 text-[1.75rem] font-light leading-[1.12] tracking-[-0.02em] sm:text-[2rem] lg:text-[2.25rem]">
            Limited by design.
          </h2>

          <p className="mt-5 text-[15px] leading-7 text-neutral-600 sm:text-base sm:leading-8">
            Independent digital editions released in intentionally limited
            quantities.
          </p>

          <p className="mt-4 text-[10px] uppercase tracking-[0.28em] text-neutral-500">
            Numbered digital editions · Limited availability
          </p>
        </div>

        {gallery.length > 0 ? (
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-5 md:mt-12 md:gap-6">
            {gallery.map((edition) => (
              <Link
                key={edition.slug}
                href={edition.href}
                aria-label={`View ${edition.title}`}
                className="group block"
              >
                <div className="relative aspect-[4/5] overflow-hidden border border-[#E8E4DE] bg-[#F5F3EF]">
                  <Image
                    src={edition.image}
                    alt={edition.title}
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                  />
                </div>

                <p className="mt-3 text-[10px] uppercase tracking-[0.24em] text-neutral-500">
                  Edition {edition.edition}
                </p>
                <p className="mt-1.5 text-base font-light tracking-[-0.01em] text-[#111111] sm:text-lg">
                  {edition.title}
                </p>
              </Link>
            ))}
          </div>
        ) : null}

        <Link
          href={collection.href}
          className="mt-10 inline-block text-[10px] uppercase tracking-[0.22em] text-[#111111] transition-transform duration-500 hover:translate-x-1 md:mt-12"
        >
          Explore Originals →
        </Link>
      </div>
    </section>
  );
}

export default function CollectionsDiscovery({
  collections,
  originalsGallery,
}: CollectionsDiscoveryProps) {
  const architecture = collections.find((item) => item.slug === "architecture");
  const nature = collections.find((item) => item.slug === "nature");
  const botanical = collections.find((item) => item.slug === "botanical");
  const minimal = collections.find((item) => item.slug === "minimal");
  const skylines = collections.find((item) => item.slug === "skylines");
  const originals = collections.find((item) => item.slug === "originals");

  return (
    <>
      <CollectionsIntro />

      {architecture ? <ArchitectureSection collection={architecture} /> : null}

      {nature && botanical ? (
        <NatureBotanicalSection nature={nature} botanical={botanical} />
      ) : null}

      {minimal ? <MinimalSection collection={minimal} /> : null}

      {skylines ? <SkylinesSection collection={skylines} /> : null}

      {originals ? (
        <OriginalsSection collection={originals} gallery={originalsGallery} />
      ) : null}
    </>
  );
}
