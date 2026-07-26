"use client";

import { useActionState } from "react";
import {
  updateCollectionAction,
  type ActionState,
} from "@/lib/admin/actions";
import type { CatalogCollectionRow } from "@/types/database";

type CollectionFormProps = {
  collection: CatalogCollectionRow;
};

const inputClassName =
  "mt-2 w-full border border-[#ECE8E2] bg-white px-4 py-3 text-[15px] text-[#111111] outline-none transition-colors focus-visible:border-[#111111]";
const labelClassName =
  "block text-[11px] uppercase tracking-[0.28em] text-neutral-500";
const errorClassName = "mt-2 text-[13px] leading-6 text-neutral-600";

export default function CollectionForm({ collection }: CollectionFormProps) {
  const boundAction = updateCollectionAction.bind(null, collection.id);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    boundAction,
    {},
  );

  const fieldErrors = state.fieldErrors ?? {};

  return (
    <form
      action={formAction}
      className="border border-[#ECE8E2] bg-white p-6"
      noValidate
    >
      <input type="hidden" name="slug" value={collection.slug} />

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1 space-y-6">
          <div>
            <p className={labelClassName}>Slug</p>
            <p className="mt-2 font-mono text-sm text-neutral-600">
              {collection.slug}
            </p>
          </div>

          <div>
            <label htmlFor={`name-${collection.id}`} className={labelClassName}>
              Name
            </label>
            <input
              id={`name-${collection.id}`}
              name="name"
              required
              defaultValue={collection.name}
              className={inputClassName}
            />
            {fieldErrors.name ? (
              <p className={errorClassName}>{fieldErrors.name}</p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor={`description-${collection.id}`}
              className={labelClassName}
            >
              Description
            </label>
            <textarea
              id={`description-${collection.id}`}
              name="description"
              rows={4}
              defaultValue={collection.description}
              className={`${inputClassName} resize-y`}
            />
          </div>

          <div className="max-w-xs">
            <label
              htmlFor={`sort-order-${collection.id}`}
              className={labelClassName}
            >
              Sort order
            </label>
            <input
              id={`sort-order-${collection.id}`}
              name="sort_order"
              inputMode="numeric"
              defaultValue={String(collection.sort_order)}
              className={inputClassName}
            />
            {fieldErrors.sort_order ? (
              <p className={errorClassName}>{fieldErrors.sort_order}</p>
            ) : null}
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-3 lg:min-w-[180px]">
          <button
            type="submit"
            disabled={pending}
            aria-busy={pending}
            className="inline-flex items-center justify-center border border-[#111111] bg-[#111111] px-6 py-3 text-[11px] uppercase tracking-[0.18em] text-white transition-colors duration-300 hover:bg-transparent hover:text-[#111111] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? "Saving…" : "Save"}
          </button>

          {state.error ? (
            <p className={errorClassName} role="alert">
              {state.error}
            </p>
          ) : null}
        </div>
      </div>
    </form>
  );
}
