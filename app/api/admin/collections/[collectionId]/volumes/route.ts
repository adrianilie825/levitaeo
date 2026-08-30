import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/auth";
import { listAdminVolumes } from "@/lib/admin/volumes";
import { isValidProductUuid } from "@/lib/storage/admin-artwork-storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ collectionId: string }>;
};

function adminJson(body: Record<string, unknown>, status: number) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function GET(_request: Request, context: RouteContext) {
  const admin = await requireAdminApi();

  if (!admin) {
    return adminJson({ error: "Unauthorized.", code: "unauthorized" }, 401);
  }

  const { collectionId } = await context.params;

  if (!isValidProductUuid(collectionId)) {
    return adminJson(
      { error: "Invalid collection.", code: "invalid_collection" },
      400,
    );
  }

  const volumes = await listAdminVolumes(collectionId);

  return adminJson({ collectionId, volumes }, 200);
}
