import type { Metadata } from "next";
import Link from "next/link";
import { listAdminCollections, listAdminProducts } from "@/lib/admin/catalog";
import { statusLabel } from "@/lib/admin/product-constants";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function AdminDashboardPage() {
  const [products, collections] = await Promise.all([
    listAdminProducts(),
    listAdminCollections(),
  ]);

  const statusCounts = products.reduce<Record<string, number>>((counts, product) => {
    counts[product.status] = (counts[product.status] ?? 0) + 1;
    return counts;
  }, {});

  const featuredCount = products.filter((product) => product.is_featured).length;

  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.32em] text-neutral-500">
        Overview
      </p>
      <h1 className="mt-4 text-3xl font-light tracking-[-0.02em] sm:text-4xl">
        Dashboard
      </h1>
      <p className="mt-4 max-w-2xl text-[15px] leading-7 text-neutral-600">
        Manage Levitaeo catalog content. Changes revalidate the public site after
        each save.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Products" value={String(products.length)} />
        <StatCard label="Collections" value={String(collections.length)} />
        <StatCard label="Featured" value={String(featuredCount)} />
        <StatCard
          label="Published"
          value={String(statusCounts.published ?? 0)}
        />
      </div>

      <section className="mt-12 border-t border-[#ECE8E2] pt-10">
        <h2 className="text-xl font-light tracking-[-0.02em]">By status</h2>
        <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(statusCounts).map(([status, count]) => (
            <div key={status} className="border border-[#ECE8E2] bg-white p-5">
              <dt className="text-[11px] uppercase tracking-[0.28em] text-neutral-500">
                {statusLabel(status)}
              </dt>
              <dd className="mt-3 text-2xl font-light">{count}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="mt-12 flex flex-col gap-4 sm:flex-row">
        <Link
          href="/admin/products/new"
          className="inline-flex items-center justify-center border border-[#111111] bg-[#111111] px-8 py-3.5 text-[11px] uppercase tracking-[0.18em] text-white transition-colors duration-300 hover:bg-transparent hover:text-[#111111]"
        >
          New product
        </Link>
        <Link
          href="/admin/products"
          className="inline-flex items-center justify-center border border-[#ECE8E2] px-8 py-3.5 text-[11px] uppercase tracking-[0.18em] text-[#111111] transition-colors hover:border-[#111111]"
        >
          View products
        </Link>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-[#ECE8E2] bg-white p-6">
      <p className="text-[11px] uppercase tracking-[0.28em] text-neutral-500">
        {label}
      </p>
      <p className="mt-4 text-3xl font-light tracking-[-0.02em]">{value}</p>
    </div>
  );
}
