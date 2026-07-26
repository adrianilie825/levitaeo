import "server-only";

import { revalidatePath, revalidateTag } from "next/cache";
import {
  CATALOG_COLLECTIONS_TAG,
  CATALOG_PRODUCTS_TAG,
  CATALOG_SEARCH_TAG,
} from "@/lib/products-db";

type RevalidateCatalogOptions = {
  productSlug?: string;
  collectionSlug?: string;
};

export function revalidateCatalog(options: RevalidateCatalogOptions = {}) {
  revalidateTag(CATALOG_PRODUCTS_TAG, "max");
  revalidateTag(CATALOG_COLLECTIONS_TAG, "max");
  revalidateTag(CATALOG_SEARCH_TAG, "max");

  revalidatePath("/");
  revalidatePath("/collections");
  revalidatePath("/collections/originals");
  revalidatePath("/search");

  if (options.collectionSlug) {
    revalidatePath(`/collections/${options.collectionSlug}`);
  }

  if (options.productSlug && options.collectionSlug) {
    revalidatePath(
      `/collections/${options.collectionSlug}/${options.productSlug}`,
    );
  }

  revalidatePath("/sitemap.xml");
}
