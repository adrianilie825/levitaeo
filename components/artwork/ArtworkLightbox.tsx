"use client";

import Image from "next/image";
import { useCallback, useEffect, useId, useRef } from "react";

type ArtworkLightboxProps = {
  isOpen: boolean;
  imageSrc: string;
  imageAlt: string;
  onClose: () => void;
};

export default function ArtworkLightbox({
  isOpen,
  imageSrc,
  imageAlt,
  onClose,
}: ArtworkLightboxProps) {
  const titleId = useId();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    previousFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
      previousFocusRef.current?.focus();
    };
  }, [handleKeyDown, isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#111111]/92 p-4 sm:p-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={onClose}
    >
      <p id={titleId} className="sr-only">
        {imageAlt} — fullscreen preview
      </p>

      <button
        ref={closeButtonRef}
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 z-[101] border border-[#ECE8E2] bg-[#FAFAF8] px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-[#111111] transition-colors hover:border-[#111111] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        aria-label="Close fullscreen preview"
      >
        Close
      </button>

      <div
        className="relative h-full w-full max-h-[90vh] max-w-6xl"
        onClick={(event) => event.stopPropagation()}
      >
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          sizes="100vw"
          className="object-contain"
          priority
        />
      </div>
    </div>
  );
}
