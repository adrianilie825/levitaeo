import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  getPublicProductPath,
  listAdminCollections,
  listAdminProducts,
} from "@/lib/admin/catalog";
import {
  formatCentsToPriceInput,
  PRODUCT_STATUSES,
  statusLabel,
} from "@/lib/admin/product-constants";

export const metadata: Metadata = {
  title: "Products",
};

type PageProps = {
  searchParams: Promise<{
    status?: string;
    collection?: string;
    featured?: string;
    q?: string;
  }>;
};

export default async function AdminProductsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const collections = await listAdminCollections();

  const featuredFilter =
    params.featured === "true"
      ? true
      : params.featured === "false"
        ? false
        : undefined;

  const products = await listAdminProducts({
    status: params.status,
    collectionId: params.collection,
    featured: featuredFilter,
    query: params.q,
  });

  return (
    <div>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.32em] text-neutral-500">
            Catalog
          </p>
          <h1 className="mt-4 text-3xl font-light tracking-[-0.02em] sm:text-4xl">
            Products
          </h1>
          <p className="mt-4 text-[15px] leading-7 text-neutral-600">
            {products.length} product{products.length === 1 ? "" : "s"} shown
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="inline-flex items-center justify-center border border-[#111111] bg-[#111111] px-8 py-3.5 text-[11px] uppercase tracking-[0.18em] text-white transition-colors duration-300 hover:bg-transparent hover:text-[#111111]"
        >
          New product
        </Link>
      </div>

      <form
        method="get"
        className="mt-10 grid gap-4 border border-[#ECE8E2] bg-white p-6 md:grid-cols-2 xl:grid-cols-5"
      >
        <FilterField label="Search">
          <input
            type="search"
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="Title or slug"
            className={filterInputClassName}
          />
        </FilterField>

        <FilterField label="Status">
          <select
            name="status"
            defaultValue={params.status ?? ""}
            className={filterInputClassName}
          >
            <option value="">All statuses</option>
            {PRODUCT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {statusLabel(status)}
              </option>
            ))}
          </select>
        </FilterField>

        <FilterField label="Collection">
          <select
            name="collection"
            defaultValue={params.collection ?? ""}
            className={filterInputClassName}
          >
            <option value="">All collections</option>
            {collections.map((collection) => (
              <option key={collection.id} value={collection.id}>
                {collection.name}
              </option>
            ))}
          </select>
        </FilterField>

        <FilterField label="Featured">
          <select
            name="featured"
            defaultValue={params.featured ?? ""}
            className={filterInputClassName}
          >
            <option value="">Any</option>
            <option value="true">Featured only</option>
            <option value="false">Not featured</option>
          </select>
        </FilterField>

        <div className="flex items-end">
          <button
            type="submit"
            className="w-full border border-[#111111] px-4 py-3 text-[11px] uppercase tracking-[0.18em] transition-colors hover:bg-[#111111] hover:text-white"
          >
            Apply
          </button>
        </div>
      </form>

      <div className="mt-10 overflow-x-auto border border-[#ECE8E2] bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-[#ECE8E2] text-[11px] uppercase tracking-[0.18em] text-neutral-500">
            <tr>
              <th className="px-4 py-4 font-normal">Product</th>
              <th className="px-4 py-4 font-normal">Collection</th>
              <th className="px-4 py-4 font-normal">Price</th>
              <th className="px-4 py-4 font-normal">Status</th>
              <th className="px-4 py-4 font-normal">Featured</th>
              <th className="px-4 py-4 font-normal">Created</th>
              <th className="px-4 py-4 font-normal">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const publicPath = getPublicProductPath(product);
              const thumbnail = product.thumbnail_url || product.image_url;

              return (
                <tr
                  key={product.id}
                  className="border-b border-[#ECE8E2] last:border-b-0"
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-4">
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden border border-[#ECE8E2] bg-[#FAFAF8]">
                        {thumbnail ? (
                          <Image
                            src={thumbnail}
                            alt=""
                            fill
                            sizes="56px"
                            className="object-cover"
                          />
                        ) : null}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-[#111111]">
                          {product.title}
                        </p>
                        <p className="mt-1 font-mono text-xs text-neutral-500">
                          {product.slug}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-neutral-600">
                    {product.collections?.name ?? "—"}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-neutral-600">
                    {formatCentsToPriceInput(product.price_cents)}{" "}
                    {product.currency}
                  </td>
                  <td className="px-4 py-4 capitalize text-neutral-600">
                    {statusLabel(product.status)}
                  </td>
                  <td className="px-4 py-4 text-neutral-600">
                    {product.is_featured ? "Yes" : "No"}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-neutral-600">
                    {formatDate(product.created_at)}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col gap-2">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="text-[11px] uppercase tracking-[0.18em] text-[#111111] hover:underline"
                      >
                        Edit
                      </Link>
                      {publicPath ? (
                        <Link
                          href={publicPath}
                          className="text-[11px] uppercase tracking-[0.18em] text-neutral-500 hover:text-[#111111] hover:underline"
                          target="_blank"
                          rel="noreferrer"
                        >
                          View
                        </Link>
                      ) : null}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {products.length === 0 ? (
          <p className="px-4 py-10 text-center text-[15px] text-neutral-600">
            No products match the current filters.
          </p>
        ) : null}
      </div>
    </div>
  );
}

const filterInputClassName =
  "mt-2 w-full border border-[#ECE8E2] bg-[#FAFAF8] px-3 py-2.5 text-[14px] outline-none focus-visible:border-[#111111]";

function FilterField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-[11px] uppercase tracking-[0.28em] text-neutral-500">
      {label}
      {children}
    </label>
  );
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
