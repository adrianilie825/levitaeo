"use client";

import Image from "next/image";
import { useState } from "react";
import ArtworkLightbox from "@/components/artwork/ArtworkLightbox";
import { getArtworkImageAlt } from "@/lib/products/artwork-display";
import type { Product } from "@/types/product";

type ArtworkGalleryProps = {
  product: Pick<Product, "title" | "collection" | "image" | "resolution">;
  priority?: boolean;
};

export default function ArtworkGallery({
  product,
  priority = true,
}: ArtworkGalleryProps) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const imageAlt = getArtworkImageAlt(product);

  return (
    <>
      <div className="w-full lg:max-w-none">
        <button
          type="button"
          onClick={() => setIsLightboxOpen(true)}
          className="group relative block w-full overflow-hidden border border-[#ECE8E2] bg-[#F7F5F1] text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#111111]"
          aria-label={`View ${product.title} in fullscreen`}
        >
          {!isLoaded ? (
            <span
              aria-hidden="true"
              className="absolute inset-0 min-h-[240px] animate-pulse bg-[#F0EDE8] sm:min-h-[320px]"
            />
          ) : null}

          <Image
            src={product.image}
            alt={imageAlt}
            width={1600}
            height={1200}
            priority={priority}
            sizes="(max-width: 1024px) 100vw, 60vw"
            className={`h-auto w-full object-contain transition-opacity duration-500 ease-out ${
              isLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setIsLoaded(true)}
          />

          <span className="pointer-events-none absolute inset-x-0 bottom-0 px-5 py-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
            <span className="text-[11px] uppercase tracking-[0.18em] text-neutral-600">
              View fullscreen
            </span>
          </span>
        </button>
      </div>

      <ArtworkLightbox
        isOpen={isLightboxOpen}
        imageSrc={product.image}
        imageAlt={imageAlt}
        onClose={() => setIsLightboxOpen(false)}
      />
    </>
  );
}
