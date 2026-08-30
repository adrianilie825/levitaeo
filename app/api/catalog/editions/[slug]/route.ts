import { catalogJson } from "@/lib/catalog/api-response";
import { getPublicEditionBySlug } from "@/lib/catalog/editions-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const edition = await getPublicEditionBySlug(slug);

  if (!edition) {
    return catalogJson({ error: "Edition not found.", code: "not_found" }, 404);
  }

  return catalogJson({ edition });
}
