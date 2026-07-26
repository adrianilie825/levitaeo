import type { Metadata } from "next";
import ProductForm, {
  emptyProductFormValues,
} from "@/components/admin/ProductForm";
import { listAdminCollections } from "@/lib/admin/catalog";

export const metadata: Metadata = {
  title: "New Product",
};

export default async function AdminNewProductPage() {
  const collections = await listAdminCollections();

  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.32em] text-neutral-500">
        Catalog
      </p>
      <h1 className="mt-4 text-3xl font-light tracking-[-0.02em] sm:text-4xl">
        New product
      </h1>
      <p className="mt-4 max-w-2xl text-[15px] leading-7 text-neutral-600">
        Create a catalog entry. Price is stored in cents on the server.
      </p>

      <div className="mt-10">
        <ProductForm
          mode="create"
          collections={collections}
          initialValues={emptyProductFormValues(collections)}
        />
      </div>
    </div>
  );
}
