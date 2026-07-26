import "server-only";

import { revalidatePath } from "next/cache";
import { revalidateCatalog } from "@/lib/admin/revalidate";

export function revalidateAfterProductFileChange(input: {
  productId: string;
  productSlug: string;
  collectionSlug: string;
}) {
  revalidateCatalog({
    productSlug: input.productSlug,
    collectionSlug: input.collectionSlug,
  });

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${input.productId}/edit`);
  revalidatePath("/library");
}
