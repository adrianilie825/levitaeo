export type CollectionStatus = "active" | "coming-soon";

export type Collection = {
  slug: string;
  title: string;
  description: string;
  shortDescription: string;
  image: string;
  href: string;
  status: CollectionStatus;
  featured: boolean;
  order: number;
};
