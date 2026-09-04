import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/auth";
import { validateJournalCoverFileMeta } from "@/lib/admin/journal-cover-validation";
import {
  clearAdminJournalCover,
  getAdminJournalPostById,
  updateAdminJournalCoverUrl,
} from "@/lib/admin/journal";
import { revalidateJournal } from "@/lib/admin/revalidate-journal";
import { generateDownloadVersion } from "@/lib/downloads/upload-validation";
import {
  buildJournalCoverStoragePath,
  deleteJournalCoverFile,
  extractJournalCoverStoragePathFromUrl,
  uploadJournalCoverFile,
} from "@/lib/storage/admin-journal-cover-storage";
import { isValidProductUuid } from "@/lib/storage/admin-artwork-storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

type RouteContext = {
  params: Promise<{ postId: string }>;
};

function adminJson(body: Record<string, unknown>, status: number) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

function unauthorizedResponse() {
  return adminJson({ error: "Unauthorized." }, 401);
}

export async function POST(request: Request, context: RouteContext) {
  const admin = await requireAdminApi();

  if (!admin) {
    return unauthorizedResponse();
  }

  const { postId } = await context.params;

  if (!isValidProductUuid(postId)) {
    return adminJson({ error: "Invalid journal post." }, 400);
  }

  const post = await getAdminJournalPostById(postId);

  if (!post) {
    return adminJson({ error: "Journal post not found." }, 404);
  }

  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return adminJson({ error: "Invalid upload payload." }, 400);
  }

  const entries = formData.getAll("file");

  if (entries.length !== 1) {
    return adminJson({ error: "Upload one image at a time." }, 400);
  }

  const uploaded = entries[0];

  if (!(uploaded instanceof File)) {
    return adminJson({ error: "Invalid upload payload." }, 400);
  }

  const validation = validateJournalCoverFileMeta({
    name: uploaded.name,
    size: uploaded.size,
    type: uploaded.type,
  });

  if (!validation.ok) {
    return adminJson({ error: validation.message }, 400);
  }

  const version = generateDownloadVersion();
  const filename = `cover-${version}.${validation.extension}`;

  let storagePath: string;

  try {
    storagePath = buildJournalCoverStoragePath(postId, filename);
  } catch {
    return adminJson({ error: "The storage path could not be created." }, 400);
  }

  const buffer = Buffer.from(await uploaded.arrayBuffer());
  const previousPath = extractJournalCoverStoragePathFromUrl(
    post.cover_image_url,
  );

  const uploadResult = await uploadJournalCoverFile({
    storagePath,
    buffer,
    contentType: validation.mimeType,
  });

  if (!uploadResult.ok) {
    return adminJson({ error: uploadResult.message }, 500);
  }

  try {
    await updateAdminJournalCoverUrl(postId, uploadResult.publicUrl);
  } catch {
    await deleteJournalCoverFile(storagePath);

    return adminJson(
      { error: "The journal post could not be updated after upload." },
      500,
    );
  }

  if (previousPath && previousPath !== storagePath) {
    await deleteJournalCoverFile(previousPath);
  }

  revalidateJournal({ slug: post.slug });

  return adminJson({ coverImageUrl: uploadResult.publicUrl }, 200);
}

export async function DELETE(_request: Request, context: RouteContext) {
  const admin = await requireAdminApi();

  if (!admin) {
    return unauthorizedResponse();
  }

  const { postId } = await context.params;

  if (!isValidProductUuid(postId)) {
    return adminJson({ error: "Invalid journal post." }, 400);
  }

  const post = await getAdminJournalPostById(postId);

  if (!post) {
    return adminJson({ error: "Journal post not found." }, 404);
  }

  const storagePath = extractJournalCoverStoragePathFromUrl(
    post.cover_image_url,
  );

  if (!storagePath) {
    return adminJson({ error: "No cover image is configured." }, 404);
  }

  try {
    await clearAdminJournalCover(postId);
  } catch {
    return adminJson(
      { error: "The journal post cover could not be cleared." },
      500,
    );
  }

  await deleteJournalCoverFile(storagePath);

  revalidateJournal({ slug: post.slug });

  return adminJson({ coverImageUrl: "", coverImageAlt: "" }, 200);
}
