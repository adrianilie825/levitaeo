import CollectionCard from "@/components/CollectionCard";
import { getFeaturedPublicCollections } from "@/lib/catalog/collections-public";

export default async function FeaturedCollections() {
  const collections = await getFeaturedPublicCollections();

  return (
    <section className="mx-auto max-w-7xl px-6 pt-10 pb-14 md:pt-14 md:pb-20 lg:px-10">
      <div className="mb-14">
        <p className="text-sm uppercase tracking-[0.35em] text-neutral-500">
          Collections
        </p>

        <h2 className="mt-4 text-6xl font-light">Featured Collections</h2>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {collections.map((collection) => (
          <CollectionCard
            key={collection.slug}
            collection={collection}
            variant="featured"
          />
        ))}
      </div>
    </section>
  );
}
