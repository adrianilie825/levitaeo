import { Suspense } from "react";
import BuyButton, {
  SignInToPurchaseLink,
  ViewInLibraryLink,
} from "@/components/BuyButton";
import CheckoutNotice from "@/components/CheckoutNotice";
import {
  formatArtworkPrice,
  getArtworkMetadataItems,
} from "@/lib/products/artwork-display";
import { formatEditionLabel, getProductPath } from "@/lib/products-db";
import type { Product } from "@/types/product";

type ArtworkPurchasePanelProps = {
  product: Product;
  canPurchase: boolean;
  isAuthenticated: boolean;
  isOwned: boolean;
  showCheckoutNotice?: boolean;
  className?: string;
};

const reassuranceItems = [
  "Secure checkout",
  "Instant digital download",
  "Lifetime account access",
];

export default function ArtworkPurchasePanel({
  product,
  canPurchase,
  isAuthenticated,
  isOwned,
  showCheckoutNotice = true,
  className = "",
}: ArtworkPurchasePanelProps) {
  const metadataItems = getArtworkMetadataItems(product);
  const isAvailable = product.status === "available";
  const formattedPrice = formatArtworkPrice(product);
  const productPath = getProductPath(product);

  return (
    <aside className={className}>
      {showCheckoutNotice ? (
        <Suspense fallback={null}>
          <CheckoutNotice />
        </Suspense>
      ) : null}

      <p className="text-[11px] uppercase tracking-[0.32em] text-neutral-500">
        {product.collection}
      </p>

      <h1 className="mt-4 text-[2rem] font-light leading-[1.12] tracking-[-0.02em] sm:text-[2.35rem]">
        {product.title}
      </h1>

      {product.subtitle?.trim() ? (
        <p className="mt-3 text-[15px] leading-7 text-neutral-600">
          {product.subtitle.trim()}
        </p>
      ) : null}

      {product.edition?.trim() ? (
        <p className="mt-3 text-[12px] tracking-[0.12em] text-neutral-500">
          {formatEditionLabel(product.edition)}
        </p>
      ) : null}

      {isAvailable ? (
        <p className="mt-8 text-[1.75rem] font-light tracking-[-0.02em]">
          {formattedPrice}
        </p>
      ) : null}

      <div className="mt-8">
        {isOwned ? (
          <ViewInLibraryLink />
        ) : !isAuthenticated ? (
          <SignInToPurchaseLink loginReturnPath={productPath} />
        ) : canPurchase ? (
          <BuyButton
            productSlug={product.slug}
            loginReturnPath={productPath}
            label="Buy Now"
            className="w-full"
          />
        ) : isAvailable ? (
          <div className="space-y-3">
            <button
              type="button"
              disabled
              aria-disabled="true"
              className="inline-flex w-full cursor-not-allowed items-center justify-center border border-neutral-300 bg-neutral-200 px-8 py-3.5 text-[11px] uppercase tracking-[0.18em] text-neutral-500"
            >
              Buy Now
            </button>
            <p className="text-[12px] leading-5 text-neutral-600">
              This edition is temporarily unavailable for purchase.
            </p>
          </div>
        ) : (
          <button
            type="button"
            disabled
            aria-disabled="true"
            className="inline-flex w-full cursor-not-allowed items-center justify-center border border-neutral-300 bg-neutral-200 px-8 py-3.5 text-[11px] uppercase tracking-[0.18em] text-neutral-500"
          >
            Coming Soon
          </button>
        )}
      </div>

      <ul className="mt-8 space-y-2 border-t border-[#ECE8E2] pt-8 text-[13px] leading-6 text-neutral-600">
        {reassuranceItems.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      {metadataItems.length > 0 ? (
        <dl className="mt-8 space-y-4 border-t border-[#ECE8E2] pt-8">
          {metadataItems.map((item) => (
            <div
              key={item.label}
              className="grid grid-cols-[7.5rem_1fr] gap-4 text-[13px] leading-6 sm:grid-cols-[8.5rem_1fr]"
            >
              <dt className="tracking-[0.06em] text-neutral-500">{item.label}</dt>
              <dd className="text-[#111111]">{item.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </aside>
  );
}
