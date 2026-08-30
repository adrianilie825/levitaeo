import { catalogJson } from "@/lib/catalog/api-response";
import { listPublicCollections } from "@/lib/catalog/volumes-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const collections = await listPublicCollections();

  return catalogJson({ collections });
}
