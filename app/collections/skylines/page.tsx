import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SkylinesCollectionPage from "@/components/collections/skylines/SkylinesCollectionPage";
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

const SKYLINES_SLUG = "skylines";

const skylinesDescription =
  "Graphic studies of urban identity, silhouette, rhythm and scale.";

export const metadata: Metadata = createPageMetadata({
  title: "Skylines",
  description: skylinesDescription,
  path: "/collections/skylines",
  image: "/images/collections/skylines-clean.png",
});

export default async function SkylinesCollectionRoute() {
  const collection = await getPublicCollectionBySlug(SKYLINES_SLUG);

  if (!collection) {
    notFound();
  }

  const editions = await getProductsByCollection(SKYLINES_SLUG);

  return (
    <main className="overflow-x-hidden bg-[#FAFAF8] text-[#111111]">
      <JsonLd
        data={collectionPageJsonLd({
          name: `Levitaeo ${collection.title}`,
          description: skylinesDescription,
          path: getCollectionListingPath(collection),
        })}
      />
      <NavbarWithAuth />

      <SkylinesCollectionPage editions={editions} />

      <Footer />
    </main>
  );
}
