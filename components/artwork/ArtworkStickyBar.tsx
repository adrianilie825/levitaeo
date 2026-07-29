"use client";

import BuyButton from "@/components/BuyButton";
import { formatArtworkPrice } from "@/lib/products/artwork-display";
import type { Product } from "@/types/product";

type ArtworkStickyBarProps = {
  product: Pick<Product, "slug" | "title" | "price" | "currency" | "status">;
  canPurchase: boolean;
};

export default function ArtworkStickyBar({
  product,
  canPurchase,
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

        {canPurchase ? (
          <BuyButton
            productSlug={product.slug}
            label="Buy Now"
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
