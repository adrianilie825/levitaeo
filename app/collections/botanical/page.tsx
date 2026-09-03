import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BotanicalCollectionPage from "@/components/collections/botanical/BotanicalCollectionPage";
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

const BOTANICAL_SLUG = "botanical";

const botanicalDescription =
  "Botanical compositions shaped by line, repetition, fragility and organic structure.";

export const metadata: Metadata = createPageMetadata({
  title: "Botanical",
  description: botanicalDescription,
  path: "/collections/botanical",
  image: COLLECTION_PRESENTATION.botanical.image,
});

export default async function BotanicalCollectionRoute() {
  const collection = await getPublicCollectionBySlug(BOTANICAL_SLUG);

  if (!collection) {
    notFound();
  }

  const editions = await getProductsByCollection(BOTANICAL_SLUG);
  const heroImage = COLLECTION_PRESENTATION.botanical.image;

  return (
    <main className="overflow-x-hidden bg-[#FAFAF8] text-[#111111]">
      <JsonLd
        data={collectionPageJsonLd({
          name: `Levitaeo ${collection.title}`,
          description: botanicalDescription,
          path: getCollectionListingPath(collection),
        })}
      />
      <NavbarWithAuth />

      <BotanicalCollectionPage heroImage={heroImage} editions={editions} />

      <Footer />
    </main>
  );
}
