import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/auth";
import {
  clearAdminProductDownloadMetadata,
  getAdminProductById,
  updateAdminProductDownloadMetadata,
} from "@/lib/admin/catalog";
import { revalidateAfterProductFileChange } from "@/lib/admin/revalidate-upload";
import { logAdminUploadOperation } from "@/lib/admin/upload-audit";
import { logAdminUploadWarning } from "@/lib/admin/upload-cleanup";
import {
  buildVersionedStorageFilename,
  generateDownloadVersion,
  sanitizeDownloadFilename,
  validateUploadFileMeta,
} from "@/lib/downloads/upload-validation";
import {
  buildArtworkStoragePath,
  deleteArtworkFile,
  isValidProductUuid,
  uploadArtworkFile,
} from "@/lib/storage/admin-artwork-storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

type RouteContext = {
  params: Promise<{ productId: string }>;
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

  const { productId } = await context.params;

  if (!isValidProductUuid(productId)) {
    return adminJson({ error: "Invalid product." }, 400);
  }

  const product = await getAdminProductById(productId);

  if (!product) {
    return adminJson({ error: "Product not found." }, 404);
  }

  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return adminJson({ error: "Invalid upload payload." }, 400);
  }

  const entries = formData.getAll("file");

  if (entries.length !== 1) {
    return adminJson({ error: "Upload one file at a time." }, 400);
  }

  const uploaded = entries[0];

  if (!(uploaded instanceof File)) {
    return adminJson({ error: "Invalid upload payload." }, 400);
  }

  const validation = validateUploadFileMeta({
    name: uploaded.name,
    size: uploaded.size,
    type: uploaded.type,
  });

  if (!validation.ok) {
    return adminJson({ error: validation.message }, 400);
  }

  const sanitizedFilename = sanitizeDownloadFilename(uploaded.name);

  if (!sanitizedFilename) {
    return adminJson({ error: "The file name could not be accepted." }, 400);
  }

  const version = generateDownloadVersion();
  const versionedFilename = buildVersionedStorageFilename(
    sanitizedFilename,
    version,
  );

  let storagePath: string;

  try {
    storagePath = buildArtworkStoragePath(productId, versionedFilename);
  } catch {
    return adminJson({ error: "The storage path could not be created." }, 400);
  }

  const buffer = Buffer.from(await uploaded.arrayBuffer());
  const previousStoragePath = product.download_storage_path?.trim() || null;
  const operation = previousStoragePath ? "replace" : "upload";

  const uploadResult = await uploadArtworkFile({
    storagePath,
    buffer,
    contentType: validation.mimeType,
  });

  if (!uploadResult.ok) {
    logAdminUploadOperation({
      productId,
      operation,
      outcome: "upload_failed",
      detail: uploadResult.message,
    });

    return adminJson({ error: uploadResult.message }, 500);
  }

  try {
    await updateAdminProductDownloadMetadata(productId, {
      download_storage_path: storagePath,
      download_filename: versionedFilename,
      download_mime_type: validation.mimeType,
      download_size_bytes: buffer.length,
      download_version: version,
    });
  } catch {
    await deleteArtworkFile(storagePath);

    logAdminUploadOperation({
      productId,
      operation,
      outcome: "metadata_update_failed",
    });

    return adminJson(
      { error: "The product record could not be updated after upload." },
      500,
    );
  }

  if (previousStoragePath && previousStoragePath !== storagePath) {
    const cleanup = await deleteArtworkFile(previousStoragePath);

    if (!cleanup.ok) {
      logAdminUploadWarning({
        productId,
        operation,
        detail: `Old object retained at ${previousStoragePath}`,
      });
    }
  }

  const collectionSlug = product.collections?.slug ?? "originals";

  revalidateAfterProductFileChange({
    productId,
    productSlug: product.slug,
    collectionSlug,
  });

  logAdminUploadOperation({
    productId,
    operation,
    outcome: "success",
  });

  return adminJson(
    {
      configured: true,
      filename: versionedFilename,
      mimeType: validation.mimeType,
      sizeBytes: buffer.length,
      version,
    },
    200,
  );
}

export async function DELETE(_request: Request, context: RouteContext) {
  const admin = await requireAdminApi();

  if (!admin) {
    return unauthorizedResponse();
  }

  const { productId } = await context.params;

  if (!isValidProductUuid(productId)) {
    return adminJson({ error: "Invalid product." }, 400);
  }

  const product = await getAdminProductById(productId);

  if (!product) {
    return adminJson({ error: "Product not found." }, 404);
  }

  const storagePath = product.download_storage_path?.trim();

  if (!storagePath) {
    return adminJson({ error: "No delivery file is configured." }, 404);
  }

  try {
    await clearAdminProductDownloadMetadata(productId);
  } catch {
    logAdminUploadOperation({
      productId,
      operation: "remove",
      outcome: "metadata_clear_failed",
    });

    return adminJson(
      { error: "The product download metadata could not be cleared." },
      500,
    );
  }

  const deletion = await deleteArtworkFile(storagePath);

  if (!deletion.ok) {
    logAdminUploadOperation({
      productId,
      operation: "remove",
      outcome: "storage_delete_failed",
      detail: storagePath,
    });

    return adminJson(
      {
        error:
          "Download metadata was cleared, but the storage object could not be deleted. Remove it manually in Supabase Storage.",
      },
      500,
    );
  }

  const collectionSlug = product.collections?.slug ?? "originals";

  revalidateAfterProductFileChange({
    productId,
    productSlug: product.slug,
    collectionSlug,
  });

  logAdminUploadOperation({
    productId,
    operation: "remove",
    outcome: "success",
  });

  return adminJson({ configured: false }, 200);
}
