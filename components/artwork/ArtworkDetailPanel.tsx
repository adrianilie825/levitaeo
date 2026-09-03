"use client";

import { Suspense, useState } from "react";
import BuyButton, {
  SignInToPurchaseLink,
  ViewInLibraryLink,
} from "@/components/BuyButton";
import CheckoutNotice from "@/components/CheckoutNotice";
import {
  formatArtworkPrice,
  formatEditionLabel,
  getArtworkDescriptionParagraphs,
  getDigitalSpecificationItems,
} from "@/lib/products/artwork-display";
import {
  DIGITAL_EDITION_REASSURANCE,
  FINE_ART_PRINT_NOTICE,
  getArtworkFormatOptions,
  type ArtworkFormatId,
} from "@/lib/products/artwork-formats";
import type { Product } from "@/types/product";

type ArtworkDetailPanelProps = {
  product: Product;
  productPath: string;
  canPurchase: boolean;
  isAuthenticated: boolean;
  isOwned: boolean;
  showCheckoutNotice?: boolean;
  className?: string;
};

function FormatSelector({
  selectedFormat,
  onSelect,
}: {
  selectedFormat: ArtworkFormatId;
  onSelect: (format: ArtworkFormatId) => void;
}) {
  const formats = getArtworkFormatOptions();

  return (
    <div className="mt-10">
      <p className="text-[11px] uppercase tracking-[0.32em] text-neutral-500">
        Format
      </p>

      <div
        className="mt-4 divide-y divide-[#ECE8E2] border border-[#ECE8E2]"
        role="radiogroup"
        aria-label="Artwork format"
      >
        {formats.map((format) => {
          const isSelected = selectedFormat === format.id;

          return (
            <button
              key={format.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onSelect(format.id)}
              className={`flex w-full items-baseline justify-between gap-4 px-4 py-4 text-left transition-colors sm:px-5 ${
                isSelected ? "bg-[#F7F5F1]" : "bg-transparent hover:bg-[#FAFAF8]"
              }`}
            >
              <span className="text-[14px] font-light tracking-[-0.01em] text-[#111111] sm:text-[15px]">
                {format.label}
              </span>

              <span className="shrink-0 text-[11px] uppercase tracking-[0.14em] text-neutral-500">
                {format.availabilityLabel}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DigitalAcquisition({
  product,
  canPurchase,
  isAuthenticated,
  isOwned,
  productPath,
}: {
  product: Product;
  canPurchase: boolean;
  isAuthenticated: boolean;
  isOwned: boolean;
  productPath: string;
}) {
  const isAvailable = product.status === "available";
  const formattedPrice = formatArtworkPrice(product);

  return (
    <div className="mt-10">
      {isAvailable ? (
        <p className="text-[1.75rem] font-light tracking-[-0.02em] text-[#111111]">
          {formattedPrice}
        </p>
      ) : null}

      <div className="mt-6">
        {isOwned ? (
          <ViewInLibraryLink />
        ) : !isAuthenticated ? (
          <SignInToPurchaseLink loginReturnPath={productPath} />
        ) : canPurchase ? (
          <BuyButton
            productSlug={product.slug}
            loginReturnPath={productPath}
            label="Acquire Edition"
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
              Acquire Edition
            </button>
            <p className="text-[12px] leading-5 text-neutral-600">
              This edition is not currently available for collection.
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

      <ul className="mt-10 space-y-2 border-t border-[#ECE8E2] pt-9 text-[13px] leading-6 text-neutral-600">
        {DIGITAL_EDITION_REASSURANCE.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function PrintFormatNotice() {
  return (
    <div className="mt-8 border-t border-[#ECE8E2] pt-8">
      <p className="text-[15px] leading-7 text-neutral-600">
        {FINE_ART_PRINT_NOTICE}
      </p>
    </div>
  );
}

function DigitalSpecifications({ product }: { product: Product }) {
  const items = getDigitalSpecificationItems(product);

  if (items.length === 0) {
    return null;
  }

  return (
    <dl className="mt-10 space-y-4 border-t border-[#ECE8E2] pt-8">
      {items.map((item) => (
        <div
          key={item.label}
          className="grid grid-cols-[7.5rem_1fr] gap-4 text-[13px] leading-6 sm:grid-cols-[8.5rem_1fr]"
        >
          <dt className="tracking-[0.06em] text-neutral-500">{item.label}</dt>
          <dd className="text-[#111111]">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export default function ArtworkDetailPanel({
  product,
  productPath,
  canPurchase,
  isAuthenticated,
  isOwned,
  showCheckoutNotice = true,
  className = "",
}: ArtworkDetailPanelProps) {
  const [selectedFormat, setSelectedFormat] =
    useState<ArtworkFormatId>("digital");
  const descriptionParagraphs = getArtworkDescriptionParagraphs(
    product.description,
  );

  return (
    <aside className={className}>
      {showCheckoutNotice && selectedFormat === "digital" ? (
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

      {product.edition?.trim() ? (
        <p className="mt-3 text-[12px] tracking-[0.12em] text-neutral-500">
          {formatEditionLabel(product.edition)}
        </p>
      ) : null}

      {descriptionParagraphs.length > 0 ? (
        <div className="mt-8 max-w-md space-y-4 text-[15px] leading-7 text-neutral-600 sm:leading-8">
          {descriptionParagraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      ) : null}

      <FormatSelector
        selectedFormat={selectedFormat}
        onSelect={setSelectedFormat}
      />

      {selectedFormat === "digital" ? (
        <>
          <DigitalAcquisition
            product={product}
            canPurchase={canPurchase}
            isAuthenticated={isAuthenticated}
            isOwned={isOwned}
            productPath={productPath}
          />
          <DigitalSpecifications product={product} />
        </>
      ) : (
        <PrintFormatNotice />
      )}
    </aside>
  );
}
