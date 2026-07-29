"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  deleteProductAction,
  toggleProductPublishAction,
} from "@/lib/admin/actions";
import { statusLabel } from "@/lib/admin/product-constants";
import { useAdminToast } from "@/components/admin/AdminToastProvider";

type ProductRowActionsProps = {
  productId: string;
  productTitle: string;
  status: string;
};

export default function ProductRowActions({
  productId,
  productTitle,
  status,
}: ProductRowActionsProps) {
  const router = useRouter();
  const { showSuccess, showError } = useAdminToast();
  const [pendingAction, setPendingAction] = useState<
    "publish" | "delete" | null
  >(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const deleteButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (showDeleteConfirm) {
      deleteButtonRef.current?.focus();
    }
  }, [showDeleteConfirm]);

  async function handlePublishToggle() {
    setPendingAction("publish");

    try {
      const result = await toggleProductPublishAction(productId);

      if (result.error) {
        showError(result.error);
        return;
      }

      showSuccess(result.message ?? "Publish status updated.");
      router.refresh();
    } catch {
      showError("Publish status could not be updated.");
    } finally {
      setPendingAction(null);
    }
  }

  async function handleDelete() {
    setPendingAction("delete");

    try {
      const result = await deleteProductAction(productId);

      if (result.error) {
        showError(result.error);
        return;
      }

      showSuccess(result.message ?? "Artwork deleted.");
      setShowDeleteConfirm(false);
      router.refresh();
    } catch {
      showError("The artwork could not be deleted.");
    } finally {
      setPendingAction(null);
    }
  }

  const isPublished = status === "published";
  const publishLabel = isPublished ? "Unpublish" : "Publish";
  const isBusy = pendingAction !== null;

  return (
    <div className="flex flex-col gap-2">
      <Link
        href={`/admin/products/${productId}/edit`}
        className="text-[11px] uppercase tracking-[0.18em] text-[#111111] hover:underline"
      >
        Edit
      </Link>

      <button
        type="button"
        onClick={() => void handlePublishToggle()}
        disabled={isBusy}
        aria-busy={pendingAction === "publish"}
        className="text-left text-[11px] uppercase tracking-[0.18em] text-neutral-600 transition-colors hover:text-[#111111] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pendingAction === "publish" ? "Updating…" : publishLabel}
      </button>

      <button
        type="button"
        onClick={() => setShowDeleteConfirm(true)}
        disabled={isBusy}
        className="text-left text-[11px] uppercase tracking-[0.18em] text-neutral-600 transition-colors hover:text-[#111111] disabled:cursor-not-allowed disabled:opacity-60"
      >
        Delete
      </button>

      {showDeleteConfirm ? (
        <div
          className="mt-2 min-w-[14rem] border border-[#ECE8E2] bg-[#FAFAF8] p-4"
          role="alertdialog"
          aria-labelledby={`delete-title-${productId}`}
          aria-describedby={`delete-desc-${productId}`}
        >
          <p
            id={`delete-title-${productId}`}
            className="text-[14px] font-medium text-[#111111]"
          >
            Delete artwork?
          </p>
          <p
            id={`delete-desc-${productId}`}
            className="mt-2 text-[13px] leading-6 text-neutral-600"
          >
            This permanently removes{" "}
            <span className="font-medium">{productTitle}</span> and its preview
            and delivery files.
          </p>
          <div className="mt-4 flex flex-col gap-2">
            <button
              ref={deleteButtonRef}
              type="button"
              onClick={() => void handleDelete()}
              disabled={isBusy}
              aria-busy={pendingAction === "delete"}
              className="inline-flex items-center justify-center border border-[#111111] bg-[#111111] px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-white disabled:opacity-60"
            >
              {pendingAction === "delete" ? "Deleting…" : "Confirm delete"}
            </button>
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isBusy}
              className="inline-flex items-center justify-center border border-[#ECE8E2] px-4 py-2 text-[11px] uppercase tracking-[0.18em]"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      <span className="sr-only">
        Current status: {statusLabel(status)}
      </span>
    </div>
  );
}
