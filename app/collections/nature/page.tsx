import type { Metadata } from "next";
import { notFound } from "next/navigation";
import NatureCollectionPage from "@/components/collections/nature/NatureCollectionPage";
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

const NATURE_SLUG = "nature";

const natureDescription =
  "Atmospheric studies of land, weather, texture and natural rhythm.";

export const metadata: Metadata = createPageMetadata({
  title: "Nature",
  description: natureDescription,
  path: "/collections/nature",
  image: COLLECTION_PRESENTATION.nature.image,
});

export default async function NatureCollectionRoute() {
  const collection = await getPublicCollectionBySlug(NATURE_SLUG);

  if (!collection) {
    notFound();
  }

  const editions = await getProductsByCollection(NATURE_SLUG);
  const heroImage = COLLECTION_PRESENTATION.nature.image;

  return (
    <main className="overflow-x-hidden bg-[#FAFAF8] text-[#111111]">
      <JsonLd
        data={collectionPageJsonLd({
          name: `Levitaeo ${collection.title}`,
          description: natureDescription,
          path: getCollectionListingPath(collection),
        })}
      />
      <NavbarWithAuth />

      <NatureCollectionPage heroImage={heroImage} editions={editions} />

      <Footer />
    </main>
  );
}
