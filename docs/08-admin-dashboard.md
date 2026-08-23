# 08 — Admin Dashboard

## Where this fits

Consumes everything built so far: auth/RBAC (`01-auth.md`), products/categories
(`02-products-and-categories.md`), orders (`06-orders.md`). Build the admin
screens for each domain right after that domain's API is done, rather than
batching all admin work to the end — you'll want to exercise the admin
write endpoints (create/edit product, change order status) as you build
them anyway.

## Current state — unmodified starter template

`apps/admin` is the stock Turborepo "kitchen sink" Vite starter, not a
partial dashboard. `src/main.tsx` → `src/app/index.tsx` is a single static
component tree rendering a demo `CounterButton` and boilerplate links —
**no router installed at all** (no `react-router`, no `@tanstack/router` in
`package.json`), no pages directory, no API client, no auth code. This is
fully from scratch, including basic app scaffolding most projects start
with.

## v1 scope — what to build vs. defer

**v1 (build now):**
- Products: list, create, edit, archive (from `02-products-and-categories.md`)
- Categories: list, create, edit (flat list UI is fine even though the
  data model supports nesting — a simple indented list or `parentId`
  dropdown, not a drag-and-drop tree builder)
- Orders: list (filterable by status), detail view, status transition
  (from `06-orders.md`)
- Users: list + view only — enough to look someone up when a support
  question comes in. No admin-driven user creation/role editing in v1;
  the only role that matters operationally is customer vs. admin, and
  admin accounts are rare enough to manage manually via the API/DB
  directly for now.
- Login (from `01-auth.md`)

**Defer past v1 — don't build yet:**
- Analytics/reporting dashboards (revenue charts, top products) — genuinely
  nice-to-have, zero dependencies block them, but they're pure addition
  with no other feature depending on them. Build once there's enough real
  order data for a chart to mean anything.
- Bulk actions (bulk price update, bulk category reassignment) — wait
  until manual one-at-a-time editing actually becomes painful at your real
  catalog size.
- Admin user management UI (inviting other admins, role editing) — only
  matters once more than one person needs admin access.

## Data model

No new entities — this doc is pure frontend/API-consumption work against
entities already specified in `01-auth.md`, `02-products-and-categories.md`,
and `06-orders.md`.

## API design

No new endpoints beyond what those three docs already specify
(`POST/PATCH/DELETE /products`, `/categories`, `GET/PATCH /admin/orders`,
`GET /admin/users` — add a simple paginated read-only users list endpoint
if it doesn't already exist from `01-auth.md`, gated by `RolesGuard`).

## Frontend implementation (React + Vite)

- **Install a router first** — `react-router` (v6/v7 data router) is the
  pragmatic default here: well-documented, works cleanly with Vite, and
  its loader/action pattern gives you a decent place to put the
  authenticated-fetch logic without reaching for a heavier state library.
- Route structure: `/login`, then an authenticated layout wrapping
  `/products`, `/products/:id`, `/categories`, `/orders`, `/orders/:id`,
  `/users`.
- State: keep it simple — **no Redux/Zustand needed for v1**. Server data
  (products, orders) is fetched per-route (react-router loaders or a thin
  `useEffect`+fetch if you skip loaders); the only genuinely global client
  state is the logged-in user/token from `01-auth.md`, which fits fine in
  a small React context.
- API client: a shared `src/lib/api-client.ts` — same shape as the one
  recommended for storefront in `09-shared-packages.md`, but **don't share
  the literal module between apps**; each app's client is small enough
  (attach token, base URL from `VITE_API_URL`, handle 401 by redirecting
  to `/login`) that duplicating ~30 lines beats a premature shared package.
- Tables: build one reusable `<DataTable>` (columns, rows, simple
  pagination) once you hit the second list view (categories, after
  products) — don't build it speculatively before you have two real
  consumers.
- Forms: product create/edit is the first non-trivial form (many fields,
  image upload) — a plain controlled-form with `class-validator`-mirrored
  client checks is enough; don't add a form library (react-hook-form etc.)
  until the second complex form makes the boilerplate genuinely annoying.

## Build steps

1. Install `react-router`, set up the route tree and an authenticated
   layout shell (redirect to `/login` if no valid session).
2. Build `/login` (depends on `01-auth.md`'s API + admin-role rejection
   logic).
3. Build the API client with 401-handling.
4. Build products list + create/edit form + archive action (as soon as
   `02-products-and-categories.md`'s admin endpoints exist) — this is the
   first real "does the whole loop work" proof: create a product in admin,
   see it appear on the storefront.
5. Build categories list + create/edit.
6. Build orders list (status filter) + detail + status-transition control
   (as soon as `06-orders.md`'s admin endpoints exist).
7. Build read-only users list.
8. Only after all of the above: consider analytics/bulk actions if you
   still want them.

## Common pitfalls for this exact stack

- `apps/admin`'s React version was just bumped `18.3.1 → 19.1.1` (staged
  in `package.json`/`pnpm-lock.yaml` as of this writing) specifically to
  match `apps/storefront` and `packages/ui`'s toolchain — make sure that
  change is actually installed/committed (`pnpm install`) before building
  anything that imports from `@repo/ui`, or you'll hit the exact
  peer-dependency mismatch this repo is mid-fixing (see `09-shared-packages.md`).
- Vite's dev server env vars use the `VITE_` prefix (`import.meta.env.VITE_API_URL`),
  **not** `NEXT_PUBLIC_` — `.env.example` already has `VITE_API_URL`
  reserved separately from storefront's `NEXT_PUBLIC_API_URL`; don't
  accidentally reuse the Next.js-style env access pattern here.
- `docker/nginx/local.conf` routes `/admin/*` to the Vite dev server, but
  `docker/nginx/prod.conf` serves the built admin app as a static SPA via
  its own `spa.conf` (baked into the admin image's runner stage) on a
  dedicated subdomain — router history mode (`BrowserRouter`, not `HashRouter`)
  relies on that SPA fallback (`try_files ... /index.html`) actually being
  present in prod, which it is; just don't switch to `HashRouter` thinking
  you need to work around routing, you don't.
- Admin has no auth code today — resist the temptation to leave routes
  unprotected "temporarily" while iterating on product/order screens; add
  the route guard in step 1, before any real admin functionality exists,
  since it's much easier to build guarded-from-day-one than to retrofit.

## What "done" looks like

- An admin can log in, create/edit/archive a product (and see it reflected
  live on the storefront), manage categories, view and transition orders
  through their real states, and look up a user — all through real API
  calls, no mock data.
- A non-admin cannot reach any admin route, client-side or via direct API
  call.
