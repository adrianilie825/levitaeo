export const SKYLINE_SOURCE_EXTENSIONS = ["png", "jpg", "jpeg"] as const;

export type SkylineSourceExtension = (typeof SKYLINE_SOURCE_EXTENSIONS)[number];

export type CatalogImportVariant = {
  key: string;
  basename: string;
  displayName: string;
  sortOrder: number;
};

export const SKYLINES_VARIANTS: CatalogImportVariant[] = [
  {
    key: "color",
    basename: "color",
    displayName: "Color",
    sortOrder: 1,
  },
  {
    key: "color-white",
    basename: "color-white",
    displayName: "Color / White",
    sortOrder: 2,
  },
  {
    key: "black-white",
    basename: "black-white",
    displayName: "Black & White",
    sortOrder: 3,
  },
  {
    key: "blueprint",
    basename: "blueprint",
    displayName: "Blueprint",
    sortOrder: 4,
  },
];

export const COLLECTION_VARIANTS: Record<string, CatalogImportVariant[]> = {
  skylines: SKYLINES_VARIANTS,
};

export const PRINT_MASTER_TARGET_WIDTH = 9000;

export const PRINT_MASTER_TARGET_HEIGHT = 3000;

export const PRINT_MASTER_WARNING =
  "Below Levitaeo print-master target — suitable as source/digital asset, high-resolution print master still required.";

export const DEFAULT_IMPORT_STATUS = "draft" as const;

export const DEFAULT_IMPORT_CURRENCY = "EUR";

export const DEFAULT_IMPORT_PRICE_CENTS = 2900;

export const DEFAULT_IMPORT_RESOLUTION = "6000 × 8000 px";

export const DEFAULT_IMPORT_FILE_TYPE = "JPG";
