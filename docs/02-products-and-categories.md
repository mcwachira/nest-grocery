# 02 — Products & Categories

## Where this fits

Everything downstream reads from this: the PDP (`03-product-detail-page.md`),
cart (`04-cart.md`), checkout line items (`05-checkout-and-payments.md`), and
admin product management (`08-admin-dashboard.md`). Build this second, right
after auth (admin-only write endpoints need the `RolesGuard` from `01-auth.md`).

## Current state — from scratch on the backend, mocked on the frontend

- `apps/api` has no products/categories module, entity, or controller at all.
- `apps/storefront/src/lib/data.ts` has **26 hardcoded products and 8
  hardcoded categories** — this is your reference for realistic seed data,
  not a data layer to keep. `products/page.tsx` and `categories/page.tsx`
  are `"use client"` components that filter these in-memory arrays with
  `useMemo`/`useState` — no fetch, no server components.
- No image upload/storage handling exists anywhere (no multer config, no
  cloud storage client in `apps/api/package.json`).

## Data model

**Category** — recommend a simple **adjacency list** (self-referential
`parentId`), not nested-set. Grocery taxonomies are shallow (2–3 levels:
e.g. Produce → Vegetables → Leafy Greens) — adjacency list is enough and
far simpler to query/write than nested sets or materialized paths.
- `id`, `name`, `slug` (unique, indexed), `parentId` nullable fk (self),
  `description` nullable, `imageUrl` nullable, `sortOrder` int

**Product**
- `id`, `slug` (unique, indexed), `name`, `description` (text)
- `priceCents` int (store money as integer cents, never float)
- `compareAtPriceCents` nullable int (for "on sale" display)
- `currency` (default `KES` or whatever your target market is)
- `unit` — grocery-specific: `kg`, `bunch`, `dozen`, `piece`, `litre` etc.
- `stock` int
- `sku` nullable unique
- `isOrganic` bool — this is a farm/organic product store, make it a real
  filterable field, not a tag
- `categoryId` fk, indexed
- `status` enum `draft | active | archived`
- `createdAt`, `updatedAt`

**ProductImage** (separate table, not a jsonb array) — lets you reorder,
caption, and manage images independently, and matches the "image gallery"
requirement in `03-product-detail-page.md`.
- `id`, `productId` fk indexed, `url`, `sortOrder`, `altText` nullable

**Indexes worth having**: unique on `product.slug` and `category.slug`,
btree on `product.categoryId`, and a Postgres full-text/trigram index on
`product.name` (+ `description`) for search — see below.

## API design

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/products` | none | Query params: `category`, `search`, `organic`, `minPrice`, `maxPrice`, `page`, `limit`. Returns paginated list |
| GET | `/products/:slug` | none | Full product + images + category |
| POST | `/products` | admin | `CreateProductDto` |
| PATCH | `/products/:id` | admin | Partial update |
| DELETE | `/products/:id` | admin | Soft-delete (`status: 'archived'`), don't hard-delete — orders reference product snapshots but you don't want a dangling fk either |
| GET | `/categories` | none | Returns tree (or flat list + `parentId`, let the frontend build the tree) |
| POST | `/categories` | admin | |
| PATCH | `/categories/:id` | admin | |
| POST | `/products/:id/images` | admin | multipart upload |

NestJS-specific notes:
- `ProductsModule`, `CategoriesModule`, DTOs with `class-validator`
  (`@IsString`, `@IsInt`, `@Min(0)` on price/stock, etc.) — relies on the
  global `ValidationPipe` from `01-auth.md`.
- Pagination: a simple `{ page, limit }` query DTO with `@Type(() => Number)`
  transform — don't over-engineer cursor pagination for a catalog this size.
- Search: start with Postgres `ILIKE '%term%'` on name — it's fine at
  catalog sizes under a few thousand SKUs. If you outgrow it, move to
  Postgres full-text (`tsvector` + GIN index) before reaching for
  Elasticsearch/Algolia; don't add a search service for a farm-to-table
  catalog this size.
- Image upload: use `multer` (`@nestjs/platform-express` `FileInterceptor`)
  writing to local disk in dev, and recommend **Cloudflare R2 or S3** for
  prod (cheap, no vendor lock-in, works fine behind the existing nginx
  setup). Don't build your own image resizing pipeline — store the
  original, resize client-side or via a `sharp` step in the upload handler
  if you need thumbnails.

## Frontend implementation (storefront, Next.js App Router)

- Convert `products/page.tsx` and `categories/page.tsx` from client-side
  array filtering to **server components** that `fetch()` the API directly
  (Next.js App Router default — no need for a client data-fetching library
  for a catalog listing). Keep `"use client"` only for the filter/sort
  *controls*, passed as URL search params so the server component re-fetches
  server-side on filter change.
- Delete `src/lib/data.ts` mock arrays once the real endpoints exist — keep
  the file's shape as a reference for your seed script instead.
- Category page: fetch `/categories`, build the parent/child tree client-side
  from the flat `parentId` list (trivial with a `Map`).

## Build steps

1. Add `Category` and `Product` (+ `ProductImage`) to the schema, migrate.
2. Write a seed script that ports the 26 products / 8 categories from
   `apps/storefront/src/lib/data.ts` into real DB rows — gives you realistic
   data immediately instead of starting empty.
3. Build `GET /products` (list + filters) and `GET /products/:slug`.
4. Build `GET /categories`.
5. Wire `products/page.tsx` and `categories/page.tsx` to fetch from the API
   instead of `src/lib/data.ts`.
6. Add admin-only `POST`/`PATCH`/`DELETE /products` and `/categories`,
   gated by `RolesGuard` from `01-auth.md`.
7. Add image upload endpoint + wire it into whatever admin product form you
   build in `08-admin-dashboard.md`.
8. Add search/filter query params, confirm the storefront filter UI (already
   built, currently filtering mock arrays) round-trips through the API.

## Common pitfalls for this exact stack

- Don't store price as a float — integer cents avoids the classic
  floating-point rounding bugs in cart/checkout totals later.
- The storefront's `next.config.ts` has `ignoreBuildErrors: true` — a typo
  in your fetch response typing (e.g. treating `priceCents` as `price`)
  won't fail CI. Type the API response shape explicitly and check it by
  running `pnpm dev`, not just by trusting the build.
- Don't reach for `packages/ui` for product cards/grids yet — it currently
  only exports `counter-button` and `link` (see `09-shared-packages.md`).
  Build product-specific components in `apps/storefront/src/components`
  first; only promote to `packages/ui` once admin also needs the same
  component (it likely will, for the product table).

## What "done" looks like

- Product list, category list, and filtering all read from Postgres via
  the API — zero references to `src/lib/data.ts` mock arrays remain in
  `products/page.tsx` / `categories/page.tsx`.
- An admin JWT can create/edit/archive a product and upload an image; a
  customer JWT gets 403 on those same routes.
- Searching "cabbage" and filtering `organic=true` both narrow results
  correctly against real data.
