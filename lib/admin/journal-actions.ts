"use server";

import { requireAdmin } from "@/lib/admin/auth";
import {
  createAdminJournalPost,
  getAdminJournalPostById,
  isJournalPostSlugTaken,
  updateAdminJournalPost,
  type JournalPostWriteInput,
} from "@/lib/admin/journal";
import { isValidJournalStatus } from "@/lib/admin/journal-constants";
import { revalidateJournal } from "@/lib/admin/revalidate-journal";
import {
  isValidOptionalUrl,
  normalizeSlug,
  validateSlug,
} from "@/lib/admin/validation";
import { isValidProductUuid } from "@/lib/storage/admin-artwork-storage";

export type JournalActionState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: boolean;
  postId?: string;
  message?: string;
};

function parsePublishedAtInput(value: string): string | null {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  const date = new Date(trimmed);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}

function resolvePublishedAt(options: {
  status: string;
  publishedAtInput: string;
  existingPublishedAt?: string | null;
}): { publishedAt: string | null; fieldError?: string } {
  const parsedInput = parsePublishedAtInput(options.publishedAtInput);

  if (options.publishedAtInput.trim() && !parsedInput) {
    return {
      publishedAt: null,
      fieldError: "Enter a valid published date.",
    };
  }

  if (options.status === "draft") {
    return { publishedAt: parsedInput };
  }

  if (parsedInput) {
    return { publishedAt: parsedInput };
  }

  if (options.existingPublishedAt) {
    return { publishedAt: options.existingPublishedAt };
  }

  return { publishedAt: new Date().toISOString() };
}

function readJournalPostInput(
  formData: FormData,
  existingPublishedAt?: string | null,
): {
  input: JournalPostWriteInput | null;
  fieldErrors: Record<string, string>;
} {
  const fieldErrors: Record<string, string> = {};

  const title = String(formData.get("title") ?? "").trim();
  const slug = normalizeSlug(String(formData.get("slug") ?? ""));
  const excerpt = String(formData.get("excerpt") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const coverImageUrl = String(formData.get("cover_image_url") ?? "").trim();
  const coverImageAlt = String(formData.get("cover_image_alt") ?? "").trim();
  const author = String(formData.get("author") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const seoTitle = String(formData.get("seo_title") ?? "").trim();
  const seoDescription = String(formData.get("seo_description") ?? "").trim();
  const ogImageUrl = String(formData.get("og_image_url") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();
  const publishedAtInput = String(formData.get("published_at") ?? "").trim();

  if (!title) {
    fieldErrors.title = "Title is required.";
  }

  const slugError = validateSlug(slug);
  if (slugError) {
    fieldErrors.slug = slugError;
  }

  if (!excerpt) {
    fieldErrors.excerpt = "Excerpt is required.";
  }

  if (!body) {
    fieldErrors.body = "Body is required.";
  }

  if (!isValidJournalStatus(status)) {
    fieldErrors.status = "Select a valid status.";
  }

  if (!isValidOptionalUrl(coverImageUrl)) {
    fieldErrors.cover_image_url = "The cover image could not be saved.";
  }

  if (coverImageAlt.length > 500) {
    fieldErrors.cover_image_alt =
      "Cover alt text must be 500 characters or fewer.";
  }

  if (!isValidOptionalUrl(ogImageUrl)) {
    fieldErrors.og_image_url = "Enter a valid OG image URL or site path.";
  }

  const publishedAtResolution = resolvePublishedAt({
    status,
    publishedAtInput,
    existingPublishedAt,
  });

  if (publishedAtResolution.fieldError) {
    fieldErrors.published_at = publishedAtResolution.fieldError;
  }

  if (status === "published" && !publishedAtResolution.publishedAt) {
    fieldErrors.published_at = "Published date is required for published posts.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { input: null, fieldErrors };
  }

  return {
    input: {
      title,
      slug,
      excerpt,
      body,
      cover_image_url: coverImageUrl,
      cover_image_alt: coverImageAlt,
      author,
      category,
      seo_title: seoTitle,
      seo_description: seoDescription,
      og_image_url: ogImageUrl,
      status,
      published_at: publishedAtResolution.publishedAt,
    },
    fieldErrors,
  };
}

export async function createJournalPostAction(
  _prevState: JournalActionState,
  formData: FormData,
): Promise<JournalActionState> {
  await requireAdmin();

  const { input, fieldErrors } = readJournalPostInput(formData);

  if (!input) {
    return { fieldErrors, error: "Please correct the highlighted fields." };
  }

  try {
    if (await isJournalPostSlugTaken(input.slug)) {
      return {
        fieldErrors: { slug: "This slug is already in use." },
        error: "Please correct the highlighted fields.",
      };
    }

    const post = await createAdminJournalPost(input);

    revalidateJournal({ slug: post.slug });

    return {
      success: true,
      postId: post.id,
      message: "Journal post created.",
    };
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[admin] createJournalPostAction failed:", error);
    }

    return { error: "The journal post could not be created. Please try again." };
  }
}

export async function updateJournalPostAction(
  postId: string,
  _prevState: JournalActionState,
  formData: FormData,
): Promise<JournalActionState> {
  await requireAdmin();

  if (!isValidProductUuid(postId)) {
    return { error: "Invalid journal post." };
  }

  const existingPost = await getAdminJournalPostById(postId);

  if (!existingPost) {
    return { error: "Journal post not found." };
  }

  const { input, fieldErrors } = readJournalPostInput(
    formData,
    existingPost.published_at,
  );

  if (!input) {
    return { fieldErrors, error: "Please correct the highlighted fields." };
  }

  try {
    if (await isJournalPostSlugTaken(input.slug, postId)) {
      return {
        fieldErrors: { slug: "This slug is already in use." },
        error: "Please correct the highlighted fields.",
      };
    }

    const post = await updateAdminJournalPost(postId, input);

    revalidateJournal({ slug: post.slug });

    if (existingPost.slug !== post.slug) {
      revalidateJournal({ slug: existingPost.slug });
    }

    return {
      success: true,
      postId: post.id,
      message: "Journal post saved.",
    };
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[admin] updateJournalPostAction failed:", error);
    }

    return { error: "The journal post could not be updated. Please try again." };
  }
}
