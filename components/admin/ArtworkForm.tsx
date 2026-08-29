"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";
import UploadProgressBar from "@/components/admin/UploadProgressBar";
import { useAdminToast } from "@/components/admin/AdminToastProvider";
import {
  createProductAction,
  updateProductAction,
  type ActionState,
} from "@/lib/admin/actions";
import { PRODUCT_STATUSES } from "@/lib/admin/product-constants";
import type { ArtworkFormValues } from "@/lib/admin/artwork-form-defaults";
import type { ProductDeliveryFileSummary } from "@/lib/admin/product-delivery";
import {
  requestJson,
  uploadFileWithProgress,
} from "@/lib/admin/upload-with-progress";
import { validatePreviewFileMeta } from "@/lib/admin/preview-validation";
import {
  formatUploadBytes,
  validateUploadFileMeta,
} from "@/lib/downloads/upload-validation";
import {
  ACCEPT_PREVIEW_EXTENSIONS,
  ACCEPT_PREVIEW_MIME_TYPES,
} from "@/lib/storage/preview-constants";
import {
  ACCEPT_UPLOAD_EXTENSIONS,
  ACCEPT_UPLOAD_MIME_TYPES,
} from "@/lib/downloads/upload-constants";
import type { CatalogCollectionRow } from "@/types/database";

type ArtworkFormProps = {
  mode: "create" | "edit";
  productId?: string;
  collections: Pick<CatalogCollectionRow, "id" | "slug" | "name">[];
  initialValues: ArtworkFormValues;
  initialDeliveryFile?: ProductDeliveryFileSummary;
};

const inputClassName =
  "mt-2 w-full border border-[#ECE8E2] bg-white px-4 py-3 text-[15px] text-[#111111] outline-none transition-colors focus-visible:border-[#111111]";
const labelClassName =
  "block text-[11px] uppercase tracking-[0.28em] text-neutral-500";
const errorClassName = "mt-2 text-[13px] leading-6 text-neutral-600";

function AssetStatusBadge({
  label,
  tone,
}: {
  label: string;
  tone: "neutral" | "ready" | "uploading" | "failed";
}) {
  const toneClassName =
    tone === "ready"
      ? "border-[#111111] text-[#111111]"
      : tone === "uploading"
        ? "border-neutral-400 text-neutral-600"
        : tone === "failed"
          ? "border-red-300 text-red-700"
          : "border-[#ECE8E2] text-neutral-500";

  return (
    <span
      className={`inline-flex items-center border px-3 py-1 text-[11px] uppercase tracking-[0.18em] ${toneClassName}`}
    >
      {label}
    </span>
  );
}

function slugifyTitle(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function ArtworkForm({
  mode,
  productId,
  collections,
  initialValues,
  initialDeliveryFile,
}: ArtworkFormProps) {
  const router = useRouter();
  const { showSuccess, showError } = useAdminToast();
  const previewInputRef = useRef<HTMLInputElement>(null);
  const deliveryInputRef = useRef<HTMLInputElement>(null);

  const boundUpdateAction =
    mode === "edit" && productId
      ? updateProductAction.bind(null, productId)
      : createProductAction;

  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    boundUpdateAction,
    {},
  );

  const [values, setValues] = useState(initialValues);
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [resolvedProductId, setResolvedProductId] = useState(productId ?? "");
  const [pendingPreviewFile, setPendingPreviewFile] = useState<File | null>(
    null,
  );
  const [pendingDeliveryFile, setPendingDeliveryFile] = useState<File | null>(
    null,
  );
  const [previewProgress, setPreviewProgress] = useState<number | null>(null);
  const [deliveryProgress, setDeliveryProgress] = useState<number | null>(null);
  const [previewUploadError, setPreviewUploadError] = useState<string | null>(
    null,
  );
  const [deliveryUploadError, setDeliveryUploadError] = useState<string | null>(
    null,
  );
  const [uploadPhase, setUploadPhase] = useState<
    "idle" | "preview" | "delivery" | "done"
  >("idle");
  const [deliveryFile, setDeliveryFile] = useState<ProductDeliveryFileSummary>(
    initialDeliveryFile ?? {
      configured: false,
      filename: null,
      mimeType: null,
      sizeBytes: null,
      version: null,
      storagePath: null,
    },
  );
  const processedSuccessRef = useRef<string | null>(null);

  useEffect(() => {
    setValues(initialValues);
    setSlugTouched(mode === "edit");
    setResolvedProductId(productId ?? "");
    if (initialDeliveryFile) {
      setDeliveryFile(initialDeliveryFile);
    }
  }, [initialValues, mode, productId, initialDeliveryFile]);

  useEffect(() => {
    if (state.error) {
      showError(state.error);
    }
  }, [state.error, showError]);

  useEffect(() => {
    if (!state.success) {
      return;
    }

    const successKey = `${state.productId ?? "new"}:${state.message ?? "saved"}`;

    if (processedSuccessRef.current === successKey) {
      return;
    }

    processedSuccessRef.current = successKey;

    async function finalizeSave() {
      const activeProductId = state.productId ?? resolvedProductId;

      if (!activeProductId) {
        showSuccess(state.message ?? "Artwork saved.");
        return;
      }

      setResolvedProductId(activeProductId);

      try {
        if (pendingPreviewFile) {
          setUploadPhase("preview");
          setPreviewProgress(0);

          const previewResult = await uploadFileWithProgress<{
            imageUrl?: string;
            error?: string;
          }>(`/api/admin/products/${activeProductId}/preview`, pendingPreviewFile, {
            onProgress: setPreviewProgress,
          });

          if (!previewResult.ok) {
            showError(previewResult.message);
            setUploadPhase("idle");
            setPreviewProgress(null);
            return;
          }

          const imageUrl = previewResult.data.imageUrl ?? values.image_url;
          setValues((current) => ({
            ...current,
            image_url: imageUrl,
            thumbnail_url: imageUrl,
          }));
          setPendingPreviewFile(null);
          setPreviewProgress(null);
        }

        if (pendingDeliveryFile) {
          setUploadPhase("delivery");
          setDeliveryProgress(0);

          const deliveryResult = await uploadFileWithProgress<{
            configured?: boolean;
            filename?: string;
            mimeType?: string;
            sizeBytes?: number;
            version?: string;
            error?: string;
          }>(`/api/admin/products/${activeProductId}/upload`, pendingDeliveryFile, {
            onProgress: setDeliveryProgress,
          });

          if (!deliveryResult.ok) {
            showError(deliveryResult.message);
            setUploadPhase("idle");
            setDeliveryProgress(null);
            return;
          }

          setDeliveryFile({
            configured: true,
            filename: deliveryResult.data.filename ?? pendingDeliveryFile.name,
            mimeType: deliveryResult.data.mimeType ?? pendingDeliveryFile.type,
            sizeBytes:
              deliveryResult.data.sizeBytes ?? pendingDeliveryFile.size,
            version: deliveryResult.data.version ?? null,
            storagePath: null,
          });
          setPendingDeliveryFile(null);
          setDeliveryProgress(null);
        }

        setUploadPhase("done");
        showSuccess(state.message ?? "Artwork saved.");

        if (mode === "create") {
          router.push("/admin/products");
          router.refresh();
          return;
        }

        router.refresh();
      } finally {
        setUploadPhase("idle");
      }
    }

    void finalizeSave();
  }, [
    mode,
    pendingPreviewFile,
    pendingDeliveryFile,
    router,
    showError,
    showSuccess,
    state.message,
    state.productId,
    state.success,
  ]);

  function updateField<K extends keyof ArtworkFormValues>(
    key: K,
    value: ArtworkFormValues[K],
  ) {
    setValues((current) => {
      const next = { ...current, [key]: value };

      if (key === "title" && !slugTouched) {
        next.slug = slugifyTitle(String(value));
      }

      if (key === "collection_id") {
        const collection = collections.find((item) => item.id === value);
        next.collection_slug = collection?.slug ?? "";
      }

      return next;
    });
  }

  async function uploadPreviewNow(
    activeProductId: string,
    file: File,
  ): Promise<boolean> {
    setPreviewUploadError(null);
    setUploadPhase("preview");
    setPreviewProgress(0);

    const previewResult = await uploadFileWithProgress<{
      imageUrl?: string;
      error?: string;
    }>(`/api/admin/products/${activeProductId}/preview`, file, {
      onProgress: setPreviewProgress,
    });

    setPreviewProgress(null);
    setUploadPhase("idle");

    if (!previewResult.ok) {
      setPreviewUploadError(previewResult.message);
      showError(previewResult.message);
      return false;
    }

    const imageUrl = previewResult.data.imageUrl ?? values.image_url;
    setValues((current) => ({
      ...current,
      image_url: imageUrl,
      thumbnail_url: imageUrl,
    }));
    setPendingPreviewFile(null);
    showSuccess("Preview image uploaded.");
    router.refresh();
    return true;
  }

  async function uploadDeliveryNow(
    activeProductId: string,
    file: File,
  ): Promise<boolean> {
    setDeliveryUploadError(null);
    setUploadPhase("delivery");
    setDeliveryProgress(0);

    const deliveryResult = await uploadFileWithProgress<{
      configured?: boolean;
      filename?: string;
      mimeType?: string;
      sizeBytes?: number;
      version?: string;
      error?: string;
    }>(`/api/admin/products/${activeProductId}/upload`, file, {
      onProgress: setDeliveryProgress,
    });

    setDeliveryProgress(null);
    setUploadPhase("idle");

    if (!deliveryResult.ok) {
      setDeliveryUploadError(deliveryResult.message);
      showError(deliveryResult.message);
      return false;
    }

    setDeliveryFile({
      configured: true,
      filename: deliveryResult.data.filename ?? file.name,
      mimeType: deliveryResult.data.mimeType ?? file.type,
      sizeBytes: deliveryResult.data.sizeBytes ?? file.size,
      version: deliveryResult.data.version ?? null,
      storagePath: null,
    });
    setPendingDeliveryFile(null);
    showSuccess("Delivery file uploaded.");
    router.refresh();
    return true;
  }

  function handlePreviewSelection(file: File) {
    const validation = validatePreviewFileMeta({
      name: file.name,
      size: file.size,
      type: file.type,
    });

    if (!validation.ok) {
      showError(validation.message);
      return;
    }

    const activeProductId = resolvedProductId || productId;

    if (mode === "edit" && activeProductId) {
      void uploadPreviewNow(activeProductId, file);
      return;
    }

    setPreviewUploadError(null);
    setPendingPreviewFile(file);
  }

  function handleDeliverySelection(file: File) {
    const validation = validateUploadFileMeta({
      name: file.name,
      size: file.size,
      type: file.type,
    });

    if (!validation.ok) {
      showError(validation.message);
      return;
    }

    const activeProductId = resolvedProductId || productId;

    if (mode === "edit" && activeProductId) {
      void uploadDeliveryNow(activeProductId, file);
      return;
    }

    setDeliveryUploadError(null);
    setPendingDeliveryFile(file);
  }

  async function removePreview() {
    const activeProductId = resolvedProductId || productId;

    if (!activeProductId) {
      return;
    }

    const result = await requestJson<{ imageUrl?: string }>(
      `/api/admin/products/${activeProductId}/preview`,
      { method: "DELETE" },
    );

    if (!result.ok) {
      showError(result.message);
      return;
    }

    setValues((current) => ({
      ...current,
      image_url: "",
      thumbnail_url: "",
    }));
    setPendingPreviewFile(null);
    setPreviewUploadError(null);
    showSuccess("Preview image removed.");
    router.refresh();
  }

  async function removeDeliveryFile() {
    const activeProductId = resolvedProductId || productId;

    if (!activeProductId) {
      return;
    }

    const result = await requestJson<{ configured?: boolean }>(
      `/api/admin/products/${activeProductId}/upload`,
      { method: "DELETE" },
    );

    if (!result.ok) {
      showError(result.message);
      return;
    }

    setDeliveryFile({
      configured: false,
      filename: null,
      mimeType: null,
      sizeBytes: null,
      version: null,
      storagePath: null,
    });
    setPendingDeliveryFile(null);
    setDeliveryUploadError(null);
    showSuccess("Delivery file removed.");
    router.refresh();
  }

  const fieldErrors = state.fieldErrors ?? {};
  const isSaving = pending || uploadPhase !== "idle";
  const previewSource =
    pendingPreviewFile != null
      ? URL.createObjectURL(pendingPreviewFile)
      : values.image_url;
  const previewReady = Boolean(previewSource);
  const previewUploading = previewProgress !== null;
  const deliveryReady = deliveryFile.configured || Boolean(pendingDeliveryFile);
  const deliveryUploading = deliveryProgress !== null;
  const activeProductId = resolvedProductId || productId;

  return (
    <form action={formAction} className="space-y-10" noValidate>
      <section className="grid gap-8 md:grid-cols-2">
        <div className="md:col-span-2">
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
            className={inputClassName}
          />
          {fieldErrors.slug ? (
            <p className={errorClassName}>{fieldErrors.slug}</p>
          ) : null}
        </div>

        <div>
          <label htmlFor="collection_id" className={labelClassName}>
            Collection
          </label>
          <select
            id="collection_id"
            name="collection_id"
            required
            value={values.collection_id}
            onChange={(event) =>
              updateField("collection_id", event.target.value)
            }
            className={inputClassName}
          >
            <option value="">Select collection</option>
            {collections.map((collection) => (
              <option key={collection.id} value={collection.id}>
                {collection.name}
              </option>
            ))}
          </select>
          <input
            type="hidden"
            name="collection_slug"
            value={values.collection_slug}
          />
          {fieldErrors.collection_id ? (
            <p className={errorClassName}>{fieldErrors.collection_id}</p>
          ) : null}
        </div>

        <div className="md:col-span-2">
          <label htmlFor="subtitle" className={labelClassName}>
            Subtitle
          </label>
          <input
            id="subtitle"
            name="subtitle"
            value={values.subtitle}
            onChange={(event) => updateField("subtitle", event.target.value)}
            className={inputClassName}
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="description" className={labelClassName}>
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={6}
            value={values.description}
            onChange={(event) => updateField("description", event.target.value)}
            className={`${inputClassName} resize-y`}
          />
        </div>
      </section>

      <section className="grid gap-8 md:grid-cols-2">
        <div>
          <label htmlFor="price" className={labelClassName}>
            Price (EUR)
          </label>
          <input
            id="price"
            name="price"
            inputMode="decimal"
            required
            value={values.price}
            onChange={(event) => updateField("price", event.target.value)}
            placeholder="29.00"
            className={inputClassName}
          />
          {fieldErrors.price ? (
            <p className={errorClassName}>{fieldErrors.price}</p>
          ) : null}
        </div>

        <div>
          <label htmlFor="currency" className={labelClassName}>
            Currency
          </label>
          <input
            id="currency"
            name="currency"
            value={values.currency}
            onChange={(event) =>
              updateField("currency", event.target.value.toUpperCase())
            }
            className={inputClassName}
          />
        </div>

        <div>
          <label htmlFor="edition" className={labelClassName}>
            Edition
          </label>
          <input
            id="edition"
            name="edition"
            value={values.edition}
            onChange={(event) => updateField("edition", event.target.value)}
            className={inputClassName}
          />
        </div>

        <div>
          <label htmlFor="resolution" className={labelClassName}>
            Resolution
          </label>
          <input
            id="resolution"
            name="resolution"
            value={values.resolution}
            onChange={(event) => updateField("resolution", event.target.value)}
            className={inputClassName}
          />
        </div>

        <div>
          <label htmlFor="file_type" className={labelClassName}>
            File type
          </label>
          <input
            id="file_type"
            name="file_type"
            value={values.file_type}
            onChange={(event) => updateField("file_type", event.target.value)}
            className={inputClassName}
          />
        </div>

        <div>
          <label htmlFor="status" className={labelClassName}>
            Status
          </label>
          <select
            id="status"
            name="status"
            required
            value={values.status}
            onChange={(event) => updateField("status", event.target.value)}
            className={inputClassName}
          >
            {PRODUCT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status.replace(/_/g, " ")}
              </option>
            ))}
          </select>
          {fieldErrors.status ? (
            <p className={errorClassName}>{fieldErrors.status}</p>
          ) : null}
        </div>

        <div>
          <label htmlFor="sort_order" className={labelClassName}>
            Sort order
          </label>
          <input
            id="sort_order"
            name="sort_order"
            inputMode="numeric"
            value={values.sort_order}
            onChange={(event) => updateField("sort_order", event.target.value)}
            className={inputClassName}
          />
          {fieldErrors.sort_order ? (
            <p className={errorClassName}>{fieldErrors.sort_order}</p>
          ) : null}
        </div>

        <div className="md:col-span-2">
          <label className="flex items-center gap-3 text-[15px] text-[#111111]">
            <input
              type="checkbox"
              name="is_featured"
              checked={values.is_featured}
              onChange={(event) =>
                updateField("is_featured", event.target.checked)
              }
              className="h-4 w-4 border border-[#ECE8E2]"
            />
            Featured artwork
          </label>
        </div>

        <div className="md:col-span-2">
          <label htmlFor="stripe_price_id" className={labelClassName}>
            Stripe price ID
          </label>
          <input
            id="stripe_price_id"
            name="stripe_price_id"
            value={values.stripe_price_id}
            onChange={(event) =>
              updateField("stripe_price_id", event.target.value)
            }
            placeholder="price_..."
            className={inputClassName}
          />
        </div>
      </section>

      <input type="hidden" name="image_url" value={values.image_url} />
      <input type="hidden" name="thumbnail_url" value={values.thumbnail_url} />

      <section className="space-y-6 border border-[#ECE8E2] bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-light tracking-[-0.02em]">
              Preview image
            </h2>
            <p className="mt-3 max-w-2xl text-[14px] leading-6 text-neutral-600">
              Upload a catalog preview image to the public product-previews
              bucket. PNG, JPG, or WebP up to 20 MB.
            </p>
          </div>
          <AssetStatusBadge
            label={
              previewUploadError
                ? "Upload failed"
                : previewUploading
                  ? "Uploading…"
                  : previewReady
                    ? "Preview ready"
                    : "No preview uploaded"
            }
            tone={
              previewUploadError
                ? "failed"
                : previewUploading
                  ? "uploading"
                  : previewReady
                    ? "ready"
                    : "neutral"
            }
          />
        </div>

        {previewSource ? (
          <div className="relative aspect-[4/3] max-w-xs overflow-hidden border border-[#ECE8E2] bg-[#FAFAF8]">
            <Image
              src={previewSource}
              alt=""
              fill
              sizes="320px"
              className="object-cover"
              unoptimized={previewSource.startsWith("blob:")}
            />
          </div>
        ) : null}

        {previewUploadError ? (
          <p className={errorClassName}>{previewUploadError}</p>
        ) : null}

        <input
          ref={previewInputRef}
          id="preview-image-input"
          type="file"
          accept={`${ACCEPT_PREVIEW_EXTENSIONS},${ACCEPT_PREVIEW_MIME_TYPES}`}
          className="sr-only"
          disabled={isSaving}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              handlePreviewSelection(file);
            }
            event.target.value = "";
          }}
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={() => previewInputRef.current?.click()}
            disabled={isSaving}
            className="inline-flex items-center justify-center border border-[#111111] bg-[#111111] px-6 py-3 text-[11px] uppercase tracking-[0.18em] text-white transition-colors hover:bg-transparent hover:text-[#111111] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {previewReady ? "Replace preview" : "Choose preview image"}
          </button>
          {mode === "edit" && activeProductId && previewReady && !previewUploading ? (
            <button
              type="button"
              onClick={() => void removePreview()}
              disabled={isSaving}
              className="inline-flex items-center justify-center border border-[#ECE8E2] px-6 py-3 text-[11px] uppercase tracking-[0.18em] text-[#111111] transition-colors hover:border-[#111111] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Remove preview
            </button>
          ) : null}
          {pendingPreviewFile ? (
            <p className="text-[13px] text-neutral-600">
              Selected: {pendingPreviewFile.name}
              {mode === "create" ? " (uploads after save)" : ""}
            </p>
          ) : null}
        </div>

        {previewProgress !== null ? (
          <UploadProgressBar percent={previewProgress} label="Uploading preview" />
        ) : null}
      </section>

      <section className="space-y-6 border border-[#ECE8E2] bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-light tracking-[-0.02em]">
              Delivery file
            </h2>
            <p className="mt-3 max-w-2xl text-[14px] leading-6 text-neutral-600">
              Upload the private customer delivery file to the artwork-downloads
              bucket. ZIP, PNG, JPG, WebP, or PDF up to 500 MB.
            </p>
          </div>
          <AssetStatusBadge
            label={
              deliveryUploadError
                ? "Upload failed"
                : deliveryUploading
                  ? "Uploading…"
                  : deliveryReady
                    ? "Delivery file ready"
                    : "No delivery file"
            }
            tone={
              deliveryUploadError
                ? "failed"
                : deliveryUploading
                  ? "uploading"
                  : deliveryReady
                    ? "ready"
                    : "neutral"
            }
          />
        </div>

        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className={labelClassName}>Filename</dt>
            <dd className="mt-2 text-[15px]">
              {pendingDeliveryFile?.name ?? deliveryFile.filename ?? "—"}
            </dd>
          </div>
          <div>
            <dt className={labelClassName}>MIME type</dt>
            <dd className="mt-2 text-[15px]">
              {pendingDeliveryFile?.type ?? deliveryFile.mimeType ?? "—"}
            </dd>
          </div>
          <div>
            <dt className={labelClassName}>Size</dt>
            <dd className="mt-2 text-[15px]">
              {pendingDeliveryFile
                ? formatUploadBytes(pendingDeliveryFile.size)
                : deliveryFile.sizeBytes != null
                  ? formatUploadBytes(deliveryFile.sizeBytes)
                  : "—"}
            </dd>
          </div>
          <div>
            <dt className={labelClassName}>Version</dt>
            <dd className="mt-2 text-[15px]">
              {deliveryFile.version ?? "—"}
            </dd>
          </div>
        </dl>

        {deliveryUploadError ? (
          <p className={errorClassName}>{deliveryUploadError}</p>
        ) : null}

        <input
          ref={deliveryInputRef}
          id="delivery-file-input"
          type="file"
          accept={`${ACCEPT_UPLOAD_EXTENSIONS},${ACCEPT_UPLOAD_MIME_TYPES}`}
          className="sr-only"
          disabled={isSaving}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              handleDeliverySelection(file);
            }
            event.target.value = "";
          }}
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={() => deliveryInputRef.current?.click()}
            disabled={isSaving}
            className="inline-flex items-center justify-center border border-[#111111] bg-[#111111] px-6 py-3 text-[11px] uppercase tracking-[0.18em] text-white transition-colors hover:bg-transparent hover:text-[#111111] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {deliveryReady ? "Replace delivery file" : "Choose delivery file"}
          </button>
          {mode === "edit" && activeProductId && deliveryFile.configured && !deliveryUploading ? (
            <button
              type="button"
              onClick={() => void removeDeliveryFile()}
              disabled={isSaving}
              className="inline-flex items-center justify-center border border-[#ECE8E2] px-6 py-3 text-[11px] uppercase tracking-[0.18em] text-[#111111] transition-colors hover:border-[#111111] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Remove delivery file
            </button>
          ) : null}
          {pendingDeliveryFile ? (
            <p className="text-[13px] text-neutral-600">
              Selected: {pendingDeliveryFile.name}
              {mode === "create" ? " (uploads after save)" : ""}
            </p>
          ) : null}
        </div>

        {deliveryProgress !== null ? (
          <UploadProgressBar percent={deliveryProgress} label="Uploading delivery file" />
        ) : null}
      </section>

      <div className="flex flex-col gap-4 border-t border-[#ECE8E2] pt-8 sm:flex-row">
        <button
          type="submit"
          disabled={isSaving}
          aria-busy={isSaving}
          className="inline-flex items-center justify-center border border-[#111111] bg-[#111111] px-8 py-3.5 text-[11px] uppercase tracking-[0.18em] text-white transition-colors duration-300 hover:bg-transparent hover:text-[#111111] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving
            ? uploadPhase === "preview"
              ? "Uploading preview…"
              : uploadPhase === "delivery"
                ? "Uploading delivery file…"
                : "Saving…"
            : mode === "create"
              ? "Create artwork"
              : "Save changes"}
        </button>
        <Link
          href="/admin/products"
          className="inline-flex items-center justify-center border border-[#ECE8E2] px-8 py-3.5 text-[11px] uppercase tracking-[0.18em] text-[#111111] transition-colors hover:border-[#111111]"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
