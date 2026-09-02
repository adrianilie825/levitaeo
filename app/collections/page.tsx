import CollectionsDiscovery from "@/components/collections/CollectionsDiscovery";
import Footer from "@/components/Footer";
import NavbarWithAuth from "@/components/NavbarWithAuth";
import JsonLd from "@/components/JsonLd";
import { getCollectionsDiscoveryPageData } from "@/lib/catalog/collections-page-data";
import { collectionPageJsonLd, createPageMetadata } from "@/lib/seo";

const collectionsDescription =
  "Explore Levitaeo through architecture, nature, botanical studies, minimal compositions, city skylines and limited originals.";

export const metadata = createPageMetadata({
  title: "Collections",
  description: collectionsDescription,
  path: "/collections",
});

export default async function CollectionsPage() {
  const { collections, originalsGallery } =
    await getCollectionsDiscoveryPageData();

  return (
    <main className="overflow-x-hidden bg-[#FAFAF8] text-[#111111]">
      <JsonLd
        data={collectionPageJsonLd({
          name: "Levitaeo Collections",
          description: collectionsDescription,
          path: "/collections",
        })}
      />
      <NavbarWithAuth />

      <CollectionsDiscovery
        collections={collections}
        originalsGallery={originalsGallery}
      />

      <Footer />
    </main>
  );
}
