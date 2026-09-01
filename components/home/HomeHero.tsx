import Image from "next/image";
import Link from "next/link";
import type { HeroCollectionTile } from "@/lib/home/homepage-data";

type HeroFeaturedEdition = {
  title: string;
  href: string;
  edition: string;
};

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
    <section className="mx-auto max-w-[1400px] px-6 lg:px-12">
      <div className="flex min-h-[calc(100svh-4.5rem)] flex-col gap-8 py-6 md:grid md:grid-cols-[42fr_58fr] md:items-stretch md:gap-x-6 md:py-4 lg:gap-x-8 xl:gap-x-10">
        <div className="flex h-full min-h-0 flex-col justify-center md:justify-between md:py-2">
          <div>
            <p className="text-[10px] font-normal uppercase tracking-[0.44em] text-neutral-500 sm:text-[11px]">
              Levitaeo Editions
            </p>

            <h1 className="mt-4 text-[2rem] font-light leading-[1.06] tracking-[-0.03em] sm:text-[2.5rem] lg:mt-5 lg:text-[3.25rem] xl:text-[3.75rem]">
              Art worth
              <br />
              collecting.
            </h1>

            <p className="mt-6 max-w-[20rem] text-[14px] leading-[1.65] text-neutral-600 sm:max-w-[22rem] sm:text-[15px] sm:leading-[1.7] lg:mt-8 lg:max-w-[24rem] lg:text-[16px]">
              A contemporary publishing house for digital editions — curated with
              editorial restraint and made to live beautifully on your walls.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:items-center lg:mt-10">
              <Link
                href="/collections"
                className="inline-flex items-center justify-center border border-[#111111] bg-[#111111] px-8 py-3 text-[10px] uppercase tracking-[0.18em] text-white transition-colors duration-300 hover:bg-[#FAFAF8] hover:text-[#111111] sm:px-9 sm:py-3.5 sm:text-[11px]"
              >
                Explore Collections
              </Link>
              <Link
                href={latestVolumeHref}
                className="inline-flex items-center justify-center border border-[#111111] bg-transparent px-8 py-3 text-[10px] uppercase tracking-[0.18em] text-[#111111] transition-colors duration-300 hover:bg-[#111111] hover:text-white sm:px-9 sm:py-3.5 sm:text-[11px]"
              >
                Latest Volume
              </Link>
            </div>
          </div>

          {featuredEdition ? (
            <div className="mt-10 md:mt-0">
              <p className="text-[10px] uppercase tracking-[0.32em] text-neutral-500">
                Featured this week
              </p>
              <Link
                href={featuredEdition.href}
                className="mt-3 inline-block text-[13px] tracking-[0.04em] text-[#111111] transition-colors hover:text-neutral-600"
              >
                {featuredEdition.title}
                <span className="ml-2 text-[11px] uppercase tracking-[0.18em] text-neutral-500">
                  Edition {featuredEdition.edition}
                </span>
              </Link>
            </div>
          ) : null}
        </div>

        <div className="flex min-h-0 flex-1 items-stretch lg:h-full lg:min-h-0">
          <div className="grid h-[min(52vh,420px)] w-full min-h-0 grid-cols-2 grid-rows-2 gap-[2px] sm:h-[min(56vh,480px)] md:h-full md:max-h-[calc(100svh-5.5rem)]">
            {heroCollections.map((collection) => (
              <HeroCollectionTileLink key={collection.slug} tile={collection} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroCollectionTileLink({ tile }: { tile: HeroCollectionTile }) {
  return (
    <Link
      href={tile.href}
      aria-label={`Explore ${tile.title} collection`}
      className="group relative block min-h-0 overflow-hidden bg-neutral-200"
    >
      <Image
        src={tile.image}
        alt={`${tile.title} collection`}
        fill
        priority
        sizes="(max-width: 1024px) 50vw, 29vw"
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
      />

      <div className="absolute inset-x-0 bottom-0 px-3 pb-3 pt-8 sm:px-4 sm:pb-4">
        <p className="text-[11px] font-normal uppercase tracking-[0.28em] text-white sm:text-[12px]">
          {tile.title}
        </p>
        <p className="mt-1.5 text-[10px] uppercase tracking-[0.2em] text-white/85 transition-transform duration-500 group-hover:translate-x-0.5 sm:text-[11px]">
          Explore →
        </p>
      </div>
    </Link>
  );
}
