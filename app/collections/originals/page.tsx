import type { Metadata } from "next";
import { notFound } from "next/navigation";
import OriginalsCollectionPage from "@/components/collections/originals/OriginalsCollectionPage";
import Footer from "@/components/Footer";
import NavbarWithAuth from "@/components/NavbarWithAuth";
import JsonLd from "@/components/JsonLd";
import { COLLECTION_PRESENTATION } from "@/lib/catalog/collection-presentation";
import {
  getCollectionListingPath,
  getPublicCollectionBySlug,
} from "@/lib/catalog/collections-public";
import { getProductsByCollection } from "@/lib/products-db";
import { collectionPageJsonLd, createPageMetadata } from "@/lib/seo";

export const revalidate = 300;

const ORIGINALS_SLUG = "originals";

const originalsDescription =
  "Limited digital editions created as individual works rather than recurring series.";

export const metadata: Metadata = createPageMetadata({
  title: "Originals",
  description: originalsDescription,
  path: "/collections/originals",
  image: COLLECTION_PRESENTATION.originals.image,
});

export default async function OriginalsCollectionRoute() {
  const collection = await getPublicCollectionBySlug(ORIGINALS_SLUG);

  if (!collection) {
    notFound();
  }

  const editions = await getProductsByCollection(ORIGINALS_SLUG);
  const heroImage = COLLECTION_PRESENTATION.originals.image;

  return (
    <main className="overflow-x-hidden bg-[#FAFAF8] text-[#111111]">
      <JsonLd
        data={collectionPageJsonLd({
          name: `Levitaeo ${collection.title}`,
          description: originalsDescription,
          path: getCollectionListingPath(collection),
        })}
      />
      <NavbarWithAuth />

      <OriginalsCollectionPage heroImage={heroImage} editions={editions} />

      <Footer />
    </main>
  );
}
