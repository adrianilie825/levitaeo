import type { CatalogCollectionRow, CatalogProductRow, CatalogVolumeRow } from "@/types/database";

/** Purchasable edition — stored in `public.products` for migration compatibility. */
export type Edition = CatalogProductRow;

export type Volume = CatalogVolumeRow & {
  collection?: Pick<CatalogCollectionRow, "id" | "slug" | "name"> | null;
};

export type EditorialCollection = CatalogCollectionRow;

export type EditorialHierarchy = {
  collection: EditorialCollection;
  volumes: Array<
    Volume & {
      editions: Edition[];
    }
  >;
};

/** @deprecated Use Edition — alias retained during editorial restructure. */
export type CatalogEditionRow = CatalogProductRow;
