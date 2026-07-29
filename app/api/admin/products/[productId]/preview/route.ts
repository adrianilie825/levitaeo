import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/auth";
import {
  getAdminProductById,
  updateAdminProductImageUrls,
} from "@/lib/admin/catalog";
import { validatePreviewFileMeta } from "@/lib/admin/preview-validation";
import { revalidateAfterProductFileChange } from "@/lib/admin/revalidate-upload";
import { logAdminUploadOperation } from "@/lib/admin/upload-audit";
import {
  buildPreviewStoragePath,
  deletePreviewFile,
  extractPreviewStoragePathFromUrl,
  uploadPreviewFile,
} from "@/lib/storage/admin-preview-storage";
import { isValidProductUuid } from "@/lib/storage/admin-artwork-storage";
import { generateDownloadVersion } from "@/lib/downloads/upload-validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

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
    return adminJson({ error: "Upload one image at a time." }, 400);
  }

  const uploaded = entries[0];

  if (!(uploaded instanceof File)) {
    return adminJson({ error: "Invalid upload payload." }, 400);
  }

  const validation = validatePreviewFileMeta({
    name: uploaded.name,
    size: uploaded.size,
    type: uploaded.type,
  });

  if (!validation.ok) {
    return adminJson({ error: validation.message }, 400);
  }

  const version = generateDownloadVersion();
  const filename = `preview-${version}.${validation.extension}`;

  let storagePath: string;

  try {
    storagePath = buildPreviewStoragePath(productId, filename);
  } catch {
    return adminJson({ error: "The storage path could not be created." }, 400);
  }

  const buffer = Buffer.from(await uploaded.arrayBuffer());
  const previousPath = extractPreviewStoragePathFromUrl(product.image_url);

  const uploadResult = await uploadPreviewFile({
    storagePath,
    buffer,
    contentType: validation.mimeType,
  });

  if (!uploadResult.ok) {
    logAdminUploadOperation({
      productId,
      operation: previousPath ? "replace" : "upload",
      outcome: "upload_failed",
      detail: uploadResult.message,
    });

    return adminJson({ error: uploadResult.message }, 500);
  }

  try {
    await updateAdminProductImageUrls(
      productId,
      uploadResult.publicUrl,
      uploadResult.publicUrl,
    );
  } catch {
    await deletePreviewFile(storagePath);

    return adminJson(
      { error: "The product record could not be updated after upload." },
      500,
    );
  }

  if (previousPath && previousPath !== storagePath) {
    await deletePreviewFile(previousPath);
  }

  const collectionSlug = product.collections?.slug ?? "originals";

  revalidateAfterProductFileChange({
    productId,
    productSlug: product.slug,
    collectionSlug,
  });

  logAdminUploadOperation({
    productId,
    operation: previousPath ? "replace" : "upload",
    outcome: "success",
    detail: "preview-image",
  });

  return adminJson(
    {
      imageUrl: uploadResult.publicUrl,
      thumbnailUrl: uploadResult.publicUrl,
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

  const storagePath = extractPreviewStoragePathFromUrl(product.image_url);

  if (!storagePath) {
    return adminJson({ error: "No preview image is configured." }, 404);
  }

  try {
    await updateAdminProductImageUrls(productId, "", "");
  } catch {
    return adminJson(
      { error: "The product preview URLs could not be cleared." },
      500,
    );
  }

  await deletePreviewFile(storagePath);

  const collectionSlug = product.collections?.slug ?? "originals";

  revalidateAfterProductFileChange({
    productId,
    productSlug: product.slug,
    collectionSlug,
  });

  return adminJson({ imageUrl: "", thumbnailUrl: "" }, 200);
}
