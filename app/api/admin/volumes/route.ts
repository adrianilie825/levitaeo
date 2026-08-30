import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/auth";
import {
  createAdminVolume,
  isVolumeSlugTaken,
  listAdminVolumes,
  parseVolumeWriteBody,
} from "@/lib/admin/volumes";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function adminJson(body: Record<string, unknown>, status: number) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function GET(request: Request) {
  const admin = await requireAdminApi();

  if (!admin) {
    return adminJson({ error: "Unauthorized.", code: "unauthorized" }, 401);
  }

  const { searchParams } = new URL(request.url);
  const collectionId = searchParams.get("collectionId") ?? undefined;
  const volumes = await listAdminVolumes(collectionId);

  return adminJson({ volumes }, 200);
}

export async function POST(request: Request) {
  const admin = await requireAdminApi();

  if (!admin) {
    return adminJson({ error: "Unauthorized.", code: "unauthorized" }, 401);
  }

  let body: Record<string, unknown>;

  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return adminJson({ error: "Invalid JSON body.", code: "invalid_body" }, 400);
  }

  const parsed = parseVolumeWriteBody(body);

  if (!parsed.input) {
    return adminJson(
      { error: parsed.error ?? "Invalid volume payload.", code: "validation_error" },
      400,
    );
  }

  if (await isVolumeSlugTaken(parsed.input.collection_id, parsed.input.slug)) {
    return adminJson(
      {
        error: "This volume slug is already used in the collection.",
        code: "slug_taken",
      },
      409,
    );
  }

  try {
    const volume = await createAdminVolume(parsed.input);
    return adminJson({ volume }, 201);
  } catch {
    return adminJson(
      { error: "The volume could not be created.", code: "create_failed" },
      500,
    );
  }
}
