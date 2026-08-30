import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
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
  const volumeLabel =
    volumes.length === 1 ? "1 volume" : `${volumes.length} volumes`;

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

      <section className="border-b border-[#ECE8E2]">
        <div className="mx-auto max-w-7xl px-6 pt-10 pb-12 md:pt-14 md:pb-16 lg:px-10">
          <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-x-16 xl:gap-x-20">
            <div className="max-w-xl">
              <p className="text-[11px] font-normal uppercase tracking-[0.44em] text-neutral-500">
                Levitaeo {collection.title}
              </p>

              <h1 className="mt-6 text-[2.25rem] font-light leading-[1.1] tracking-[-0.02em] sm:text-4xl lg:text-[3.25rem] lg:leading-[1.06]">
                {collection.title}
              </h1>

              <p className="mt-6 text-[15px] leading-7 text-neutral-600 sm:text-base sm:leading-8">
                {collection.description}
              </p>

              {volumes.length > 0 ? (
                <p className="mt-8 text-[12px] tracking-[0.1em] text-neutral-500">
                  {volumeLabel}
                </p>
              ) : null}
            </div>

            <div className="group relative mx-auto w-full max-w-[440px] lg:mx-0 lg:max-w-none lg:justify-self-end">
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[3px] border border-[#E8E4DE]">
                <Image
                  src={collection.image}
                  alt={`Levitaeo ${collection.title} collection artwork`}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                />
              </div>

              <div className="absolute bottom-5 left-5 border border-[#ECE8E2] bg-[#FAFAF8] px-4 py-3 lg:bottom-8 lg:left-8">
                <p className="text-[10px] uppercase tracking-[0.38em] text-neutral-500">
                  Levitaeo {collection.title}
                </p>
                <p className="mt-1.5 text-[11px] tracking-[0.12em] text-[#111111]">
                  COLLECTION
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        className="mx-auto max-w-7xl px-6 py-12 md:py-16 lg:px-10"
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
          <div className="mt-12 grid gap-12 md:grid-cols-2 md:gap-x-10 md:gap-y-16">
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
          <p className="mt-12 text-[15px] leading-7 text-neutral-600">
            {isActive
              ? "Volumes for this collection are being prepared."
              : "This collection is coming soon."}
          </p>
        )}
      </section>

      <Newsletter />
      <Footer />
    </main>
  );
}
