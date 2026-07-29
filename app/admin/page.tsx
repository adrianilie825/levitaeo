import type { Metadata } from "next";
import Link from "next/link";
import { listAdminCollections, listAdminProducts } from "@/lib/admin/catalog";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function AdminDashboardPage() {
  const [products, collections] = await Promise.all([
    listAdminProducts(),
    listAdminCollections(),
  ]);

  const publishedCount = products.filter(
    (product) => product.status === "published",
  ).length;
  const draftCount = products.filter(
    (product) => product.status === "draft",
  ).length;

  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.32em] text-neutral-500">
        Overview
      </p>
      <h1 className="mt-4 text-3xl font-light tracking-[-0.02em] sm:text-4xl">
        Dashboard
      </h1>
      <p className="mt-4 max-w-2xl text-[15px] leading-7 text-neutral-600">
        Production overview for Levitaeo catalog content. Changes revalidate
        the public site after each save.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total artworks" value={String(products.length)} />
        <StatCard label="Published" value={String(publishedCount)} />
        <StatCard label="Drafts" value={String(draftCount)} />
        <StatCard label="Collections" value={String(collections.length)} />
      </div>

      <div className="mt-12 flex flex-col gap-4 sm:flex-row">
        <Link
          href="/admin/products/new"
          className="inline-flex items-center justify-center border border-[#111111] bg-[#111111] px-8 py-3.5 text-[11px] uppercase tracking-[0.18em] text-white transition-colors duration-300 hover:bg-transparent hover:text-[#111111]"
        >
          New artwork
        </Link>
        <Link
          href="/admin/products"
          className="inline-flex items-center justify-center border border-[#ECE8E2] px-8 py-3.5 text-[11px] uppercase tracking-[0.18em] text-[#111111] transition-colors hover:border-[#111111]"
        >
          View artworks
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
