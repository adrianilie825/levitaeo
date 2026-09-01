"use client";

import BuyButton, {
  SignInToPurchaseLink,
  ViewInLibraryLink,
} from "@/components/BuyButton";
import { formatArtworkPrice } from "@/lib/products/artwork-display";
import type { Product } from "@/types/product";

type ArtworkStickyBarProps = {
  product: Product;
  productPath: string;
  canPurchase: boolean;
  isAuthenticated: boolean;
  isOwned: boolean;
};

export default function ArtworkStickyBar({
  product,
  productPath,
  canPurchase,
  isAuthenticated,
  isOwned,
}: ArtworkStickyBarProps) {
  const isAvailable = product.status === "available";
  const formattedPrice = formatArtworkPrice(product);

  if (!isAvailable) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#ECE8E2] bg-[#FAFAF8]/95 backdrop-blur-sm md:hidden">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-6 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-light tracking-[-0.01em] text-[#111111]">
            {product.title}
          </p>
          <p className="mt-0.5 text-[14px] tracking-[-0.01em] text-neutral-600">
            {formattedPrice}
          </p>
        </div>

        {isOwned ? (
          <ViewInLibraryLink className="inline-flex shrink-0 items-center justify-center border border-[#111111] bg-[#111111] px-6 py-3 text-[11px] uppercase tracking-[0.18em] text-white transition-colors duration-300 hover:bg-transparent hover:text-[#111111]" />
        ) : !isAuthenticated ? (
          <SignInToPurchaseLink
            loginReturnPath={productPath}
            className="inline-flex shrink-0 items-center justify-center border border-[#111111] bg-[#111111] px-6 py-3 text-[11px] uppercase tracking-[0.18em] text-white transition-colors duration-300 hover:bg-transparent hover:text-[#111111]"
          />
        ) : canPurchase ? (
          <BuyButton
            productSlug={product.slug}
            loginReturnPath={productPath}
            label="Acquire Edition"
            className="shrink-0 px-6 py-3"
          />
        ) : (
          <button
            type="button"
            disabled
            aria-disabled="true"
            className="inline-flex shrink-0 cursor-not-allowed items-center justify-center border border-neutral-300 bg-neutral-200 px-6 py-3 text-[11px] uppercase tracking-[0.18em] text-neutral-500"
          >
            Unavailable
          </button>
        )}
      </div>
    </div>
  );
}
