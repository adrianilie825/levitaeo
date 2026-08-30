import type { Metadata } from "next";
import { notFound } from "next/navigation";
import EditionPageContent from "@/components/catalog/EditionPageContent";
import EditionCard from "@/components/catalog/EditionCard";
import EditorialEmptyState from "@/components/catalog/EditorialEmptyState";
import VolumeHeader from "@/components/catalog/VolumeHeader";
import Footer from "@/components/Footer";
import NavbarWithAuth from "@/components/NavbarWithAuth";
import Newsletter from "@/components/Newsletter";
import JsonLd from "@/components/JsonLd";
import { getAuthenticatedUser } from "@/lib/auth";
import {
  getPublicCollectionBySlug,
  getPublicCollectionsWithStats,
  listPublicVolumesForCollection,
  resolveCollectionSegment,
} from "@/lib/catalog/collections-public";
import { getVolumePath } from "@/lib/catalog/paths";
import {
  getProductBySlug,
  getProductPath,
  getProductsByCollection,
  getProductsByVolume,
} from "@/lib/products-db";
import { userOwnsActiveProduct } from "@/lib/purchases/ownership";
import { collectionPageJsonLd, createPageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const revalidate = 300;

type PageProps = {
  params: Promise<{ collectionSlug: string; slug: string }>;
};

export async function generateStaticParams() {
  const collections = await getPublicCollectionsWithStats();
  const params: Array<{ collectionSlug: string; slug: string }> = [];

  for (const collection of collections) {
    const volumes = await listPublicVolumesForCollection(collection.slug);

    for (const volume of volumes) {
      params.push({
        collectionSlug: collection.slug,
        slug: volume.slug,
      });
    }

    if (collection.status === "active") {
      const products = await getProductsByCollection(collection.slug);

      for (const product of products) {
        params.push({
          collectionSlug: collection.slug,
          slug: product.slug,
        });
      }
    }
  }

  return params;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { collectionSlug, slug } = await params;
  const resolved = await resolveCollectionSegment({ collectionSlug, segment: slug });

  if (resolved?.kind === "volume") {
    const collection = await getPublicCollectionBySlug(collectionSlug);

    if (!collection) {
      return {
        title: "Volume Not Found",
        robots: { index: false, follow: false },
      };
    }

    return createPageMetadata({
      title: `${resolved.volume.name} — ${collection.title}`,
      description: resolved.volume.description,
      path: getVolumePath(collection.slug, resolved.volume.slug),
    });
  }

  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Edition Not Found",
      robots: { index: false, follow: false },
    };
  }

  const description =
    product.description?.trim() ||
    product.subtitle?.trim() ||
    siteConfig.description;

  return createPageMetadata({
    title: product.title,
    description,
    path: getProductPath(product),
    image: product.image,
  });
}

export default async function CollectionSegmentPage({ params }: PageProps) {
  const { collectionSlug, slug } = await params;
  const collection = await getPublicCollectionBySlug(collectionSlug);

  if (!collection) {
    notFound();
  }

  const resolved = await resolveCollectionSegment({ collectionSlug, segment: slug });

  if (!resolved) {
    notFound();
  }

  if (resolved.kind === "edition") {
    const product = await getProductBySlug(resolved.editionSlug);

    if (!product || product.collectionSlug !== collection.slug) {
      notFound();
    }

    return <EditionPageContent product={product} />;
  }

  const { volume } = resolved;
  const editions = await getProductsByVolume(collection.slug, volume.slug);
  const authenticatedUser = await getAuthenticatedUser();
  const editionsWithOwnership = await Promise.all(
    editions.map(async (product) => ({
      product,
      isOwned: authenticatedUser
        ? await userOwnsActiveProduct({
            userId: authenticatedUser.id,
            productSlug: product.slug,
            productId: product.id,
          })
        : false,
    })),
  );
  const coverImage =
    volume.coverImage ?? editions[0]?.image ?? collection.image;

  return (
    <main className="bg-[#FAFAF8] text-[#111111]">
      <JsonLd
        data={collectionPageJsonLd({
          name: `${volume.name} — Levitaeo ${collection.title}`,
          description: volume.description,
          path: getVolumePath(collection.slug, volume.slug),
        })}
      />
      <NavbarWithAuth />

      <VolumeHeader
        collection={collection}
        volumeName={volume.name}
        volumeDescription={volume.description}
        coverImage={coverImage}
        editionCount={volume.editionCount}
      />

      <section
        className="mx-auto max-w-7xl px-6 py-14 md:py-20 lg:px-10"
        aria-labelledby="editions-heading"
      >
        <div className="max-w-2xl">
          <p className="text-[11px] font-normal uppercase tracking-[0.44em] text-neutral-500">
            The Editions
          </p>

          <h2
            id="editions-heading"
            className="mt-5 text-[2rem] font-light leading-[1.12] tracking-[-0.02em] sm:text-3xl"
          >
            Explore the volume.
          </h2>

          <p className="mt-5 text-[15px] leading-7 text-neutral-600 sm:text-base sm:leading-8">
            A focused series of digital works, each developed as a distinct
            visual edition.
          </p>
        </div>

        {editionsWithOwnership.length > 0 ? (
          <div className="mt-14 grid grid-cols-1 gap-12 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-14 lg:grid-cols-3 lg:gap-x-10 lg:gap-y-16">
            {editionsWithOwnership.map(({ product, isOwned }) => (
              <EditionCard
                key={product.slug}
                product={product}
                isAuthenticated={Boolean(authenticatedUser)}
                isOwned={isOwned}
              />
            ))}
          </div>
        ) : (
          <EditorialEmptyState
            eyebrow="The Editions"
            title="New editions are currently being curated."
            description="This volume will soon feature a focused series of digital works developed with editorial restraint."
          />
        )}
      </section>

      <Newsletter />
      <Footer />
    </main>
  );
}
