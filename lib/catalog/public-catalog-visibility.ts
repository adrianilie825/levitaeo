import "server-only";

/**
 * Public catalog visibility for browsable editions (products).
 *
 * Primary visibility is enforced in Supabase RLS (`published` | `coming_soon`).
 * This helper excludes internal QA fixtures that were left in a browsable status
 * so they never surface on visitor-facing catalog, search, or collection pages.
 *
 * Admin catalog queries bypass this layer and use the service-role client directly.
 */

/** Matches slug segments such as `admin-test`, `aurora-test`, or `test-fixture`. */
const INTERNAL_QA_SLUG_PATTERN = /(^|-)test(-|$)/i;

export function isPublicCatalogEdition(input: {
  slug: string;
  title?: string;
}): boolean {
  const slug = input.slug.trim().toLowerCase();

  if (!slug) {
    return false;
  }

  if (INTERNAL_QA_SLUG_PATTERN.test(slug)) {
    return false;
  }

  const title = input.title?.trim() ?? "";

  if (title && /\btest\b/i.test(title)) {
    return false;
  }

  return true;
}

export function filterPublicCatalogEditions<
  T extends { slug: string; title?: string },
>(editions: T[]): T[] {
  return editions.filter((edition) => isPublicCatalogEdition(edition));
}
