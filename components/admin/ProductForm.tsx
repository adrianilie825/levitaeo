"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import {
  createProductAction,
  updateProductAction,
  type ActionState,
} from "@/lib/admin/actions";
import {
  formatCentsToPriceInput,
  PRODUCT_STATUSES,
} from "@/lib/admin/product-constants";
import type { CatalogCollectionRow } from "@/types/database";

export type ProductFormValues = {
  title: string;
  slug: string;
  subtitle: string;
  description: string;
  collection_id: string;
  collection_slug: string;
  price: string;
  currency: string;
  image_url: string;
  thumbnail_url: string;
  edition: string;
  resolution: string;
  file_type: string;
  status: string;
  is_featured: boolean;
  stripe_price_id: string;
  sort_order: string;
};

type ProductFormProps = {
  mode: "create" | "edit";
  productId?: string;
  collections: Pick<CatalogCollectionRow, "id" | "slug" | "name">[];
  initialValues: ProductFormValues;
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

export default function ProductForm({
  mode,
  productId,
  collections,
  initialValues,
}: ProductFormProps) {
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

  useEffect(() => {
    setValues(initialValues);
    setSlugTouched(mode === "edit");
  }, [initialValues, mode]);

  function updateField<K extends keyof ProductFormValues>(
    key: K,
    value: ProductFormValues[K],
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

  const fieldErrors = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-10" noValidate>
      {state.error ? (
        <p className="border border-[#ECE8E2] bg-white px-4 py-3 text-[13px] leading-6 text-neutral-700" role="alert">
          {state.error}
        </p>
      ) : null}

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
            onChange={(event) => updateField("collection_id", event.target.value)}
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
            Featured product
          </label>
        </div>
      </section>

      <section className="grid gap-8 md:grid-cols-2">
        <div>
          <label htmlFor="image_url" className={labelClassName}>
            Image URL
          </label>
          <input
            id="image_url"
            name="image_url"
            value={values.image_url}
            onChange={(event) => updateField("image_url", event.target.value)}
            className={inputClassName}
          />
          {fieldErrors.image_url ? (
            <p className={errorClassName}>{fieldErrors.image_url}</p>
          ) : null}
        </div>

        <div>
          <label htmlFor="thumbnail_url" className={labelClassName}>
            Thumbnail URL
          </label>
          <input
            id="thumbnail_url"
            name="thumbnail_url"
            value={values.thumbnail_url}
            onChange={(event) =>
              updateField("thumbnail_url", event.target.value)
            }
            className={inputClassName}
          />
          {fieldErrors.thumbnail_url ? (
            <p className={errorClassName}>{fieldErrors.thumbnail_url}</p>
          ) : null}
        </div>

        {values.image_url ? (
          <div className="md:col-span-2">
            <p className={labelClassName}>Preview</p>
            <div className="relative mt-3 aspect-[4/3] max-w-xs overflow-hidden border border-[#ECE8E2] bg-white">
              <Image
                src={values.image_url}
                alt=""
                fill
                sizes="320px"
                className="object-cover"
              />
            </div>
          </div>
        ) : null}

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

      {mode === "create" ? (
        <section className="border border-[#ECE8E2] bg-white p-6">
          <h2 className="text-xl font-light tracking-[-0.02em]">
            Digital delivery file
          </h2>
          <p className="mt-3 max-w-2xl text-[14px] leading-6 text-neutral-600">
            Save the product first, then upload the private delivery file from
            the edit page.
          </p>
        </section>
      ) : null}

      <div className="flex flex-col gap-4 border-t border-[#ECE8E2] pt-8 sm:flex-row">
        <button
          type="submit"
          disabled={pending}
          aria-busy={pending}
          className="inline-flex items-center justify-center border border-[#111111] bg-[#111111] px-8 py-3.5 text-[11px] uppercase tracking-[0.18em] text-white transition-colors duration-300 hover:bg-transparent hover:text-[#111111] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending
            ? "Saving…"
            : mode === "create"
              ? "Create product"
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

export function productRowToFormValues(
  product: {
    collection_id: string;
    slug: string;
    title: string;
    subtitle: string;
    description: string;
    price_cents: number;
    currency: string;
    image_url: string;
    thumbnail_url: string;
    edition: string;
    resolution: string;
    file_type: string;
    status: string;
    is_featured: boolean;
    stripe_price_id: string | null;
    sort_order: number;
    collections: Pick<CatalogCollectionRow, "slug"> | null;
  },
  defaultCollectionSlug = "originals",
): ProductFormValues {
  return {
    title: product.title,
    slug: product.slug,
    subtitle: product.subtitle,
    description: product.description,
    collection_id: product.collection_id,
    collection_slug: product.collections?.slug ?? defaultCollectionSlug,
    price: formatCentsToPriceInput(product.price_cents),
    currency: product.currency,
    image_url: product.image_url,
    thumbnail_url: product.thumbnail_url,
    edition: product.edition,
    resolution: product.resolution,
    file_type: product.file_type,
    status: product.status,
    is_featured: product.is_featured,
    stripe_price_id: product.stripe_price_id ?? "",
    sort_order: String(product.sort_order),
  };
}

export function emptyProductFormValues(
  collections: Pick<CatalogCollectionRow, "id" | "slug">[],
): ProductFormValues {
  const firstCollection = collections[0];

  return {
    title: "",
    slug: "",
    subtitle: "",
    description: "",
    collection_id: firstCollection?.id ?? "",
    collection_slug: firstCollection?.slug ?? "originals",
    price: "0.00",
    currency: "EUR",
    image_url: "",
    thumbnail_url: "",
    edition: "",
    resolution: "",
    file_type: "",
    status: "draft",
    is_featured: false,
    stripe_price_id: "",
    sort_order: "0",
  };
}
