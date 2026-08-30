import { catalogJson } from "@/lib/catalog/api-response";
import { listPublicEditionsByVolumeSlugs } from "@/lib/catalog/editions-db";
import { getPublicVolumeBySlugs } from "@/lib/catalog/volumes-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ collectionSlug: string; volumeSlug: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { collectionSlug, volumeSlug } = await context.params;

  const [volume, editions] = await Promise.all([
    getPublicVolumeBySlugs({ collectionSlug, volumeSlug }),
    listPublicEditionsByVolumeSlugs({ collectionSlug, volumeSlug }),
  ]);

  if (!volume) {
    return catalogJson({ error: "Volume not found.", code: "not_found" }, 404);
  }

  return catalogJson({
    collectionSlug,
    volume,
    editions,
  });
}
