"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import {
  createAdminProduct,
  getAdminProductById,
  isProductSlugTaken,
  updateAdminCollection,
  updateAdminProduct,
  type ProductWriteInput,
} from "@/lib/admin/catalog";
import { revalidateCatalog } from "@/lib/admin/revalidate";
import {
  isValidOptionalUrl,
  isValidProductStatus,
  normalizeSlug,
  parsePriceToCents,
  validateSlug,
} from "@/lib/admin/validation";

export type ActionState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

function readProductInput(formData: FormData): {
  input: ProductWriteInput | null;
  fieldErrors: Record<string, string>;
  collectionSlug?: string;
} {
  const fieldErrors: Record<string, string> = {};

  const title = String(formData.get("title") ?? "").trim();
  const slug = normalizeSlug(String(formData.get("slug") ?? ""));
  const subtitle = String(formData.get("subtitle") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const collectionId = String(formData.get("collection_id") ?? "").trim();
  const collectionSlug = String(formData.get("collection_slug") ?? "").trim();
  const priceInput = String(formData.get("price") ?? "").trim();
  const currency = String(formData.get("currency") ?? "EUR")
    .trim()
    .toUpperCase();
  const imageUrl = String(formData.get("image_url") ?? "").trim();
  const thumbnailUrl = String(formData.get("thumbnail_url") ?? "").trim();
  const edition = String(formData.get("edition") ?? "").trim();
  const resolution = String(formData.get("resolution") ?? "").trim();
  const fileType = String(formData.get("file_type") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();
  const stripePriceId = String(formData.get("stripe_price_id") ?? "").trim();
  const sortOrderRaw = String(formData.get("sort_order") ?? "0").trim();
  const isFeatured = formData.get("is_featured") === "on";

  if (!title) {
    fieldErrors.title = "Title is required.";
  }

  const slugError = validateSlug(slug);
  if (slugError) {
    fieldErrors.slug = slugError;
  }

  if (!collectionId) {
    fieldErrors.collection_id = "Collection is required.";
  }

  const priceCents = parsePriceToCents(priceInput);
  if (priceCents === null) {
    fieldErrors.price = "Enter a valid price of zero or greater.";
  }

  if (!isValidProductStatus(status)) {
    fieldErrors.status = "Select a valid status.";
  }

  if (!isValidOptionalUrl(imageUrl)) {
    fieldErrors.image_url = "Enter a valid image URL or site path.";
  }

  if (!isValidOptionalUrl(thumbnailUrl)) {
    fieldErrors.thumbnail_url = "Enter a valid thumbnail URL or site path.";
  }

  const sortOrder = Number.parseInt(sortOrderRaw, 10);
  if (!Number.isFinite(sortOrder)) {
    fieldErrors.sort_order = "Sort order must be a number.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { input: null, fieldErrors, collectionSlug };
  }

  return {
    input: {
      collection_id: collectionId,
      slug,
      title,
      subtitle,
      description,
      price_cents: priceCents ?? 0,
      currency,
      image_url: imageUrl,
      thumbnail_url: thumbnailUrl || imageUrl,
      edition,
      resolution,
      file_type: fileType,
      status,
      is_featured: isFeatured,
      stripe_price_id: stripePriceId || null,
      sort_order: sortOrder,
    },
    fieldErrors,
    collectionSlug,
  };
}

export async function createProductAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const { input, fieldErrors, collectionSlug } = readProductInput(formData);

  if (!input) {
    return { fieldErrors, error: "Please correct the highlighted fields." };
  }

  try {
    if (await isProductSlugTaken(input.slug)) {
      return {
        fieldErrors: { slug: "This slug is already in use." },
        error: "Please correct the highlighted fields.",
      };
    }

    await createAdminProduct(input);

    revalidateCatalog({
      productSlug: input.slug,
      collectionSlug: collectionSlug || "originals",
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[admin] createProductAction failed:", error);
    }

    return { error: "The product could not be created. Please try again." };
  }

  redirect("/admin/products");
}

export async function updateProductAction(
  productId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const { input, fieldErrors, collectionSlug } = readProductInput(formData);

  if (!input) {
    return { fieldErrors, error: "Please correct the highlighted fields." };
  }

  try {
    if (await isProductSlugTaken(input.slug, productId)) {
      return {
        fieldErrors: { slug: "This slug is already in use." },
        error: "Please correct the highlighted fields.",
      };
    }

    await updateAdminProduct(productId, input);

    revalidateCatalog({
      productSlug: input.slug,
      collectionSlug: collectionSlug || "originals",
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[admin] updateProductAction failed:", error);
    }

    return { error: "The product could not be updated. Please try again." };
  }

  redirect("/admin/products");
}

export async function updateCollectionAction(
  collectionId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const sortOrderRaw = String(formData.get("sort_order") ?? "0").trim();
  const collectionSlug = String(formData.get("slug") ?? "").trim();
  const fieldErrors: Record<string, string> = {};

  if (!name) {
    fieldErrors.name = "Name is required.";
  }

  const sortOrder = Number.parseInt(sortOrderRaw, 10);
  if (!Number.isFinite(sortOrder)) {
    fieldErrors.sort_order = "Sort order must be a number.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors, error: "Please correct the highlighted fields." };
  }

  try {
    await updateAdminCollection(collectionId, {
      name,
      description,
      sort_order: sortOrder,
    });

    revalidateCatalog({ collectionSlug });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[admin] updateCollectionAction failed:", error);
    }

    return { error: "The collection could not be updated. Please try again." };
  }

  return {};
}

export async function getProductForEdit(productId: string) {
  await requireAdmin();
  return getAdminProductById(productId);
}
