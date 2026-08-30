import "server-only";

import { listPublicEditionsByVolumeId } from "@/lib/catalog/editions-db";
import {
  getPublicVolumeBySlugs,
  listPublicCollections,
  listPublicVolumesByCollectionSlug,
} from "@/lib/catalog/volumes-db";
import type { EditorialHierarchy } from "@/types/catalog";

export async function getPublicCollectionHierarchy(
  collectionSlug: string,
): Promise<EditorialHierarchy | null> {
  const collections = await listPublicCollections();
  const collection = collections.find(
    (row) => row.slug === collectionSlug.trim().toLowerCase(),
  );

  if (!collection) {
    return null;
  }

  const volumes = await listPublicVolumesByCollectionSlug(collection.slug);
  const volumesWithEditions = await Promise.all(
    volumes.map(async (volume) => ({
      ...volume,
      editions: await listPublicEditionsByVolumeId(volume.id),
    })),
  );

  return {
    collection,
    volumes: volumesWithEditions,
  };
}

export async function getPublicVolumeWithEditions(input: {
  collectionSlug: string;
  volumeSlug: string;
}) {
  const volume = await getPublicVolumeBySlugs(input);

  if (!volume) {
    return null;
  }

  const editions = await listPublicEditionsByVolumeId(volume.id);

  return {
    volume,
    editions,
  };
}
