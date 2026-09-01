import Image from "next/image";
import Link from "next/link";
import { HOME_EDITORIAL_CONTAINER } from "@/lib/home/homepage-layout";
import type { HomeVolumeSummary } from "@/lib/home/homepage-types";

const VOLUME_COVER_FALLBACK = "/images/collections/originals.png";

type HomeLatestVolumeProps = {
  volume: HomeVolumeSummary;
};

function getSafeCoverImage(coverImage?: string): string {
  const trimmed = coverImage?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : VOLUME_COVER_FALLBACK;
}

export default function HomeLatestVolume({ volume }: HomeLatestVolumeProps) {
  const coverImage = getSafeCoverImage(volume.coverImage);

  return (
    <section className="border-t border-[#ECE8E2] bg-[#FAFAF8]">
      <div className={`${HOME_EDITORIAL_CONTAINER} pt-12 pb-10 md:pt-14 md:pb-12 lg:pt-16 lg:pb-14`}>
        <div className="grid items-center gap-10 md:grid-cols-[58fr_42fr] md:gap-x-10 lg:gap-x-14">
          <div className="relative aspect-[5/4] w-full overflow-hidden bg-neutral-200 md:aspect-[4/3]">
            <Image
              src={coverImage}
              alt={`${volume.name} volume cover`}
              fill
              sizes="(max-width: 768px) 100vw, 58vw"
              className="object-cover"
            />
          </div>

          <div className="flex flex-col justify-center md:py-2">
            <p className="text-[11px] uppercase tracking-[0.44em] text-neutral-500">
              Latest Volume
            </p>

            <h2 className="mt-4 text-[2rem] font-light leading-[1.08] tracking-[-0.02em] sm:text-[2.25rem] lg:text-[2.5rem]">
              {volume.name}
            </h2>

            <div className="mt-5 space-y-1 text-[11px] uppercase tracking-[0.24em] text-neutral-500">
              {volume.collectionName ? <p>{volume.collectionName}</p> : null}
              {typeof volume.editionCount === "number" && volume.editionCount > 0 ? (
                <p>
                  {volume.editionCount === 1
                    ? "1 edition"
                    : `${volume.editionCount} editions`}
                </p>
              ) : null}
            </div>

            <Link
              href={volume.href}
              className="mt-8 inline-block text-[11px] uppercase tracking-[0.2em] text-[#111111] transition-colors hover:text-neutral-600"
            >
              Read the Volume →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
