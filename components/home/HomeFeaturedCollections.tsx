import Image from "next/image";
import Link from "next/link";
import type { Collection } from "@/types/collection";

type HomeFeaturedCollectionsProps = {
  collections: Collection[];
};

export default function HomeFeaturedCollections({
  collections,
}: HomeFeaturedCollectionsProps) {
  return (
    <section className="border-t border-[#ECE8E2]">
      <div className="mx-auto max-w-[1400px] px-6 py-20 md:py-28 lg:px-12 lg:py-32">
        <p className="text-[11px] uppercase tracking-[0.44em] text-neutral-500">
          Collections
        </p>

        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10">
          {collections.map((collection) => (
            <HomeCollectionCard key={collection.slug} collection={collection} />
          ))}
        </div>
      </div>
    </section>
  );
}

function HomeCollectionCard({ collection }: { collection: Collection }) {
  const isActive = collection.status === "active";

  const card = (
    <article className="group">
      <div className="relative aspect-[4/5] overflow-hidden bg-neutral-100 transition-transform duration-700 ease-out group-hover:-translate-y-0.5">
        <Image
          src={collection.image}
          alt={`${collection.title} collection`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-[800ms] ease-out group-hover:scale-[1.02]"
        />
      </div>

      <h3 className="mt-4 text-[13px] font-normal uppercase tracking-[0.22em] text-[#111111]">
        {collection.title}
      </h3>
    </article>
  );

  if (isActive) {
    return (
      <Link
        href={collection.href}
        aria-label={`View ${collection.title} collection`}
        className="block"
      >
        {card}
      </Link>
    );
  }

  return <div className="cursor-default">{card}</div>;
}
