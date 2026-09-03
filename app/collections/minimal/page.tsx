import type { Metadata } from "next";
import { notFound } from "next/navigation";
import MinimalCollectionPage from "@/components/collections/minimal/MinimalCollectionPage";
import Footer from "@/components/Footer";
import NavbarWithAuth from "@/components/NavbarWithAuth";
import JsonLd from "@/components/JsonLd";
import {
  getCollectionListingPath,
  getPublicCollectionBySlug,
} from "@/lib/catalog/collections-public";
import { getProductsByCollection } from "@/lib/products-db";
import { collectionPageJsonLd, createPageMetadata } from "@/lib/seo";

export const revalidate = 300;

const MINIMAL_SLUG = "minimal";

const minimalDescription =
  "Studies in proportion, restraint, negative space and visual balance.";

export const metadata: Metadata = createPageMetadata({
  title: "Minimal",
  description: minimalDescription,
  path: "/collections/minimal",
  image: "/images/collections/minimal-cover.png",
});

export default async function MinimalCollectionRoute() {
  const collection = await getPublicCollectionBySlug(MINIMAL_SLUG);

  if (!collection) {
    notFound();
  }

  const editions = await getProductsByCollection(MINIMAL_SLUG);

  return (
    <main className="overflow-x-hidden bg-[#FAFAF8] text-[#111111]">
      <JsonLd
        data={collectionPageJsonLd({
          name: `Levitaeo ${collection.title}`,
          description: minimalDescription,
          path: getCollectionListingPath(collection),
        })}
      />
      <NavbarWithAuth />

      <MinimalCollectionPage editions={editions} />

      <Footer />
    </main>
  );
}
