import { catalogJson } from "@/lib/catalog/api-response";
import { listPublicVolumesByCollectionSlug } from "@/lib/catalog/volumes-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ collectionSlug: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { collectionSlug } = await context.params;
  const volumes = await listPublicVolumesByCollectionSlug(collectionSlug);

  return catalogJson({
    collectionSlug,
    volumes,
  });
}
