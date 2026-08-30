import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CollectionHero from "@/components/catalog/CollectionHero";
import EditorialEmptyState from "@/components/catalog/EditorialEmptyState";
import Footer from "@/components/Footer";
import NavbarWithAuth from "@/components/NavbarWithAuth";
import Newsletter from "@/components/Newsletter";
import VolumeCard from "@/components/VolumeCard";
import JsonLd from "@/components/JsonLd";
import {
  getPublicCollectionBySlug,
  getPublicCollectionsWithStats,
  getCollectionListingPath,
  listPublicVolumesForCollection,
} from "@/lib/catalog/collections-public";
import { collectionPageJsonLd, createPageMetadata } from "@/lib/seo";

export const revalidate = 300;

type PageProps = {
  params: Promise<{ collectionSlug: string }>;
};

export async function generateStaticParams() {
  const collections = await getPublicCollectionsWithStats();

  return collections.map((collection) => ({
    collectionSlug: collection.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { collectionSlug } = await params;
  const collection = await getPublicCollectionBySlug(collectionSlug);

  if (!collection) {
    return {
      title: "Collection Not Found",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return createPageMetadata({
    title: collection.title,
    description: collection.description,
    path: getCollectionListingPath(collection),
    image: collection.image,
  });
}

export default async function CollectionVolumesPage({ params }: PageProps) {
  const { collectionSlug } = await params;
  const collection = await getPublicCollectionBySlug(collectionSlug);

  if (!collection) {
    notFound();
  }

  const volumes = await listPublicVolumesForCollection(collection.slug);
  const isActive = collection.status === "active";
  const editionCount = volumes.reduce(
    (total, volume) => total + volume.editionCount,
    0,
  );

  return (
    <main className="bg-[#FAFAF8] text-[#111111]">
      <JsonLd
        data={collectionPageJsonLd({
          name: `Levitaeo ${collection.title}`,
          description: collection.description,
          path: getCollectionListingPath(collection),
        })}
      />
      <NavbarWithAuth />

      <CollectionHero
        collection={collection}
        volumeCount={volumes.length}
        editionCount={editionCount}
      />

      <section
        className="mx-auto max-w-7xl px-6 py-14 md:py-20 lg:px-10"
        aria-labelledby="volumes-heading"
      >
        <div className="max-w-2xl">
          <p className="text-[11px] font-normal uppercase tracking-[0.44em] text-neutral-500">
            The Volumes
          </p>

          <h2
            id="volumes-heading"
            className="mt-5 text-[2rem] font-light leading-[1.12] tracking-[-0.02em] sm:text-3xl"
          >
            Explore the collection.
          </h2>

          <p className="mt-5 text-[15px] leading-7 text-neutral-600 sm:text-base sm:leading-8">
            Each volume groups a focused series of digital editions within{" "}
            {collection.title}.
          </p>
        </div>

        {volumes.length > 0 ? (
          <div className="mt-14 grid gap-14 md:grid-cols-2 md:gap-x-10 md:gap-y-16">
            {volumes.map((volume) => (
              <VolumeCard
                key={volume.id}
                volume={volume}
                collectionTitle={collection.title}
                collectionActive={isActive}
              />
            ))}
          </div>
        ) : (
          <EditorialEmptyState
            eyebrow="The Volumes"
            title={
              isActive
                ? "Volumes are being prepared."
                : "This collection is coming soon."
            }
            description={
              isActive
                ? "A new editorial series for this collection is currently in development."
                : "Sign up for the journal to hear when this collection opens."
            }
          />
        )}
      </section>

      <Newsletter />
      <Footer />
    </main>
  );
}
