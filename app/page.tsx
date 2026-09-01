import HomeEditorialQuote from "@/components/home/HomeEditorialQuote";
import HomeFeaturedCollections from "@/components/home/HomeFeaturedCollections";
import HomeFeaturedEditions from "@/components/home/HomeFeaturedEditions";
import HomeFooter from "@/components/home/HomeFooter";
import HomeHero from "@/components/home/HomeHero";
import HomeLatestVolume from "@/components/home/HomeLatestVolume";
import JsonLd from "@/components/JsonLd";
import NavbarWithAuth from "@/components/NavbarWithAuth";
import {
  getHeroCollectionTiles,
  getHomepageCollections,
  getHomepageFeaturedEditions,
  getHomepageLatestVolume,
} from "@/lib/home/homepage-data";
import { createPageMetadata, homePageJsonLd } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const metadata = createPageMetadata({
  title: siteConfig.tagline,
  path: "/",
});

export default async function Home() {
  const [collections, latestVolume, editions] = await Promise.all([
    getHomepageCollections(),
    getHomepageLatestVolume(),
    getHomepageFeaturedEditions(),
  ]);

  const latestVolumeHref =
    latestVolume?.href ?? "/collections/originals/originals-series";

  const heroCollections = getHeroCollectionTiles(collections);
  const featuredEdition = editions[0]
    ? {
        title: editions[0].title,
        href: editions[0].href,
        edition: editions[0].edition,
      }
    : null;

  return (
    <main className="bg-[#FAFAF8] text-[#111111]">
      <JsonLd
        data={homePageJsonLd({
          collections: collections.map((collection) => ({
            title: collection.title,
            href: collection.href,
          })),
          editions,
        })}
      />
      <NavbarWithAuth />

      <HomeHero
        latestVolumeHref={latestVolumeHref}
        heroCollections={heroCollections}
        featuredEdition={featuredEdition}
      />

      <HomeFeaturedCollections collections={collections} />

      {latestVolume ? <HomeLatestVolume volume={latestVolume} /> : null}

      <HomeFeaturedEditions editions={editions} />

      <HomeEditorialQuote />

      <HomeFooter />
    </main>
  );
}
