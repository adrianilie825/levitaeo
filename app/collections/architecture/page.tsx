import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ArchitectureCollectionPage from "@/components/collections/architecture/ArchitectureCollectionPage";
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

const ARCHITECTURE_SLUG = "architecture";

const architectureDescription =
  "Architectural studies shaped by geometry, proportion, material and light.";

export const metadata: Metadata = createPageMetadata({
  title: "Architecture",
  description: architectureDescription,
  path: "/collections/architecture",
  image: COLLECTION_PRESENTATION.architecture.image,
});

export default async function ArchitectureCollectionRoute() {
  const collection = await getPublicCollectionBySlug(ARCHITECTURE_SLUG);

  if (!collection) {
    notFound();
  }

  const editions = await getProductsByCollection(ARCHITECTURE_SLUG);
  const heroImage = COLLECTION_PRESENTATION.architecture.image;

  return (
    <main className="overflow-x-hidden bg-[#FAFAF8] text-[#111111]">
      <JsonLd
        data={collectionPageJsonLd({
          name: `Levitaeo ${collection.title}`,
          description: architectureDescription,
          path: getCollectionListingPath(collection),
        })}
      />
      <NavbarWithAuth />

      <ArchitectureCollectionPage heroImage={heroImage} editions={editions} />

      <Footer />
    </main>
  );
}
