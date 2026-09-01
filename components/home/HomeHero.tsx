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
    <section className="mx-auto max-w-[1440px] px-6 lg:px-12">
      {/* Desktop: publishing house hero — collection covers ARE the hero */}
      <div className="hidden h-[calc(100svh-4.5rem)] min-h-0 grid-cols-[40fr_60fr] items-start gap-x-10 lg:grid xl:gap-x-12">
        <div className="flex h-full min-h-0 flex-col justify-between pt-1">
          <div>
            <p className="text-[11px] font-normal uppercase tracking-[0.44em] text-neutral-500">
              Levitaeo Editions
            </p>

            <h1 className="mt-4 text-[2.875rem] font-light leading-[1.05] tracking-[-0.03em] xl:text-[3.25rem]">
              Art worth
              <br />
              collecting.
            </h1>

            <p className="mt-6 max-w-[20rem] text-[15px] leading-[1.65] text-neutral-600 xl:max-w-[22rem]">
              A contemporary publishing house for digital editions curated with
              editorial restraint.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/collections"
                className="inline-flex items-center justify-center border border-[#111111] bg-[#111111] px-8 py-3 text-[11px] uppercase tracking-[0.18em] text-white transition-colors duration-300 hover:bg-[#FAFAF8] hover:text-[#111111]"
              >
                Explore Collections
              </Link>
              <Link
                href={latestVolumeHref}
                className="inline-flex items-center justify-center border border-[#111111] bg-transparent px-8 py-3 text-[11px] uppercase tracking-[0.18em] text-[#111111] transition-colors duration-300 hover:bg-[#111111] hover:text-white"
              >
                Latest Volume
              </Link>
            </div>
          </div>

          {featuredEdition ? (
            <div className="pb-1">
              <p className="text-[10px] uppercase tracking-[0.32em] text-neutral-500">
                Featured this week
              </p>
              <Link
                href={featuredEdition.href}
                className="mt-2.5 inline-block text-[13px] tracking-[0.04em] text-[#111111] transition-colors hover:text-neutral-600"
              >
                {featuredEdition.title}
                <span className="ml-2 text-[11px] uppercase tracking-[0.18em] text-neutral-500">
                  Edition {featuredEdition.edition}
                </span>
              </Link>
            </div>
          ) : (
            <div className="pb-1" aria-hidden="true" />
          )}
        </div>

        <div className="grid h-full min-h-0 grid-cols-2 grid-rows-2 gap-0">
          {heroCollections.map((collection) => (
            <HeroCollectionTileLink key={collection.slug} tile={collection} />
          ))}
        </div>
      </div>

      {/* Mobile fallback */}
      <div className="flex flex-col gap-8 py-8 lg:hidden">
        <div>
          <p className="text-[11px] font-normal uppercase tracking-[0.44em] text-neutral-500">
            Levitaeo Editions
          </p>
          <h1 className="mt-4 text-[2.25rem] font-light leading-[1.06] tracking-[-0.03em]">
            Art worth
            <br />
            collecting.
          </h1>
          <p className="mt-6 max-w-[22rem] text-[15px] leading-[1.65] text-neutral-600">
            A contemporary publishing house for digital editions curated with
            editorial restraint.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/collections"
              className="inline-flex items-center justify-center border border-[#111111] bg-[#111111] px-8 py-3 text-[11px] uppercase tracking-[0.18em] text-white"
            >
              Explore Collections
            </Link>
            <Link
              href={latestVolumeHref}
              className="inline-flex items-center justify-center border border-[#111111] bg-transparent px-8 py-3 text-[11px] uppercase tracking-[0.18em] text-[#111111]"
            >
              Latest Volume
            </Link>
          </div>
          {featuredEdition ? (
            <div className="mt-8">
              <p className="text-[10px] uppercase tracking-[0.32em] text-neutral-500">
                Featured this week
              </p>
              <Link
                href={featuredEdition.href}
                className="mt-2.5 inline-block text-[13px] text-[#111111]"
              >
                {featuredEdition.title}
              </Link>
            </div>
          ) : null}
        </div>
        <div className="grid grid-cols-2 gap-0">
          {heroCollections.map((collection) => (
            <div key={collection.slug} className="relative aspect-[4/5]">
              <HeroCollectionTileLink tile={collection} />
            </div>
          ))}
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
      className="group relative block h-full min-h-0 overflow-hidden bg-neutral-300"
    >
      <Image
        src={tile.image}
        alt={`${tile.title} collection`}
        fill
        priority
        sizes="(max-width: 1024px) 50vw, 30vw"
        className="object-cover transition-transform duration-[800ms] ease-out group-hover:scale-[1.02]"
      />

      <div
        className="absolute inset-0 bg-black/0 transition-colors duration-[800ms] ease-out group-hover:bg-black/10"
        aria-hidden="true"
      />

      <div className="absolute inset-x-0 bottom-0 px-4 pb-4">
        <p className="text-[11px] font-normal uppercase tracking-[0.3em] text-white xl:text-[12px]">
          {tile.title}
        </p>
      </div>
    </Link>
  );
}
