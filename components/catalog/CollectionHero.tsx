import Image from "next/image";
import type { Collection } from "@/types/collection";

type CollectionHeroProps = {
  collection: Collection;
  volumeCount: number;
  editionCount: number;
};

function formatCount(count: number, singular: string, plural: string): string {
  return count === 1 ? `1 ${singular}` : `${count} ${plural}`;
}

export default function CollectionHero({
  collection,
  volumeCount,
  editionCount,
}: CollectionHeroProps) {
  return (
    <>
      <section className="relative w-full border-b border-[#ECE8E2]">
        <div className="relative aspect-[16/9] w-full max-h-[min(72vh,720px)] overflow-hidden bg-[#F7F5F1]">
          <Image
            src={collection.image}
            alt={`Levitaeo ${collection.title} collection`}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/5 to-transparent" />
        </div>
      </section>

      <section className="border-b border-[#ECE8E2]">
        <div className="mx-auto max-w-7xl px-6 py-12 md:py-16 lg:px-10">
          <p className="text-[11px] font-normal uppercase tracking-[0.44em] text-neutral-500">
            Levitaeo Collection
          </p>

          <h1 className="mt-6 max-w-3xl text-[2.5rem] font-light leading-[1.08] tracking-[-0.02em] sm:text-4xl lg:text-[3.5rem] lg:leading-[1.04]">
            {collection.title}
          </h1>

          <p className="mt-6 max-w-2xl text-[15px] leading-7 text-neutral-600 sm:text-base sm:leading-8">
            {collection.description}
          </p>

          <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-3 border-t border-[#ECE8E2] pt-8 text-[12px] tracking-[0.1em] text-neutral-500">
            <div>
              <dt className="sr-only">Volumes</dt>
              <dd>{formatCount(volumeCount, "volume", "volumes")}</dd>
            </div>
            <div>
              <dt className="sr-only">Editions</dt>
              <dd>{formatCount(editionCount, "edition", "editions")}</dd>
            </div>
          </dl>
        </div>
      </section>
    </>
  );
}
