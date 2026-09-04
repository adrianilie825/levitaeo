"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";
import UploadProgressBar from "@/components/admin/UploadProgressBar";
import { useAdminToast } from "@/components/admin/AdminToastProvider";
import {
  createJournalPostAction,
  updateJournalPostAction,
  type JournalActionState,
} from "@/lib/admin/journal-actions";
import { validateJournalCoverFileMeta } from "@/lib/admin/journal-cover-validation";
import { JOURNAL_STATUSES, journalStatusLabel } from "@/lib/admin/journal-constants";
import type { JournalPostFormValues } from "@/lib/admin/journal-form-defaults";
import {
  requestJson,
  uploadFileWithProgress,
} from "@/lib/admin/upload-with-progress";
import {
  ACCEPT_JOURNAL_COVER_EXTENSIONS,
  ACCEPT_JOURNAL_COVER_MIME_TYPES,
} from "@/lib/storage/journal-cover-constants";

type JournalPostFormProps = {
  mode: "create" | "edit";
  postId?: string;
  initialValues: JournalPostFormValues;
};

const inputClassName =
  "mt-2 w-full border border-[#ECE8E2] bg-white px-4 py-3 text-[15px] text-[#111111] outline-none transition-colors focus-visible:border-[#111111]";
const labelClassName =
  "block text-[11px] uppercase tracking-[0.28em] text-neutral-500";
const errorClassName = "mt-2 text-[13px] leading-6 text-neutral-600";

function slugifyTitle(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function hasCoverImage(url: string): boolean {
  return url.trim().length > 0;
}

export default function JournalPostForm({
  mode,
  postId,
  initialValues,
}: JournalPostFormProps) {
  const router = useRouter();
  const { showSuccess, showError } = useAdminToast();
  const processedSuccessRef = useRef<string | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const boundUpdateAction =
    mode === "edit" && postId
      ? updateJournalPostAction.bind(null, postId)
      : createJournalPostAction;

  const [state, formAction, pending] = useActionState<
    JournalActionState,
    FormData
  >(boundUpdateAction, {});

  const [values, setValues] = useState(initialValues);
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [resolvedPostId, setResolvedPostId] = useState(postId ?? "");
  const [coverProgress, setCoverProgress] = useState<number | null>(null);
  const [coverUploadError, setCoverUploadError] = useState<string | null>(null);
  const [pendingCoverFile, setPendingCoverFile] = useState<File | null>(null);

  const fieldErrors = state.fieldErrors ?? {};
  const activePostId = resolvedPostId || postId || "";
  const coverUploading = coverProgress !== null;
  const isSaving = pending || coverUploading;
  const coverSource =
    pendingCoverFile != null
      ? URL.createObjectURL(pendingCoverFile)
      : hasCoverImage(values.cover_image_url)
        ? values.cover_image_url
        : null;
  const coverReady = Boolean(coverSource);

  useEffect(() => {
    if (state.error) {
      showError(state.error);
    }
  }, [state.error, showError]);

  useEffect(() => {
    if (!state.success || !state.message) {
      return;
    }

    const successKey = `${state.postId ?? "new"}:${state.message}`;

    if (processedSuccessRef.current === successKey) {
      return;
    }

    processedSuccessRef.current = successKey;

    async function finalizeSave() {
      const nextPostId = state.postId ?? activePostId;

      if (!nextPostId) {
        showSuccess(state.message ?? "Journal post saved.");
        return;
      }

      setResolvedPostId(nextPostId);

      if (pendingCoverFile) {
        setCoverUploadError(null);
        setCoverProgress(0);

        const coverResult = await uploadFileWithProgress<{
          coverImageUrl?: string;
          error?: string;
        }>(`/api/admin/journal/${nextPostId}/cover`, pendingCoverFile, {
          onProgress: setCoverProgress,
        });

        setCoverProgress(null);

        if (!coverResult.ok) {
          setCoverUploadError(coverResult.message);
          showError(coverResult.message);
          return;
        }

        const coverImageUrl =
          coverResult.data.coverImageUrl ?? values.cover_image_url;

        setValues((current) => ({
          ...current,
          cover_image_url: coverImageUrl,
        }));
        setPendingCoverFile(null);
      }

      showSuccess(state.message ?? "Journal post saved.");

      if (mode === "create" && state.postId) {
        router.push(`/admin/journal/${state.postId}/edit`);
        router.refresh();
        return;
      }

      router.refresh();
    }

    void finalizeSave();
  }, [
    activePostId,
    mode,
    pendingCoverFile,
    router,
    showError,
    showSuccess,
    state.message,
    state.postId,
    state.success,
    values.cover_image_url,
  ]);

  function updateField<K extends keyof JournalPostFormValues>(
    key: K,
    value: JournalPostFormValues[K],
  ) {
    setValues((current) => {
      const next = { ...current, [key]: value };

      if (key === "title" && !slugTouched) {
        next.slug = slugifyTitle(String(value));
      }

      return next;
    });
  }

  async function uploadCoverNow(activeId: string, file: File): Promise<boolean> {
    setCoverUploadError(null);
    setCoverProgress(0);

    const coverResult = await uploadFileWithProgress<{
      coverImageUrl?: string;
      error?: string;
    }>(`/api/admin/journal/${activeId}/cover`, file, {
      onProgress: setCoverProgress,
    });

    setCoverProgress(null);

    if (!coverResult.ok) {
      setCoverUploadError(coverResult.message);
      showError(coverResult.message);
      return false;
    }

    const coverImageUrl = coverResult.data.coverImageUrl ?? values.cover_image_url;

    setValues((current) => ({
      ...current,
      cover_image_url: coverImageUrl,
    }));
    setPendingCoverFile(null);
    showSuccess("Cover image uploaded.");
    router.refresh();
    return true;
  }

  function handleCoverSelection(file: File) {
    const validation = validateJournalCoverFileMeta({
      name: file.name,
      size: file.size,
      type: file.type,
    });

    if (!validation.ok) {
      setCoverUploadError(validation.message);
      showError(validation.message);
      return;
    }

    setCoverUploadError(null);

    if (mode === "edit" && activePostId) {
      void uploadCoverNow(activePostId, file);
      return;
    }

    setPendingCoverFile(file);
  }

  async function removeCover() {
    if (!activePostId) {
      setPendingCoverFile(null);
      setValues((current) => ({
        ...current,
        cover_image_url: "",
      }));
      setCoverUploadError(null);
      return;
    }

    if (pendingCoverFile) {
      setPendingCoverFile(null);
      setCoverUploadError(null);
      return;
    }

    if (!hasCoverImage(values.cover_image_url)) {
      return;
    }

    const result = await requestJson<{
      coverImageUrl?: string;
      coverImageAlt?: string;
    }>(`/api/admin/journal/${activePostId}/cover`, { method: "DELETE" });

    if (!result.ok) {
      setCoverUploadError(result.message);
      showError(result.message);
      return;
    }

    setValues((current) => ({
      ...current,
      cover_image_url: "",
      cover_image_alt: "",
    }));
    setCoverUploadError(null);
    showSuccess("Cover image removed.");
    router.refresh();
  }

  return (
    <form
      action={formAction}
      className="border border-[#ECE8E2] bg-white p-6 md:p-8"
      noValidate
    >
      <input type="hidden" name="cover_image_url" value={values.cover_image_url} />

      <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_240px]">
        <div className="space-y-8">
          <div>
            <label htmlFor="title" className={labelClassName}>
              Title
            </label>
            <input
              id="title"
              name="title"
              required
              value={values.title}
              onChange={(event) => updateField("title", event.target.value)}
              className={inputClassName}
            />
            {fieldErrors.title ? (
              <p className={errorClassName}>{fieldErrors.title}</p>
            ) : null}
          </div>

          <div>
            <label htmlFor="slug" className={labelClassName}>
              Slug
            </label>
            <input
              id="slug"
              name="slug"
              required
              value={values.slug}
              onChange={(event) => {
                setSlugTouched(true);
                updateField("slug", event.target.value);
              }}
              className={`${inputClassName} font-mono text-sm`}
            />
            {fieldErrors.slug ? (
              <p className={errorClassName}>{fieldErrors.slug}</p>
            ) : null}
          </div>

          <div>
            <label htmlFor="excerpt" className={labelClassName}>
              Excerpt
            </label>
            <textarea
              id="excerpt"
              name="excerpt"
              required
              rows={3}
              value={values.excerpt}
              onChange={(event) => updateField("excerpt", event.target.value)}
              className={`${inputClassName} resize-y`}
            />
            {fieldErrors.excerpt ? (
              <p className={errorClassName}>{fieldErrors.excerpt}</p>
            ) : null}
          </div>

          <div>
            <label htmlFor="body" className={labelClassName}>
              Body
            </label>
            <textarea
              id="body"
              name="body"
              required
              rows={18}
              value={values.body}
              onChange={(event) => updateField("body", event.target.value)}
              className={`${inputClassName} min-h-[360px] resize-y leading-7`}
            />
            <p className="mt-2 text-[13px] leading-6 text-neutral-500">
              Separate paragraphs with a blank line.
            </p>
            <p className="mt-3 text-[12px] leading-6 text-neutral-500">
              Formatting:
              <br />
              ## Section heading
              <br />
              [Link text](/collections)
            </p>
            {fieldErrors.body ? (
              <p className={errorClassName}>{fieldErrors.body}</p>
            ) : null}
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <label htmlFor="author" className={labelClassName}>
                Author
              </label>
              <input
                id="author"
                name="author"
                value={values.author}
                onChange={(event) => updateField("author", event.target.value)}
                className={inputClassName}
              />
            </div>

            <div>
              <label htmlFor="category" className={labelClassName}>
                Category
              </label>
              <input
                id="category"
                name="category"
                value={values.category}
                onChange={(event) => updateField("category", event.target.value)}
                className={inputClassName}
                placeholder="Essay"
              />
            </div>
          </div>

          <section className="space-y-6 border border-[#ECE8E2] p-6">
            <div>
              <h2 className="text-xl font-light tracking-[-0.02em]">
                Cover image
              </h2>
              <p className="mt-3 max-w-2xl text-[14px] leading-6 text-neutral-600">
                Upload a wide editorial cover for the Journal index and article
                page. Recommended 16:9 at 2400 × 1350 px. PNG, JPG, or WebP up
                to 20 MB.
              </p>
            </div>

            {coverSource ? (
              <div className="relative aspect-[16/9] max-w-xl overflow-hidden border border-[#ECE8E2] bg-[#FAFAF8]">
                <Image
                  src={coverSource}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 100vw, 640px"
                  className="object-cover"
                  unoptimized={coverSource.startsWith("blob:")}
                />
              </div>
            ) : null}

            {coverUploadError ? (
              <p className={errorClassName} role="alert">
                {coverUploadError}
              </p>
            ) : null}

            {fieldErrors.cover_image_url ? (
              <p className={errorClassName}>{fieldErrors.cover_image_url}</p>
            ) : null}

            <input
              ref={coverInputRef}
              id="journal-cover-input"
              type="file"
              accept={`${ACCEPT_JOURNAL_COVER_EXTENSIONS},${ACCEPT_JOURNAL_COVER_MIME_TYPES}`}
              className="sr-only"
              disabled={isSaving}
              onChange={(event) => {
                const file = event.target.files?.[0];

                if (file) {
                  handleCoverSelection(file);
                }

                event.target.value = "";
              }}
            />

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                disabled={isSaving}
                className="inline-flex items-center justify-center border border-[#111111] bg-[#111111] px-6 py-3 text-[11px] uppercase tracking-[0.18em] text-white transition-colors hover:bg-transparent hover:text-[#111111] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {coverReady ? "Replace cover image" : "Upload cover image"}
              </button>
              {coverReady && !coverUploading ? (
                <button
                  type="button"
                  onClick={() => void removeCover()}
                  disabled={isSaving}
                  className="inline-flex items-center justify-center border border-[#ECE8E2] px-6 py-3 text-[11px] uppercase tracking-[0.18em] text-[#111111] transition-colors hover:border-[#111111] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Remove cover
                </button>
              ) : null}
              {pendingCoverFile ? (
                <p className="text-[13px] text-neutral-600">
                  Selected: {pendingCoverFile.name}
                  {mode === "create" ? " (uploads after save)" : ""}
                </p>
              ) : null}
            </div>

            {coverProgress !== null ? (
              <UploadProgressBar percent={coverProgress} label="Uploading cover" />
            ) : null}

            <div>
              <label htmlFor="cover_image_alt" className={labelClassName}>
                Cover image alt text
              </label>
              <textarea
                id="cover_image_alt"
                name="cover_image_alt"
                rows={3}
                value={values.cover_image_alt}
                onChange={(event) =>
                  updateField("cover_image_alt", event.target.value)
                }
                className={`${inputClassName} resize-y`}
                placeholder="Describe the image for accessibility and search."
              />
              <p className="mt-2 text-[13px] leading-6 text-neutral-500">
                Use descriptive alt text that explains what appears in the
                image, not just the article title.
              </p>
              {fieldErrors.cover_image_alt ? (
                <p className={errorClassName}>{fieldErrors.cover_image_alt}</p>
              ) : null}
            </div>
          </section>

          <div className="border-t border-[#ECE8E2] pt-8">
            <p className={labelClassName}>SEO</p>

            <div className="mt-6 space-y-6">
              <div>
                <label htmlFor="seo_title" className={labelClassName}>
                  SEO title
                </label>
                <input
                  id="seo_title"
                  name="seo_title"
                  value={values.seo_title}
                  onChange={(event) =>
                    updateField("seo_title", event.target.value)
                  }
                  className={inputClassName}
                />
              </div>

              <div>
                <label htmlFor="seo_description" className={labelClassName}>
                  SEO description
                </label>
                <textarea
                  id="seo_description"
                  name="seo_description"
                  rows={3}
                  value={values.seo_description}
                  onChange={(event) =>
                    updateField("seo_description", event.target.value)
                  }
                  className={`${inputClassName} resize-y`}
                />
              </div>

              <div>
                <label htmlFor="og_image_url" className={labelClassName}>
                  OG image URL
                </label>
                <input
                  id="og_image_url"
                  name="og_image_url"
                  value={values.og_image_url}
                  onChange={(event) =>
                    updateField("og_image_url", event.target.value)
                  }
                  className={inputClassName}
                  placeholder="Optional override"
                />
                <p className="mt-2 text-[13px] leading-6 text-neutral-500">
                  Leave empty to use the cover image for social sharing.
                </p>
                {fieldErrors.og_image_url ? (
                  <p className={errorClassName}>{fieldErrors.og_image_url}</p>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <aside className="space-y-6 xl:sticky xl:top-28 xl:self-start">
          <div>
            <label htmlFor="status" className={labelClassName}>
              Status
            </label>
            <select
              id="status"
              name="status"
              value={values.status}
              onChange={(event) => updateField("status", event.target.value)}
              className={inputClassName}
            >
              {JOURNAL_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {journalStatusLabel(status)}
                </option>
              ))}
            </select>
            {fieldErrors.status ? (
              <p className={errorClassName}>{fieldErrors.status}</p>
            ) : null}
          </div>

          <div>
            <label htmlFor="published_at" className={labelClassName}>
              Published date
            </label>
            <input
              id="published_at"
              name="published_at"
              type="datetime-local"
              value={values.published_at}
              onChange={(event) =>
                updateField("published_at", event.target.value)
              }
              className={inputClassName}
            />
            <p className="mt-2 text-[13px] leading-6 text-neutral-500">
              Leave empty when publishing to use the current time.
            </p>
            {fieldErrors.published_at ? (
              <p className={errorClassName}>{fieldErrors.published_at}</p>
            ) : null}
          </div>

          <div className="flex flex-col gap-3">
            <button
              type="submit"
              disabled={isSaving}
              aria-busy={isSaving}
              className="inline-flex items-center justify-center border border-[#111111] bg-[#111111] px-6 py-3 text-[11px] uppercase tracking-[0.18em] text-white transition-colors duration-300 hover:bg-transparent hover:text-[#111111] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending
                ? "Saving…"
                : coverUploading
                  ? "Uploading cover…"
                  : mode === "create"
                    ? "Create post"
                    : "Save"}
            </button>

            <Link
              href="/admin/journal"
              className="inline-flex items-center justify-center border border-[#ECE8E2] px-6 py-3 text-[11px] uppercase tracking-[0.18em] text-[#111111] transition-colors hover:border-[#111111]"
            >
              Back to Journal
            </Link>
          </div>
        </aside>
      </div>
    </form>
  );
}
