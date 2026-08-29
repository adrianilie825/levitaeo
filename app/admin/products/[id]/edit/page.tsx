import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ArtworkForm from "@/components/admin/ArtworkForm";
import { productRowToFormValues } from "@/lib/admin/artwork-form-defaults";
import {
  getAdminProductById,
  getProductDeliveryFileSummary,
  listAdminCollections,
} from "@/lib/admin/catalog";

export const metadata: Metadata = {
  title: "Edit Artwork",
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminEditProductPage({ params }: PageProps) {
  const { id } = await params;
  const [product, collections] = await Promise.all([
    getAdminProductById(id),
    listAdminCollections(),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.32em] text-neutral-500">
        Catalog
      </p>
      <h1 className="mt-4 text-3xl font-light tracking-[-0.02em] sm:text-4xl">
        Edit artwork
      </h1>
      <p className="mt-4 max-w-2xl text-[15px] leading-7 text-neutral-600">
        Update {product.title}. Slug changes affect public URLs and checkout
        lookups.
      </p>

      <div className="mt-10">
        <ArtworkForm
          mode="edit"
          productId={product.id}
          collections={collections}
          initialValues={productRowToFormValues(product)}
          initialDeliveryFile={(() => {
            const summary = getProductDeliveryFileSummary(product);
            return {
              configured: summary.configured,
              filename: summary.filename,
              mimeType: summary.mimeType,
              sizeBytes: summary.sizeBytes,
              version: summary.version,
              storagePath: null,
            };
          })()}
        />
      </div>
    </div>
  );
}
