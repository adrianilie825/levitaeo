import type { Metadata } from "next";
import CollectionForm from "@/components/admin/CollectionForm";
import { listAdminCollections } from "@/lib/admin/catalog";

export const metadata: Metadata = {
  title: "Collections",
};

export default async function AdminCollectionsPage() {
  const collections = await listAdminCollections();

  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.32em] text-neutral-500">
        Catalog
      </p>
      <h1 className="mt-4 text-3xl font-light tracking-[-0.02em] sm:text-4xl">
        Collections
      </h1>
      <p className="mt-4 max-w-2xl text-[15px] leading-7 text-neutral-600">
        Edit collection names, descriptions, and sort order. Slugs are read-only
        in this sprint.
      </p>

      <div className="mt-10 space-y-6">
        {collections.map((collection) => (
          <CollectionForm key={collection.id} collection={collection} />
        ))}
      </div>
    </div>
  );
}
