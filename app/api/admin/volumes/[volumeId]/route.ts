import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/auth";
import {
  deleteAdminVolume,
  getAdminVolumeById,
  isVolumeSlugTaken,
  parseVolumeWriteBody,
  updateAdminVolume,
} from "@/lib/admin/volumes";
import { isValidProductUuid } from "@/lib/storage/admin-artwork-storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ volumeId: string }>;
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

  const { volumeId } = await context.params;

  if (!isValidProductUuid(volumeId)) {
    return adminJson({ error: "Invalid volume.", code: "invalid_volume" }, 400);
  }

  const volume = await getAdminVolumeById(volumeId);

  if (!volume) {
    return adminJson({ error: "Volume not found.", code: "not_found" }, 404);
  }

  return adminJson({ volume }, 200);
}

export async function PATCH(request: Request, context: RouteContext) {
  const admin = await requireAdminApi();

  if (!admin) {
    return adminJson({ error: "Unauthorized.", code: "unauthorized" }, 401);
  }

  const { volumeId } = await context.params;

  if (!isValidProductUuid(volumeId)) {
    return adminJson({ error: "Invalid volume.", code: "invalid_volume" }, 400);
  }

  const existing = await getAdminVolumeById(volumeId);

  if (!existing) {
    return adminJson({ error: "Volume not found.", code: "not_found" }, 404);
  }

  let body: Record<string, unknown>;

  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return adminJson({ error: "Invalid JSON body.", code: "invalid_body" }, 400);
  }

  const parsed = parseVolumeWriteBody({
    ...body,
    collectionId: body.collectionId ?? body.collection_id ?? existing.collection_id,
  });

  if (!parsed.input) {
    return adminJson(
      { error: parsed.error ?? "Invalid volume payload.", code: "validation_error" },
      400,
    );
  }

  if (
    await isVolumeSlugTaken(
      parsed.input.collection_id,
      parsed.input.slug,
      volumeId,
    )
  ) {
    return adminJson(
      {
        error: "This volume slug is already used in the collection.",
        code: "slug_taken",
      },
      409,
    );
  }

  try {
    const volume = await updateAdminVolume(volumeId, parsed.input);
    return adminJson({ volume }, 200);
  } catch {
    return adminJson(
      { error: "The volume could not be updated.", code: "update_failed" },
      500,
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const admin = await requireAdminApi();

  if (!admin) {
    return adminJson({ error: "Unauthorized.", code: "unauthorized" }, 401);
  }

  const { volumeId } = await context.params;

  if (!isValidProductUuid(volumeId)) {
    return adminJson({ error: "Invalid volume.", code: "invalid_volume" }, 400);
  }

  try {
    await deleteAdminVolume(volumeId);
    return adminJson({ deleted: true }, 200);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "The volume could not be deleted.";

    return adminJson({ error: message, code: "delete_failed" }, 409);
  }
}
