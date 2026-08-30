import "server-only";

import {
  COLLECTION_PRESENTATION,
  mapCollectionRowToCollection,
} from "@/lib/catalog/collection-presentation";
import { listPublicEditionsByVolumeId } from "@/lib/catalog/editions-db";
import { getCollectionPath, getVolumePath } from "@/lib/catalog/paths";
import {
  listPublicCollections,
  listPublicVolumesByCollectionSlug,
} from "@/lib/catalog/volumes-db";
import { collections as fallbackCollections } from "@/lib/collections";
import { isSupabasePublicConfigured } from "@/lib/supabase/env";
import type { Volume } from "@/types/catalog";
import type { Collection } from "@/types/collection";

export type PublicVolumeSummary = Volume & {
  editionCount: number;
  href: string;
};

export function isBrowsableVolumeSlug(slug: string): boolean {
  return !slug.endsWith("-default");
}

export async function getPublicCollectionsWithStats(): Promise<Collection[]> {
  if (!isSupabasePublicConfigured()) {
    return fallbackCollections.map((collection) => ({
      ...collection,
      volumeCount: collection.slug === "originals" ? 1 : 0,
    }));
  }

  const rows = await listPublicCollections();

  return Promise.all(
    rows.map(async (row) => {
      const volumes = await listPublicVolumesByCollectionSlug(row.slug);
      const browsableVolumeCount = volumes.filter((volume) =>
        isBrowsableVolumeSlug(volume.slug),
      ).length;

      return mapCollectionRowToCollection(row, browsableVolumeCount);
    }),
  );
}

export async function getFeaturedPublicCollections(): Promise<Collection[]> {
  const collections = await getPublicCollectionsWithStats();

  return collections
    .filter((collection) => collection.featured)
    .sort((a, b) => a.order - b.order);
}

export async function getPublicCollectionBySlug(
  collectionSlug: string,
): Promise<Collection | null> {
  const normalizedSlug = collectionSlug.trim().toLowerCase();
  const collections = await getPublicCollectionsWithStats();

  return collections.find((collection) => collection.slug === normalizedSlug) ?? null;
}

export async function listPublicVolumesForCollection(
  collectionSlug: string,
): Promise<PublicVolumeSummary[]> {
  const normalizedSlug = collectionSlug.trim().toLowerCase();

  if (!normalizedSlug) {
    return [];
  }

  if (!isSupabasePublicConfigured()) {
    if (normalizedSlug !== "originals") {
      return [];
    }

    return [
      {
        id: "fallback-originals-series",
        collection_id: "fallback",
        slug: "originals-series",
        name: "Originals Series",
        description:
          "A focused series of limited digital editions shaped by contrast, balance, atmosphere, and visual restraint.",
        sort_order: 1,
        created_at: new Date(0).toISOString(),
        collection: {
          id: "fallback",
          slug: "originals",
          name: "Originals",
        },
        editionCount: 6,
        href: getVolumePath("originals", "originals-series"),
      },
    ];
  }

  const volumes = await listPublicVolumesByCollectionSlug(normalizedSlug);

  const summaries = await Promise.all(
    volumes
      .filter((volume) => isBrowsableVolumeSlug(volume.slug))
      .map(async (volume) => {
        const editions = await listPublicEditionsByVolumeId(volume.id);

        return {
          ...volume,
          editionCount: editions.length,
          href: getVolumePath(normalizedSlug, volume.slug),
        };
      }),
  );

  return summaries.filter((volume) => volume.editionCount > 0 || isCollectionComingSoon(normalizedSlug));
}

function isCollectionComingSoon(collectionSlug: string): boolean {
  return COLLECTION_PRESENTATION[collectionSlug]?.status === "coming-soon";
}

export async function resolveCollectionSegment(input: {
  collectionSlug: string;
  segment: string;
}): Promise<
  | { kind: "volume"; volume: PublicVolumeSummary }
  | { kind: "edition"; editionSlug: string }
  | null
> {
  const collectionSlug = input.collectionSlug.trim().toLowerCase();
  const segment = input.segment.trim().toLowerCase();

  const volumes = await listPublicVolumesForCollection(collectionSlug);
  const volume = volumes.find((item) => item.slug === segment);

  if (volume) {
    return { kind: "volume", volume };
  }

  return { kind: "edition", editionSlug: segment };
}

export function getCollectionListingPath(collection: Pick<Collection, "slug">) {
  return getCollectionPath(collection.slug);
}
