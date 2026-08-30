import Image from "next/image";
import Link from "next/link";
import { PRODUCT_FALLBACK_IMAGE } from "@/lib/product-catalog";
import type { PublicVolumeSummary } from "@/lib/catalog/collections-public";

type VolumeCardProps = {
  volume: PublicVolumeSummary;
  collectionTitle: string;
  collectionActive?: boolean;
};

export default function VolumeCard({
  volume,
  collectionTitle,
  collectionActive = true,
}: VolumeCardProps) {
  const editionLabel =
    volume.editionCount === 1
      ? "1 edition"
      : `${volume.editionCount} editions`;
  const coverImage = volume.coverImage ?? PRODUCT_FALLBACK_IMAGE;

  const imageBlock = (
    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[3px] border border-[#E8E4DE] bg-[#F7F5F1]">
      <Image
        src={coverImage}
        alt={`${volume.name} volume cover`}
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        className={`object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          collectionActive ? "group-hover:scale-[1.04]" : "opacity-90"
        }`}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <p className="text-[10px] uppercase tracking-[0.38em] text-white/70">
          {collectionTitle}
        </p>
        <p className="mt-2 text-2xl font-light text-white">{volume.name}</p>
      </div>
    </div>
  );

  const meta = (
    <>
      <h2 className="mt-5 text-2xl font-light tracking-[-0.01em] sm:text-[1.75rem]">
        {collectionActive ? (
          <Link
            href={volume.href}
            className="transition-colors hover:text-neutral-600"
          >
            {volume.name}
          </Link>
        ) : (
          <span>{volume.name}</span>
        )}
      </h2>

      <p className="mt-3 max-w-md text-[15px] leading-7 text-neutral-600">
        {volume.description}
      </p>

      <p className="mt-4 text-[12px] tracking-[0.1em] text-neutral-500">
        {editionLabel}
      </p>

      {collectionActive ? (
        <Link
          href={volume.href}
          className="mt-5 inline-block text-[12px] tracking-[0.1em] text-neutral-600 underline-offset-4 transition-colors hover:text-[#111111] hover:underline"
        >
          Explore Volume
        </Link>
      ) : (
        <p className="mt-5 text-[12px] tracking-[0.1em] text-neutral-500">
          Coming Soon
        </p>
      )}
    </>
  );

  if (collectionActive) {
    return (
      <article className="group transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5">
        <Link
          href={volume.href}
          className="block overflow-hidden rounded-[3px]"
          aria-label={`Explore ${volume.name}`}
        >
          {imageBlock}
        </Link>
        {meta}
      </article>
    );
  }

  return (
    <article className="group cursor-default">
      {imageBlock}
      {meta}
    </article>
  );
}
