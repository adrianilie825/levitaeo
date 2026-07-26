"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { ProductDeliveryFileSummary } from "@/lib/admin/product-delivery";
import {
  ACCEPT_UPLOAD_EXTENSIONS,
  ACCEPT_UPLOAD_MIME_TYPES,
} from "@/lib/downloads/upload-constants";
import {
  formatUploadBytes,
  validateUploadFileMeta,
} from "@/lib/downloads/upload-validation";

type ProductFileUploadProps = {
  productId: string;
  initialFile: ProductDeliveryFileSummary;
};

type UploadState = "idle" | "uploading" | "success" | "error";

export default function ProductFileUpload({
  productId,
  initialFile,
}: ProductFileUploadProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileInfo, setFileInfo] = useState(initialFile);
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [showReplaceConfirm, setShowReplaceConfirm] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);

  useEffect(() => {
    setFileInfo(initialFile);
  }, [initialFile]);

  const labelClassName =
    "block text-[11px] uppercase tracking-[0.28em] text-neutral-500";
  const valueClassName = "mt-2 text-[15px] text-[#111111]";

  function resetMessages() {
    setErrorMessage(null);
    setUploadState("idle");
  }

  function validateSelectedFile(file: File): string | null {
    const validation = validateUploadFileMeta({
      name: file.name,
      size: file.size,
      type: file.type,
    });

    return validation.ok ? null : validation.message;
  }

  function beginUpload(file: File) {
    const validationError = validateSelectedFile(file);

    if (validationError) {
      setErrorMessage(validationError);
      setUploadState("error");
      return;
    }

    if (fileInfo.configured) {
      setPendingFile(file);
      setShowReplaceConfirm(true);
      return;
    }

    void performUpload(file);
  }

  async function performUpload(file: File) {
    setUploadState("uploading");
    setErrorMessage(null);
    setShowReplaceConfirm(false);
    setPendingFile(null);

    const body = new FormData();
    body.append("file", file);

    try {
      const response = await fetch(`/api/admin/products/${productId}/upload`, {
        method: "POST",
        body,
        credentials: "same-origin",
        cache: "no-store",
      });

      const payload = (await response.json()) as {
        error?: string;
        configured?: boolean;
        filename?: string;
        mimeType?: string;
        sizeBytes?: number;
        version?: string;
      };

      if (!response.ok) {
        setErrorMessage(payload.error ?? "Upload failed.");
        setUploadState("error");
        return;
      }

      setFileInfo({
        configured: true,
        filename: payload.filename ?? file.name,
        mimeType: payload.mimeType ?? file.type,
        sizeBytes: payload.sizeBytes ?? file.size,
        version: payload.version ?? null,
        storagePath: null,
      });
      setUploadState("success");
      router.refresh();
    } catch {
      setErrorMessage("Network error during upload. Please try again.");
      setUploadState("error");
    }
  }

  async function performRemove() {
    setUploadState("uploading");
    setErrorMessage(null);
    setShowRemoveConfirm(false);

    try {
      const response = await fetch(`/api/admin/products/${productId}/upload`, {
        method: "DELETE",
        credentials: "same-origin",
        cache: "no-store",
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        setErrorMessage(payload.error ?? "The file could not be removed.");
        setUploadState("error");
        return;
      }

      setFileInfo({
        configured: false,
        filename: null,
        mimeType: null,
        sizeBytes: null,
        version: null,
        storagePath: null,
      });
      setUploadState("success");
      router.refresh();
    } catch {
      setErrorMessage("Network error during removal. Please try again.");
      setUploadState("error");
    }
  }

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    resetMessages();

    if (file) {
      beginUpload(file);
    }

    event.target.value = "";
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragActive(false);
    resetMessages();

    const file = event.dataTransfer.files?.[0];

    if (file) {
      beginUpload(file);
    }
  }

  const statusLabel = fileInfo.configured ? "File ready" : "No file configured";
  const uploadStatus =
    uploadState === "uploading"
      ? "Uploading…"
      : uploadState === "success"
        ? "Saved"
        : uploadState === "error"
          ? "Needs attention"
          : "Ready";

  return (
    <section className="space-y-8 border border-[#ECE8E2] bg-white p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-light tracking-[-0.02em]">
            Digital delivery file
          </h2>
          <p className="mt-3 max-w-2xl text-[14px] leading-6 text-neutral-600">
            Upload a private artwork file to the artwork-downloads bucket.
            Customers receive short-lived signed URLs only after purchase
            verification.
          </p>
        </div>

        <div className="inline-flex w-fit items-center border border-[#ECE8E2] px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-[#111111]">
          {statusLabel}
        </div>
      </div>

      <dl className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <dt className={labelClassName}>Filename</dt>
          <dd className={valueClassName}>{fileInfo.filename ?? "—"}</dd>
        </div>
        <div>
          <dt className={labelClassName}>Type</dt>
          <dd className={valueClassName}>{fileInfo.mimeType ?? "—"}</dd>
        </div>
        <div>
          <dt className={labelClassName}>Size</dt>
          <dd className={valueClassName}>
            {formatUploadBytes(fileInfo.sizeBytes)}
          </dd>
        </div>
        <div>
          <dt className={labelClassName}>Version</dt>
          <dd className={valueClassName}>{fileInfo.version ?? "—"}</dd>
        </div>
      </dl>

      <div>
        <p className={labelClassName}>Upload status</p>
        <p className={valueClassName}>{uploadStatus}</p>
      </div>

      <div
        onDragEnter={(event) => {
          event.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setDragActive(false);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
        className={`border border-dashed px-6 py-10 text-center transition-colors ${
          dragActive
            ? "border-[#111111] bg-[#FAFAF8]"
            : "border-[#ECE8E2] bg-white"
        }`}
      >
        <input
          ref={inputRef}
          id={`product-file-${productId}`}
          type="file"
          accept={`${ACCEPT_UPLOAD_EXTENSIONS},${ACCEPT_UPLOAD_MIME_TYPES}`}
          className="sr-only"
          onChange={handleInputChange}
          disabled={uploadState === "uploading"}
        />
        <label
          htmlFor={`product-file-${productId}`}
          className="cursor-pointer"
        >
          <p className="text-[15px] text-[#111111]">
            Drag and drop a file here, or choose a file
          </p>
          <p className="mt-3 text-[13px] leading-6 text-neutral-600">
            .zip, .png, .jpg, .jpeg, .webp, .pdf up to 500 MB
          </p>
        </label>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploadState === "uploading"}
          className="inline-flex items-center justify-center border border-[#111111] bg-[#111111] px-6 py-3 text-[11px] uppercase tracking-[0.18em] text-white transition-colors hover:bg-transparent hover:text-[#111111] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {fileInfo.configured ? "Replace file" : "Upload file"}
        </button>

        {fileInfo.configured ? (
          <button
            type="button"
            onClick={() => setShowRemoveConfirm(true)}
            disabled={uploadState === "uploading"}
            className="inline-flex items-center justify-center border border-[#ECE8E2] px-6 py-3 text-[11px] uppercase tracking-[0.18em] text-[#111111] transition-colors hover:border-[#111111] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Remove file
          </button>
        ) : null}
      </div>

      {showReplaceConfirm && pendingFile ? (
        <div
          className="border border-[#ECE8E2] bg-[#FAFAF8] p-4"
          role="alertdialog"
          aria-labelledby={`replace-title-${productId}`}
        >
          <p
            id={`replace-title-${productId}`}
            className="text-[15px] text-[#111111]"
          >
            Replace the current delivery file with{" "}
            <span className="font-medium">{pendingFile.name}</span>?
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => void performUpload(pendingFile)}
              className="inline-flex items-center justify-center border border-[#111111] bg-[#111111] px-5 py-2.5 text-[11px] uppercase tracking-[0.18em] text-white"
            >
              Confirm replace
            </button>
            <button
              type="button"
              onClick={() => {
                setShowReplaceConfirm(false);
                setPendingFile(null);
              }}
              className="inline-flex items-center justify-center border border-[#ECE8E2] px-5 py-2.5 text-[11px] uppercase tracking-[0.18em]"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      {showRemoveConfirm ? (
        <div
          className="border border-[#ECE8E2] bg-[#FAFAF8] p-4"
          role="alertdialog"
          aria-labelledby={`remove-title-${productId}`}
        >
          <p
            id={`remove-title-${productId}`}
            className="text-[15px] text-[#111111]"
          >
            Remove the delivery file metadata and delete the private storage
            object?
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => void performRemove()}
              className="inline-flex items-center justify-center border border-[#111111] bg-[#111111] px-5 py-2.5 text-[11px] uppercase tracking-[0.18em] text-white"
            >
              Confirm remove
            </button>
            <button
              type="button"
              onClick={() => setShowRemoveConfirm(false)}
              className="inline-flex items-center justify-center border border-[#ECE8E2] px-5 py-2.5 text-[11px] uppercase tracking-[0.18em]"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      {errorMessage ? (
        <p className="text-[13px] leading-6 text-neutral-600" role="alert">
          {errorMessage}
        </p>
      ) : null}

      {initialFile.storagePath ? (
        <details
          open={showAdvanced}
          onToggle={(event) =>
            setShowAdvanced((event.currentTarget as HTMLDetailsElement).open)
          }
          className="border-t border-[#ECE8E2] pt-6"
        >
          <summary className="cursor-pointer text-[11px] uppercase tracking-[0.18em] text-neutral-500">
            Advanced storage details
          </summary>
          <p className="mt-3 font-mono text-xs text-neutral-600">
            {initialFile.storagePath}
          </p>
        </details>
      ) : null}
    </section>
  );
}
