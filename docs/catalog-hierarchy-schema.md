# Editorial catalog hierarchy

Levitaeo organizes sellable work as a three-level editorial hierarchy:

```
Collection  →  Volume  →  Edition
(collections)   (volumes)   (products table)
```

## Examples

| Collection | Volume | Editions (products) |
|------------|--------|---------------------|
| Skylines | East Coast USA | Washington DC, New York, Boston, Philadelphia |
| Minimal | Minimal Architecture | Minimal Door, Minimal Window, Minimal Staircase |

## Database tables

### `collections` (unchanged)

Top-level editorial series. Supports hundreds of rows via indexed `slug` (globally unique).

| Column | Notes |
|--------|-------|
| `id` | UUID primary key |
| `slug` | Globally unique URL segment |
| `name`, `description`, `sort_order` | Display metadata |

### `volumes` (new in migration `012_editorial_catalog_volumes.sql`)

Mid-level grouping within one collection.

| Column | Notes |
|--------|-------|
| `id` | UUID primary key |
| `collection_id` | FK → `collections.id` (RESTRICT) |
| `slug` | Unique **within** `collection_id` |
| `name`, `description`, `sort_order` | Display metadata |

**Constraint:** `unique (collection_id, slug)` — scales to many collections each with many volumes.

### `products` (editions — table name retained)

Purchasable digital editions. Renaming to `editions` was avoided to preserve:

- FK from `order_items.product_id`, `entitlements.product_id`, `download_events.product_id`
- Stripe metadata and webhook RPC parameters using `product_slug`
- Storage paths under `products/{productId}/`

| Column | Change |
|--------|--------|
| `volume_id` | **Added.** NOT NULL FK → `volumes.id` (RESTRICT) |
| `collection_id` | **Retained.** Must match parent volume’s `collection_id` (trigger enforced) |
| `slug` | **Unchanged.** Globally unique; stable entitlement key |
| `edition` | Text label (e.g. `001`), not a FK |

## Migration backfill

Migration `012` creates:

1. A default volume per collection: slug `{collection-slug}-default`
2. For **Originals**, an additional volume `originals-series` and reassigns `originals-*` products to it
3. Sets `products.volume_id` NOT NULL on all rows

Existing purchases, entitlements, and downloads are unaffected — they reference edition UUID/slug, not volume.

## Purchase & download compatibility

| System | Identifier used | Impact |
|--------|-----------------|--------|
| Checkout | `products.slug`, `products.stripe_price_id` | None |
| Webhook fulfillment | `product_slug`, `product_id` | None |
| Entitlements | `product_slug`, `product_id` | None |
| Secure download | `products.id`, `products.download_*` | None |

Optional future enhancement: snapshot `volume_slug` on `order_items` at purchase time (not required for this migration).

## Public column grants

Browser roles (`anon`, `authenticated`) may `SELECT`:

- All columns on `volumes`
- Public catalog columns on `products`, including new `volume_id`
- Private columns (`download_*`, `stripe_product_id`) remain service-role only

## API surface (backend)

| Route | Purpose |
|-------|---------|
| `GET /api/catalog/collections` | List collections |
| `GET /api/catalog/collections/[collectionSlug]/volumes` | List volumes in a collection |
| `GET /api/catalog/collections/[collectionSlug]/volumes/[volumeSlug]/editions` | List editions in a volume |
| `GET /api/catalog/editions/[slug]` | Single edition by global slug (checkout-compatible) |
| `GET/POST /api/admin/volumes` | Admin list/create volumes |
| `GET/PATCH/DELETE /api/admin/volumes/[volumeId]` | Admin volume CRUD |
| `GET /api/admin/collections/[collectionId]/volumes` | Admin volumes for collection |

## Canonical URL paths (for future UI)

- Collection: `/collections/{collectionSlug}`
- Volume: `/collections/{collectionSlug}/{volumeSlug}`
- Edition: `/collections/{collectionSlug}/{volumeSlug}/{editionSlug}`

Legacy edition URLs using only `{collectionSlug}/{editionSlug}` remain supported via global edition slug lookup.
