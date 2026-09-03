/**
 * Artwork format model for product detail pages.
 *
 * Designed to extend later with print regions, sizes, frames, providers, and
 * variant pricing without changing the page route or artwork identity.
 */

export type ArtworkFormatId = "digital" | "print";

export type ArtworkFormatAvailability = "available" | "coming-later";

export type ArtworkFormatOption = {
  id: ArtworkFormatId;
  label: string;
  availability: ArtworkFormatAvailability;
  availabilityLabel: string;
};

/** Public format options for an artwork detail page. Print is structurally present but not purchasable yet. */
export function getArtworkFormatOptions(): ArtworkFormatOption[] {
  return [
    {
      id: "digital",
      label: "Digital Edition",
      availability: "available",
      availabilityLabel: "Available",
    },
    {
      id: "print",
      label: "Fine Art Print",
      availability: "coming-later",
      availabilityLabel: "Coming later",
    },
  ];
}

export const DIGITAL_EDITION_REASSURANCE = [
  "Secure payment",
  "Instant access to your edition",
  "Permanent library access",
] as const;

export const FINE_ART_PRINT_NOTICE =
  "Available in selected regions soon.";
