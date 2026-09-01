/** Plain serializable props for homepage UI — safe for Server and Client Components. */

export type HeroCollectionTile = {
  slug: string;
  title: string;
  href: string;
  image: string;
};

export type HeroFeaturedEdition = {
  title: string;
  href: string;
  edition: string;
};

export type HomepageEdition = {
  slug: string;
  title: string;
  edition: string;
  image: string;
  description: string;
  collection: string;
  href: string;
  priceLabel: string;
};

export type HomeVolumeSummary = {
  name: string;
  description: string;
  href: string;
  coverImage?: string;
  editionCount?: number;
  collectionName?: string;
};
