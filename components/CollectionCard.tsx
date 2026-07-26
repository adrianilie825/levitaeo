import Image from "next/image";
import Link from "next/link";
import type { Collection } from "@/types/collection";

const featuredAccents: Record<string, string> = {
  originals: "Gold",
  skylines: "Silver",
  nature: "Sand",
  minimal: "White",
};

type CollectionCardProps = {
  collection: Collection;
  variant?: "featured" | "grid";
};

export default function CollectionCard({
  collection,
  variant = "grid",
}: CollectionCardProps) {
  const isActive = collection.status === "active";

  if (variant === "featured") {
    return (
      <FeaturedCollectionCard collection={collection} isActive={isActive} />
    );
  }

  return <GridCollectionCard collection={collection} isActive={isActive} />;
}

function FeaturedCollectionCard({
  collection,
  isActive,
}: {
  collection: Collection;
  isActive: boolean;
}) {
  const accent = featuredAccents[collection.slug] ?? "Edition";
  const content = (
    <>
      <Image
        src={collection.image}
        alt={`${collection.title} collection`}
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        className={`object-cover transition duration-700 ${
          isActive ? "group-hover:scale-105" : "group-hover:scale-[1.02]"
        }`}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

      <div className="absolute bottom-10 left-10 right-10">
        <div className="mb-3 text-xs uppercase tracking-[0.35em] text-white/70">
          {accent}
        </div>

        <h3 className="text-4xl font-light text-white">{collection.title}</h3>

        <p className="mt-3 max-w-sm text-white/80">
          {collection.shortDescription}
        </p>

        <div
          className={`mt-8 text-white ${
            isActive ? "transition group-hover:translate-x-2" : ""
          }`}
        >
          {isActive ? "View Collection →" : "Coming Soon"}
        </div>
      </div>
    </>
  );

  if (isActive) {
    return (
      <Link
        href={collection.href}
        aria-label={`View ${collection.title} collection`}
        className="group relative block h-[470px] cursor-pointer overflow-hidden rounded-[34px]"
      >
        {content}
      </Link>
    );
  }

  return (
    <article className="group relative h-[470px] cursor-default overflow-hidden rounded-[34px]">
      {content}
    </article>
  );
}

function GridCollectionCard({
  collection,
  isActive,
}: {
  collection: Collection;
  isActive: boolean;
}) {
  const imageBlock = (
    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[3px]">
      <Image
        src={collection.image}
        alt={`${collection.title} collection`}
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        className={`object-cover transition-transform duration-700 ease-out ${
          isActive ? "group-hover:scale-[1.03]" : "group-hover:scale-[1.02]"
        }`}
      />
    </div>
  );

  const meta = (
    <>
      <h2 className="mt-5 text-2xl font-light tracking-[-0.01em] sm:text-[1.75rem]">
        {isActive ? (
          <Link
            href={collection.href}
            className="transition-colors hover:text-neutral-600"
          >
            {collection.title}
          </Link>
        ) : (
          <span>{collection.title}</span>
        )}
      </h2>

      <p className="mt-3 max-w-md text-[15px] leading-7 text-neutral-600">
        {collection.description}
      </p>

      {isActive ? (
        <Link
          href={collection.href}
          className="mt-5 inline-block text-[12px] tracking-[0.1em] text-neutral-600 underline-offset-4 transition-colors hover:text-[#111111] hover:underline"
        >
          Explore Collection
        </Link>
      ) : (
        <p className="mt-5 text-[12px] tracking-[0.1em] text-neutral-500">
          Coming Soon
        </p>
      )}
    </>
  );

  if (isActive) {
    return (
      <article className="group transition-transform duration-300 ease-out hover:-translate-y-1">
        <Link
          href={collection.href}
          className="block overflow-hidden rounded-[3px]"
          aria-label={`View ${collection.title} collection`}
        >
          {imageBlock}
        </Link>
        {meta}
      </article>
    );
  }

  return (
    <article className="group cursor-default transition-transform duration-300 ease-out">
      {imageBlock}
      {meta}
    </article>
  );
}
