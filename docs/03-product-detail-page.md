# 03 — Product Detail Page (PDP)

## Where this fits

Depends entirely on `02-products-and-categories.md` being built first — the
PDP is a read view over that data. Cart (`04-cart.md`) depends on this page's
"add to cart" action working against a real product id.

## Current state — exists, but broken in a specific way worth fixing deliberately

`apps/storefront/src/app/products/[id]/page.tsx` exists and renders a full
PDP layout (image area, price, add-to-cart, tabs for description/reviews,
related products) — but it's `"use client"` and **never reads the `id` route
param**. It always renders one hardcoded product (`mockProduct`, "Chinese
Cabbage") regardless of which product you navigate to. `mockAdditionalInfo`,
`mockFeatures`, `mockReviews`, and `mockRelatedProducts` are all hardcoded
alongside it.

This means: the layout/UI work here is largely reusable — you're wiring
data into an existing shell, not building a page from scratch. Don't rebuild
the JSX; fix the data flow.

## Data the PDP needs

From `02-products-and-categories.md`'s `Product` entity: slug, name,
description, price, compareAtPrice, unit, stock, isOrganic, category
(for breadcrumb), and all `ProductImage` rows (gallery).

**Related products** — for v1, keep this simple: "other active products in
the same category, excluding this one, limit 4." Don't build a
recommendation engine. A `GET /products?category=:slug&exclude=:id&limit=4`
call (reusing the endpoint from `02-products-and-categories.md`) covers it.

**Reviews** — out of scope for v1. The mock UI already has a reviews tab
(`mockReviews`), but there's no `ProductReview` entity and no auth-gated
"only buyers can review" logic to build. Recommend leaving the tab in the
UI as a static "no reviews yet" state until after checkout/orders ship —
reviews naturally depend on `06-orders.md` (verified purchase) anyway.

**Stock display** — trivial with the `stock` int already in the product
model: show "In stock" / "Only N left" (e.g. stock < 5) / "Out of stock",
and disable "Add to cart" at 0. Given this is a real grocery/farm-goods
store, don't silently allow adding out-of-stock items — this becomes a
real checkout failure mode later, not just a UI nicety.

## API design

No new endpoints beyond what `02-products-and-categories.md` already
specifies:
- `GET /products/:slug` — use slug, not numeric id, for the route param
  (better URLs, and matches the unique-indexed `slug` column). This means
  changing the route from `products/[id]/page.tsx` to `products/[slug]/page.tsx`.
- `GET /products?category=:slug&exclude=:id&limit=4` — related products.

## Frontend implementation (Next.js App Router)

- Rename `apps/storefront/src/app/products/[id]/page.tsx` →
  `products/[slug]/page.tsx`, convert to a **server component** (drop
  `"use client"` from the page itself), read `params.slug`, `fetch()` the
  product server-side. This also fixes a real bug for free: SSR'd PDPs are
  better for SEO than the current client-only render.
- Keep the interactive bits ("Add to cart" button, quantity selector,
  image gallery thumbnails, tabs) as small `"use client"` leaf components
  that receive the fetched product as props — don't make the whole page
  client-side just because one button needs interactivity.
- Every internal link to a PDP (product cards on `/products`, `/categories`,
  home page sections, related products) needs updating from
  `/products/${id}` to `/products/${slug}` once the route changes.
- 404 handling: if the API returns 404 for an unknown slug, call Next.js's
  `notFound()` from the server component.

## Build steps

1. Rename the route folder `[id]` → `[slug]`, update the page to a server
   component that fetches by slug.
2. Wire the real `Product` + `ProductImage` data into the existing JSX,
   removing `mockProduct` and `mockAdditionalInfo`.
3. Fix every internal link that builds a PDP URL to use `slug` instead of
   `id` (grep for `/products/` across `src/components` and `src/app`).
4. Wire stock display + disable add-to-cart at 0 stock.
5. Wire related products via the category-filtered query, replacing
   `mockRelatedProducts`.
6. Replace the reviews tab with a static "no reviews yet" placeholder;
   remove `mockReviews`. Leave a `[[07-reviews-later]]`-style TODO comment
   only if you want a marker — otherwise just delete it, it's easy to
   re-add later.
7. Confirm `notFound()` renders correctly for a bad slug.

## Common pitfalls for this exact stack

- This is the one place in the storefront where the mock-data bug is a
  **routing** bug, not just a data bug — every product currently links to
  the same page content. Test by clicking through at least 3 different
  products, not just one, to confirm the fix actually works per-product.
- Server component `fetch()` calls in Next.js are cached by default
  (`force-cache`). Stock counts change; pass `{ cache: 'no-store' }` (or a
  short `revalidate`) for the PDP fetch, otherwise you'll show stale stock
  numbers that were fine for a static mock but are wrong for live inventory.
- `next.config.ts` has `typescript.ignoreBuildErrors: true` — when you
  change the route param from `id: string` to `slug: string`, a stray
  leftover reference to `params.id` elsewhere won't fail the build. Grep
  for `params.id` after the rename to be sure nothing's left over.

## What "done" looks like

- Navigating to any product from the listing/category/home pages shows
  *that* product's real name, price, images, and stock — not "Chinese
  Cabbage" every time.
- Out-of-stock products show a disabled add-to-cart state.
- Related products differ per category and never include the current
  product itself.
- An unknown slug renders a proper 404, not a crash or the mock product.
