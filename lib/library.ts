import "server-only";

import { createClient } from "@/lib/supabase/server";
import { PRODUCT_FALLBACK_IMAGE } from "@/lib/product-catalog";
import { getProductCatalogPath } from "@/lib/products-db";
import type {
  CatalogCollectionRow,
  CatalogProductRow,
  EntitlementStatus,
  OrderStatus,
} from "@/types/database";

export type LibraryArtwork = {
  entitlementId: string;
  productId: string | null;
  slug: string;
  title: string;
  subtitle: string;
  collectionName: string;
  collectionSlug: string;
  imageUrl: string;
  thumbnailUrl: string;
  edition: string;
  resolution: string;
  fileType: string;
  purchasedAt: string;
  orderStatus: OrderStatus;
  entitlementStatus: EntitlementStatus;
  isDownloadReady: boolean;
  detailPath: string | null;
};

export type UserLibrary = {
  artworks: LibraryArtwork[];
};

type EntitlementQueryRow = {
  id: string;
  order_id: string;
  order_item_id: string;
  product_slug: string;
  product_id: string | null;
  status: EntitlementStatus;
  granted_at: string;
};

type OrderQueryRow = {
  id: string;
  status: OrderStatus;
  paid_at: string | null;
  created_at: string;
};

type OrderItemQueryRow = {
  id: string;
  product_slug: string;
  product_title: string;
  product_edition: string | null;
  collection: string | null;
  product_id: string | null;
};

type ProductQueryRow = Pick<
  CatalogProductRow,
  | "id"
  | "slug"
  | "title"
  | "subtitle"
  | "collection_id"
  | "image_url"
  | "thumbnail_url"
  | "edition"
  | "resolution"
  | "file_type"
  | "status"
>;

const LIBRARY_PRODUCT_COLUMNS =
  "id, slug, title, subtitle, collection_id, image_url, thumbnail_url, edition, resolution, file_type, status" as const;
const DEFAULT_RESOLUTION = "High resolution";
const DEFAULT_FILE_TYPE = "Digital edition";

function normalizeCollectionSlug(value: string | null | undefined): string {
  const trimmed = value?.trim().toLowerCase() ?? "";

  if (!trimmed) {
    return "originals";
  }

  return trimmed.replace(/\s+/g, "-");
}

function resolveLibraryImageUrl(
  slug: string,
  imageUrl: string | null | undefined,
  thumbnailUrl: string | null | undefined,
): string {
  const candidate = thumbnailUrl?.trim() || imageUrl?.trim();

  if (candidate) {
    return candidate;
  }

  if (slug.startsWith("originals-")) {
    return `/images/originals/${slug}.png`;
  }

  return PRODUCT_FALLBACK_IMAGE;
}

function isPublicProductStatus(status: string | null | undefined): boolean {
  return status === "published" || status === "coming_soon";
}

function buildLibraryArtwork(input: {
  entitlement: EntitlementQueryRow;
  order: OrderQueryRow | undefined;
  orderItem: OrderItemQueryRow | undefined;
  product: ProductQueryRow | undefined;
  collection: Pick<CatalogCollectionRow, "slug" | "name"> | undefined;
}): LibraryArtwork {
  const { entitlement, order, orderItem, product, collection } = input;
  const slug = product?.slug ?? entitlement.product_slug ?? orderItem?.product_slug ?? "unknown-edition";
  const collectionName =
    collection?.name ??
    orderItem?.collection?.trim() ??
    "Originals";
  const collectionSlug =
    collection?.slug ??
    normalizeCollectionSlug(orderItem?.collection) ??
    "originals";
  const title =
    product?.title ??
    orderItem?.product_title?.trim() ??
    slug.replace(/-/g, " ");
  const edition =
    product?.edition?.trim() ||
    orderItem?.product_edition?.trim() ||
    "Edition";
  const imageUrl = resolveLibraryImageUrl(
    slug,
    product?.image_url,
    product?.thumbnail_url,
  );
  const purchasedAt =
    order?.paid_at ??
    entitlement.granted_at ??
    order?.created_at ??
    entitlement.granted_at;
  const resolvedProductId =
    entitlement.product_id ?? product?.id ?? orderItem?.product_id ?? null;
  const isDownloadReady =
    entitlement.status === "active" &&
    order?.status === "paid" &&
    Boolean(resolvedProductId);

  return {
    entitlementId: entitlement.id,
    productId: resolvedProductId,
    slug,
    title,
    subtitle: product?.subtitle?.trim() ?? "",
    collectionName,
    collectionSlug,
    imageUrl,
    thumbnailUrl: imageUrl,
    edition,
    resolution: product?.resolution?.trim() || DEFAULT_RESOLUTION,
    fileType: product?.file_type?.trim() || DEFAULT_FILE_TYPE,
    purchasedAt,
    orderStatus: order?.status ?? "paid",
    entitlementStatus: entitlement.status,
    isDownloadReady,
    detailPath: isPublicProductStatus(product?.status)
      ? getProductCatalogPath(slug, collectionSlug)
      : null,
  };
}

function logLibraryInfo(message: string, extra?: Record<string, unknown>) {
  console.info(`[library] ${message}`, extra ?? {});
}

function logLibraryQuery(
  queryName: string,
  extra?: Record<string, unknown>,
) {
  logLibraryInfo(`Query start: ${queryName}`, extra);
}

function logLibraryQueryError(
  queryName: string,
  error: unknown,
  extra?: Record<string, unknown>,
) {
  const normalized =
    typeof error === "object" && error !== null
      ? {
          message: "message" in error ? String(error.message) : String(error),
          code: "code" in error ? String(error.code) : undefined,
          details: "details" in error ? String(error.details) : undefined,
          hint: "hint" in error ? String(error.hint) : undefined,
        }
      : { message: String(error) };

  console.error(`[library] Query failed: ${queryName}`, {
    ...extra,
    error: normalized,
  });
}

function throwLoggedLibraryQueryError(
  queryName: string,
  error: unknown,
  extra?: Record<string, unknown>,
): never {
  logLibraryQueryError(queryName, error, extra);
  throw error;
}

export async function getCurrentUserLibrary(): Promise<UserLibrary | null> {
  logLibraryInfo("Loading library for current user.");

  const supabase = await createClient();
  logLibraryQuery("auth.getUser");

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    logLibraryQueryError("auth.getUser", userError);
    return null;
  }

  if (!user) {
    logLibraryInfo("auth.getUser returned no authenticated user.");
    return null;
  }

  logLibraryInfo("Authenticated user resolved.", {
    userId: user.id,
    emailPresent: Boolean(user.email),
  });

  logLibraryQuery("entitlements.select", { userId: user.id });

  const { data: entitlementRows, error: entitlementsError } = await supabase
    .from("entitlements")
    .select(
      "id, order_id, order_item_id, product_slug, product_id, status, granted_at",
    )
    .order("granted_at", { ascending: false });

  if (entitlementsError) {
    throwLoggedLibraryQueryError("entitlements.select", entitlementsError, {
      userId: user.id,
    });
  }

  const entitlements = (entitlementRows ?? []) as EntitlementQueryRow[];

  logLibraryInfo("entitlements.select succeeded.", {
    userId: user.id,
    rowCount: entitlements.length,
  });

  if (entitlements.length === 0) {
    return { artworks: [] };
  }

  const orderIds = [...new Set(entitlements.map((row) => row.order_id))];
  const orderItemIds = entitlements.map((row) => row.order_item_id);
  const productIds = [
    ...new Set(
      entitlements
        .map((row) => row.product_id)
        .filter((value): value is string => Boolean(value)),
    ),
  ];
  const productSlugs = [
    ...new Set(
      entitlements
        .map((row) => row.product_slug?.trim())
        .filter((value): value is string => Boolean(value)),
    ),
  ];

  logLibraryQuery("orders.select", {
    userId: user.id,
    orderIdCount: orderIds.length,
  });
  logLibraryQuery("order_items.select", {
    userId: user.id,
    orderItemIdCount: orderItemIds.length,
  });
  logLibraryQuery("products.select_by_id", {
    userId: user.id,
    productIdCount: productIds.length,
  });
  logLibraryQuery("products.select_by_slug", {
    userId: user.id,
    productSlugCount: productSlugs.length,
  });
  logLibraryQuery("collections.select", { userId: user.id });

  const [
    { data: orderRows, error: ordersError },
    { data: orderItemRows, error: orderItemsError },
    productsByIdResult,
    productsBySlugResult,
    { data: collectionRows, error: collectionsError },
  ] = await Promise.all([
    supabase
      .from("orders")
      .select("id, status, paid_at, created_at")
      .in("id", orderIds),
    supabase
      .from("order_items")
      .select(
        "id, product_slug, product_title, product_edition, collection, product_id",
      )
      .in("id", orderItemIds),
    productIds.length > 0
      ? supabase
          .from("products")
          .select(LIBRARY_PRODUCT_COLUMNS)
          .in("id", productIds)
      : Promise.resolve({ data: [], error: null }),
    productSlugs.length > 0
      ? supabase
          .from("products")
          .select(LIBRARY_PRODUCT_COLUMNS)
          .in("slug", productSlugs)
      : Promise.resolve({ data: [], error: null }),
    supabase.from("collections").select("id, slug, name"),
  ]);

  if (ordersError) {
    throwLoggedLibraryQueryError("orders.select", ordersError, {
      userId: user.id,
      orderIdCount: orderIds.length,
    });
  }

  logLibraryInfo("orders.select succeeded.", {
    userId: user.id,
    rowCount: orderRows?.length ?? 0,
  });

  if (orderItemsError) {
    throwLoggedLibraryQueryError("order_items.select", orderItemsError, {
      userId: user.id,
      orderItemIdCount: orderItemIds.length,
    });
  }

  logLibraryInfo("order_items.select succeeded.", {
    userId: user.id,
    rowCount: orderItemRows?.length ?? 0,
  });

  if (collectionsError) {
    throwLoggedLibraryQueryError("collections.select", collectionsError, {
      userId: user.id,
    });
  }

  logLibraryInfo("collections.select succeeded.", {
    userId: user.id,
    rowCount: collectionRows?.length ?? 0,
  });

  if (productsByIdResult.error) {
    throwLoggedLibraryQueryError("products.select_by_id", productsByIdResult.error, {
      userId: user.id,
      productIdCount: productIds.length,
      selectedColumns: LIBRARY_PRODUCT_COLUMNS,
    });
  }

  logLibraryInfo("products.select_by_id succeeded.", {
    userId: user.id,
    rowCount: productsByIdResult.data?.length ?? 0,
  });

  if (productsBySlugResult.error) {
    throwLoggedLibraryQueryError("products.select_by_slug", productsBySlugResult.error, {
      userId: user.id,
      productSlugCount: productSlugs.length,
      productSlugs,
      selectedColumns: LIBRARY_PRODUCT_COLUMNS,
    });
  }

  logLibraryInfo("products.select_by_slug succeeded.", {
    userId: user.id,
    rowCount: productsBySlugResult.data?.length ?? 0,
  });

  const ordersById = new Map(
    ((orderRows ?? []) as OrderQueryRow[]).map((row) => [row.id, row]),
  );
  const orderItemsById = new Map(
    ((orderItemRows ?? []) as OrderItemQueryRow[]).map((row) => [row.id, row]),
  );
  const collectionsById = new Map(
    ((collectionRows ?? []) as Pick<CatalogCollectionRow, "id" | "slug" | "name">[]).map(
      (row) => [row.id, row],
    ),
  );

  const productsById = new Map<string, ProductQueryRow>();
  const productsBySlug = new Map<string, ProductQueryRow>();

  for (const row of [
    ...(((productsByIdResult.data ?? []) as ProductQueryRow[]) ?? []),
    ...(((productsBySlugResult.data ?? []) as ProductQueryRow[]) ?? []),
  ]) {
    productsById.set(row.id, row);
    productsBySlug.set(row.slug, row);
  }

  const artworks = entitlements.map((entitlement) => {
    const orderItem = orderItemsById.get(entitlement.order_item_id);
    const product =
      (entitlement.product_id
        ? productsById.get(entitlement.product_id)
        : undefined) ??
      productsBySlug.get(entitlement.product_slug) ??
      (orderItem?.product_id
        ? productsById.get(orderItem.product_id)
        : undefined) ??
      (orderItem?.product_slug
        ? productsBySlug.get(orderItem.product_slug)
        : undefined);

    const collection = product?.collection_id
      ? collectionsById.get(product.collection_id)
      : undefined;

    return buildLibraryArtwork({
      entitlement,
      order: ordersById.get(entitlement.order_id),
      orderItem,
      product,
      collection,
    });
  });

  logLibraryInfo("Library load completed.", {
    userId: user.id,
    artworkCount: artworks.length,
  });

  return { artworks };
}
