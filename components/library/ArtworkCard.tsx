import Image from "next/image";
import Link from "next/link";
import SecureDownloadButton from "@/components/library/SecureDownloadButton";
import type { LibraryArtwork } from "@/lib/library";

type ArtworkCardProps = {
  artwork: LibraryArtwork;
};

function formatPurchaseDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Purchase date unavailable";
  }

  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
  }).format(date);
}

function formatEntitlementStatus(status: LibraryArtwork["entitlementStatus"]): string {
  switch (status) {
    case "active":
      return "Owned";
    case "revoked":
      return "Access revoked";
    case "refunded":
      return "Refunded";
    default:
      return status;
  }
}

export default function ArtworkCard({ artwork }: ArtworkCardProps) {
  return (
    <article className="flex h-full flex-col border border-[#ECE8E2] bg-white">
      <div className="relative aspect-[4/5] overflow-hidden bg-[#FAFAF8]">
        <Image
          src={artwork.thumbnailUrl}
          alt={artwork.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover"
        />
      </div>

      <div className="flex flex-1 flex-col p-6">
        <p className="text-[11px] uppercase tracking-[0.28em] text-neutral-500">
          {artwork.collectionName}
        </p>
        <h2 className="mt-3 text-xl font-light tracking-[-0.02em] text-[#111111]">
          {artwork.title}
        </h2>
        {artwork.subtitle ? (
          <p className="mt-2 text-[14px] leading-6 text-neutral-600">
            {artwork.subtitle}
          </p>
        ) : null}

        <dl className="mt-6 space-y-3 text-[13px] leading-6 text-neutral-600">
          <div className="flex justify-between gap-4">
            <dt className="text-neutral-500">Edition</dt>
            <dd className="text-right text-[#111111]">{artwork.edition}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-neutral-500">Purchased</dt>
            <dd className="text-right">{formatPurchaseDate(artwork.purchasedAt)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-neutral-500">Format</dt>
            <dd className="text-right">{artwork.fileType}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-neutral-500">Resolution</dt>
            <dd className="text-right">{artwork.resolution}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-neutral-500">Status</dt>
            <dd className="text-right text-[#111111]">
              {formatEntitlementStatus(artwork.entitlementStatus)}
            </dd>
          </div>
        </dl>

        <div className="mt-auto flex flex-col gap-3 pt-8">
          {artwork.detailPath ? (
            <Link
              href={artwork.detailPath}
              className="inline-flex items-center justify-center border border-[#111111] bg-[#111111] px-6 py-3 text-[11px] uppercase tracking-[0.18em] text-white transition-colors duration-300 hover:bg-transparent hover:text-[#111111]"
            >
              View Details
            </Link>
          ) : (
            <span className="inline-flex items-center justify-center border border-[#ECE8E2] px-6 py-3 text-[11px] uppercase tracking-[0.18em] text-neutral-400">
              Details unavailable
            </span>
          )}

          <SecureDownloadButton
            productId={artwork.productId}
            filename={artwork.downloadFilename}
            isDownloadReady={artwork.isDownloadReady}
          />
        </div>
      </div>
    </article>
  );
}
