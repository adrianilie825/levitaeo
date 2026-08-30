import "server-only";

/**
 * Canonical URL builders for the editorial hierarchy.
 * UI routes are not implemented yet; these paths are the target structure.
 */

export function getCollectionPath(collectionSlug: string): string {
  return `/collections/${collectionSlug}`;
}

export function getVolumePath(collectionSlug: string, volumeSlug: string): string {
  return `/collections/${collectionSlug}/${volumeSlug}`;
}

export function getEditionPath(
  collectionSlug: string,
  volumeSlug: string,
  editionSlug: string,
): string {
  return `/collections/${collectionSlug}/${volumeSlug}/${editionSlug}`;
}

/** Legacy two-segment path kept for existing routes during transition. */
export function getLegacyEditionPath(collectionSlug: string, editionSlug: string): string {
  return `/collections/${collectionSlug}/${editionSlug}`;
}

export function getEditionPathFromHierarchy(input: {
  collectionSlug: string;
  volumeSlug: string;
  editionSlug: string;
  preferLegacy?: boolean;
}): string {
  if (input.preferLegacy) {
    return getLegacyEditionPath(input.collectionSlug, input.editionSlug);
  }

  return getEditionPath(input.collectionSlug, input.volumeSlug, input.editionSlug);
}
