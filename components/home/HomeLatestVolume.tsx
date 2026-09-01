import Image from "next/image";
import Link from "next/link";
import type { PublicVolumeSummary } from "@/lib/catalog/collections-public";

type HomeLatestVolumeProps = {
  volume: PublicVolumeSummary;
};

export default function HomeLatestVolume({ volume }: HomeLatestVolumeProps) {
  const coverImage =
    volume.coverImage?.trim() || "/images/collections/originals.png";

  return (
    <section className="border-t border-[#ECE8E2]">
      <div className="mx-auto max-w-[1400px] px-6 py-20 md:py-28 lg:px-12 lg:py-32">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-x-20 xl:gap-x-28">
          <div className="mx-auto w-full max-w-md lg:mx-0 lg:max-w-lg">
            <div className="relative aspect-[3/4] overflow-hidden border border-[#E8E4DE] bg-[#F5F3EF]">
              <Image
                src={coverImage}
                alt={`${volume.name} volume cover`}
                fill
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover"
              />
            </div>
          </div>

          <div className="max-w-sm lg:max-w-md">
            <p className="text-[11px] uppercase tracking-[0.44em] text-neutral-500">
              Latest Volume
            </p>

            <h2 className="mt-5 text-[2rem] font-light leading-[1.1] tracking-[-0.02em] sm:text-[2.5rem]">
              {volume.name}
            </h2>

            <div className="mt-6 space-y-1 text-[12px] uppercase tracking-[0.2em] text-neutral-500">
              {volume.collection?.name ? <p>{volume.collection.name}</p> : null}
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
              className="mt-10 inline-flex items-center justify-center border border-[#111111] bg-[#111111] px-9 py-3.5 text-[11px] uppercase tracking-[0.18em] text-white transition-colors duration-300 hover:bg-[#FAFAF8] hover:text-[#111111]"
            >
              Read the Volume
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
