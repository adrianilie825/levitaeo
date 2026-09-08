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
    <article className="border-b border-[#ECE8E2] pb-12 last:border-b-0 last:pb-0">
      <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-x-14 xl:gap-x-16">
        <div className="bg-[#F7F5F1]">
          <Image
            src={artwork.thumbnailUrl}
            alt={artwork.previewAltText}
            width={1600}
            height={900}
            sizes="(max-width: 1024px) 100vw, 58vw"
            className="h-auto max-h-[28rem] w-full object-contain lg:max-h-[32rem]"
          />
        </div>

        <div className="flex flex-col lg:pt-2">
          <p className="text-[11px] uppercase tracking-[0.28em] text-neutral-500">
            {artwork.collectionName}
          </p>
          <h2 className="mt-3 text-2xl font-light tracking-[-0.02em] text-[#111111] sm:text-[1.75rem]">
            {artwork.title}
          </h2>
          {artwork.subtitle ? (
            <p className="mt-2 text-[14px] leading-6 text-neutral-600">
              {artwork.subtitle}
            </p>
          ) : null}

          <dl className="mt-8 space-y-3 text-[13px] leading-6 text-neutral-600">
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

          <div className="mt-10 flex flex-col gap-3">
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

            {artwork.downloadFiles.length > 0 ? (
              <div className="space-y-2">
                <p className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
                  {artwork.downloadFiles.length} file
                  {artwork.downloadFiles.length === 1 ? "" : "s"} included
                </p>
                {artwork.downloadFiles.map((file) => (
                  <SecureDownloadButton
                    key={file.variantKey}
                    productId={artwork.productId}
                    isDownloadReady={artwork.isDownloadReady}
                    variantKey={file.variantKey}
                    label={file.displayName}
                    compact
                  />
                ))}
              </div>
            ) : (
              <SecureDownloadButton
                productId={artwork.productId}
                isDownloadReady={artwork.isDownloadReady}
              />
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
