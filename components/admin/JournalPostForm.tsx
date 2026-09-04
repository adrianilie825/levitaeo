"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";
import { useAdminToast } from "@/components/admin/AdminToastProvider";
import {
  createJournalPostAction,
  updateJournalPostAction,
  type JournalActionState,
} from "@/lib/admin/journal-actions";
import { JOURNAL_STATUSES, journalStatusLabel } from "@/lib/admin/journal-constants";
import type { JournalPostFormValues } from "@/lib/admin/journal-form-defaults";

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

export default function JournalPostForm({
  mode,
  postId,
  initialValues,
}: JournalPostFormProps) {
  const router = useRouter();
  const { showSuccess, showError } = useAdminToast();
  const processedSuccessRef = useRef<string | null>(null);

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

  const fieldErrors = state.fieldErrors ?? {};

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
    showSuccess(state.message);

    if (mode === "create" && state.postId) {
      router.push(`/admin/journal/${state.postId}/edit`);
      router.refresh();
      return;
    }

    router.refresh();
  }, [
    mode,
    router,
    showSuccess,
    state.message,
    state.postId,
    state.success,
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

  return (
    <form
      action={formAction}
      className="border border-[#ECE8E2] bg-white p-6 md:p-8"
      noValidate
    >
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

          <div>
            <label htmlFor="cover_image_url" className={labelClassName}>
              Cover image URL
            </label>
            <input
              id="cover_image_url"
              name="cover_image_url"
              value={values.cover_image_url}
              onChange={(event) =>
                updateField("cover_image_url", event.target.value)
              }
              className={inputClassName}
              placeholder="/images/..."
            />
            {fieldErrors.cover_image_url ? (
              <p className={errorClassName}>{fieldErrors.cover_image_url}</p>
            ) : null}
          </div>

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
                  placeholder="Optional"
                />
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
              disabled={pending}
              aria-busy={pending}
              className="inline-flex items-center justify-center border border-[#111111] bg-[#111111] px-6 py-3 text-[11px] uppercase tracking-[0.18em] text-white transition-colors duration-300 hover:bg-transparent hover:text-[#111111] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending ? "Saving…" : mode === "create" ? "Create post" : "Save"}
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
