import Link from "next/link";
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

  const imageBlock = (
    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[3px] border border-[#E8E4DE] bg-[#F7F5F1]">
      <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/55 via-black/10 to-transparent p-6">
        <div>
          <p className="text-[10px] uppercase tracking-[0.38em] text-white/70">
            {collectionTitle}
          </p>
          <p className="mt-2 text-2xl font-light text-white">{volume.name}</p>
        </div>
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
      <article className="group transition-transform duration-300 ease-out hover:-translate-y-1">
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
