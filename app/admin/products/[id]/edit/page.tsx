import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductFileUpload from "@/components/admin/ProductFileUpload";
import ProductForm, {
  productRowToFormValues,
} from "@/components/admin/ProductForm";
import {
  getAdminProductById,
  getProductDeliveryFileSummary,
  listAdminCollections,
} from "@/lib/admin/catalog";

export const metadata: Metadata = {
  title: "Edit Product",
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
        Edit product
      </h1>
      <p className="mt-4 max-w-2xl text-[15px] leading-7 text-neutral-600">
        Update {product.title}. Slug changes affect public URLs and checkout
        lookups.
      </p>

      <div className="mt-10 space-y-10">
        <ProductFileUpload
          productId={product.id}
          initialFile={{
            ...getProductDeliveryFileSummary(product),
            storagePath: product.download_storage_path,
          }}
        />

        <ProductForm
          mode="edit"
          productId={product.id}
          collections={collections}
          initialValues={productRowToFormValues(product)}
        />
      </div>
    </div>
  );
}
