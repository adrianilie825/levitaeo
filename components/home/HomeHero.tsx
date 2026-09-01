import Image from "next/image";
import Link from "next/link";
import type {
  HeroCollectionTile,
  HeroFeaturedEdition,
} from "@/lib/home/homepage-types";

type HomeHeroProps = {
  latestVolumeHref: string;
  heroCollections: HeroCollectionTile[];
  featuredEdition?: HeroFeaturedEdition | null;
};

export default function HomeHero({
  latestVolumeHref,
  heroCollections,
  featuredEdition,
}: HomeHeroProps) {
  return (
    <section
      aria-label="Levitaeo publishing house"
      className="w-full border-b border-[#ECE8E2] bg-[#FAFAF8]"
    >
      <div className="mx-auto h-[calc(100dvh-4.5rem-1px)] max-h-[calc(100vh-4.5rem-1px)] max-w-[1440px] px-6 md:px-8 lg:px-10">
        <div className="flex h-full min-h-0 flex-col justify-center gap-8 py-6 md:grid md:grid-cols-[42fr_58fr] md:items-stretch md:gap-x-8 md:py-0 lg:grid-cols-[2fr_3fr] lg:gap-x-10">
          <EditorialColumn
            latestVolumeHref={latestVolumeHref}
            featuredEdition={featuredEdition}
          />

          <CollectionGrid tiles={heroCollections} className="md:h-full" />
        </div>
      </div>
    </section>
  );
}

function EditorialColumn({
  latestVolumeHref,
  featuredEdition,
}: {
  latestVolumeHref: string;
  featuredEdition?: HeroFeaturedEdition | null;
}) {
  return (
    <div className="flex min-h-0 items-center md:h-full">
      <div className="w-full max-w-[460px]">
        <p className="text-[11px] font-normal uppercase tracking-[0.44em] text-neutral-500">
          Levitaeo Editions
        </p>

        <h1 className="mt-5 text-[2.75rem] font-normal leading-[1.04] tracking-[-0.03em] md:text-[4rem] lg:text-[4.5rem] xl:text-[5rem]">
          Art worth
          <br />
          collecting.
        </h1>

        <p className="mt-6 max-w-[460px] text-[16px] leading-[1.65] text-neutral-600 md:mt-7 md:text-[17px] md:leading-[1.7]">
          A contemporary publishing house for digital editions — curated with
          editorial restraint and made to live beautifully on your walls.
        </p>

        <div className="mt-7 flex flex-wrap items-center gap-3 md:mt-8">
          <Link
            href="/collections"
            className="inline-flex items-center justify-center border border-[#111111] bg-[#111111] px-8 py-3.5 text-[11px] uppercase tracking-[0.18em] text-white transition-colors hover:bg-[#FAFAF8] hover:text-[#111111]"
          >
            Explore Collections
          </Link>
          <Link
            href={latestVolumeHref}
            className="inline-flex items-center justify-center border border-[#111111] bg-transparent px-8 py-3.5 text-[11px] uppercase tracking-[0.18em] text-[#111111] transition-colors hover:bg-[#111111] hover:text-white"
          >
            Latest Volume
          </Link>
        </div>

        {featuredEdition ? (
          <div className="mt-8 md:mt-9">
            <p className="text-[10px] uppercase tracking-[0.32em] text-neutral-500">
              Featured this week
            </p>
            <Link
              href={featuredEdition.href}
              className="mt-3 inline-block text-[14px] tracking-[0.02em] text-[#111111] transition-colors hover:text-neutral-600"
            >
              {featuredEdition.title}
              <span className="text-neutral-400"> · </span>
              <span className="text-neutral-600">
                Edition {featuredEdition.edition}
              </span>
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function CollectionGrid({
  tiles,
  className = "",
}: {
  tiles: HeroCollectionTile[];
  className?: string;
}) {
  return (
    <div className={`min-h-0 ${className}`}>
      <div className="grid h-[min(42vh,380px)] grid-cols-2 grid-rows-2 gap-[2px] md:h-full md:min-h-0">
        {tiles.map((tile) => (
          <CollectionTile key={tile.slug} tile={tile} />
        ))}
      </div>
    </div>
  );
}

function CollectionTile({ tile }: { tile: HeroCollectionTile }) {
  return (
    <Link
      href={tile.href}
      aria-label={`Explore ${tile.title} collection`}
      className="group relative block h-full min-h-0 overflow-hidden"
    >
      <Image
        src={tile.image}
        alt={`${tile.title} collection cover`}
        fill
        priority
        sizes="(max-width: 768px) 50vw, 30vw"
        className="object-cover transition-transform duration-[700ms] ease-out group-hover:scale-[1.02]"
      />

      <div
        className="absolute inset-0 bg-black/0 transition-colors duration-[700ms] ease-out group-hover:bg-black/10"
        aria-hidden="true"
      />

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 via-black/20 to-transparent px-3 pb-3 pt-12 sm:px-4 sm:pb-4">
        <p className="text-[11px] font-normal uppercase tracking-[0.28em] text-white sm:text-[12px]">
          {tile.title}
        </p>
        <p className="mt-1.5 text-[10px] uppercase tracking-[0.2em] text-white/90 sm:text-[11px]">
          Explore →
        </p>
      </div>
    </Link>
  );
}
