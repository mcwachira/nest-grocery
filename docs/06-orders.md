# 06 — Orders

## Where this fits

The `Order`/`OrderItem` entities are created by `05-checkout-and-payments.md`
— build the schema once, shared by both docs. This doc covers the state
machine, admin-side management (feeds `08-admin-dashboard.md`), and the
customer order history view.

## Current state — nothing exists

No order module, entity, or endpoints in `apps/api`. No order history view
anywhere in `apps/storefront`. Fully from scratch.

## Data model

**Order**
- `id`, `userId` fk indexed (checkout requires login per `05-checkout-and-payments.md`, so no nullable guest case in v1)
- `status` enum — see state machine below
- `totalCents`, `deliveryFeeCents`, `currency`
- Shipping address **snapshot** fields (`shippingLine1`, `shippingCity`, etc — not just an fk, see `05-checkout-and-payments.md`)
- `paymentProvider` enum `stripe | cod`, `paymentReference` nullable (Stripe PaymentIntent id)
- `placedAt`, `paidAt` nullable, `fulfilledAt` nullable, `deliveredAt` nullable, `cancelledAt` nullable
- `createdAt`, `updatedAt`

**OrderItem**
- `id`, `orderId` fk indexed
- `productId` fk (keep the fk for admin traceability, but don't rely on it alone)
- `productName`, `unitPriceCents` — **snapshot at time of order**, not a
  live join to `Product`. Prices and names change; historical orders must
  not silently change with them.
- `quantity`, `subtotalCents`

Index `Order.userId` (order history queries) and `Order.status` (admin
filtering/dashboard queries).

## State machine

```
pending_payment → paid → processing → fulfilled → out_for_delivery → delivered
                                                                    ↘ cancelled
pending_payment → cancelled   (payment failed/abandoned)
processing → cancelled        (admin cancels before fulfillment)
```

- COD orders skip `pending_payment` and start at `processing` directly
  (no payment step to wait on — see `05-checkout-and-payments.md`).
- Keep the state machine linear and admin-driven for v1: an admin manually
  moves `processing → fulfilled → out_for_delivery → delivered` from the
  dashboard. Don't build customer-facing delivery tracking/webhooks from a
  courier API yet — that's real scope for a later iteration, not v1.
- `cancelled` is a terminal state reachable from `pending_payment` or
  `processing` only — once `fulfilled`, require a `refunded` flow instead
  (out of scope for v1; note it but don't build it — flag as a deferred
  item rather than half-implementing).
- Enforce valid transitions **server-side** in the order service (a small
  allowed-transitions map), not just in the admin UI — the UI will only
  ever offer valid next states, but the API must not trust that.

## API design

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/orders` | user | Current user's own orders, paginated, newest first |
| GET | `/orders/:id` | user (own order only) | 404 (not 403) if it's not theirs — don't leak existence |
| GET | `/admin/orders` | admin | All orders, filterable by `status`, paginated |
| GET | `/admin/orders/:id` | admin | Full detail including customer info |
| PATCH | `/admin/orders/:id/status` | admin | `{ status }` — validated against the allowed-transitions map |

NestJS-specific notes:
- Reuse `JwtAuthGuard` from `01-auth.md`; `GET /orders/:id` additionally
  checks `order.userId === req.user.id` in the service, not just the guard.
- `RolesGuard` + `@Roles('admin')` on the `/admin/orders*` controller.
- The status-transition validator is a good place for a small pure
  function (`canTransition(from, to): boolean`) that's unit-testable
  without spinning up Nest's DI — worth an actual test given it's the one
  piece of real business logic in this module.

## Frontend implementation

**Storefront (Next.js)** — customer order history:
- `src/app/account/orders/page.tsx` (new) — server component, fetches
  `GET /orders` with the user's access token, lists orders with status
  badges.
- `src/app/account/orders/[id]/page.tsx` — order detail, reuses the order
  confirmation layout built in `05-checkout-and-payments.md` (same data
  shape, just fetched by id instead of returned from checkout).
- Needs a logged-in nav entry — coordinate with wherever `01-auth.md`'s
  "my account" affordance ends up in the header.

**Admin (React/Vite)** — order management, detailed in `08-admin-dashboard.md`;
this doc covers what the order-specific pieces need:
- Orders list table: id, customer, total, status (colored badge), placed
  date, filterable by status.
- Order detail view: line items, customer/shipping info, and a status
  dropdown constrained to valid next transitions (mirror the backend's
  allowed-transitions map so the UI never even offers an invalid move).

## Build steps

1. Add `Order`/`OrderItem` schema (shared with `05-checkout-and-payments.md` —
   do this once, likely while building that doc's checkout endpoint).
2. Build `GET /orders` + `GET /orders/:id` (customer-facing, read-only) —
   these can be built and tested as soon as checkout produces its first
   order.
3. Build the storefront order history + detail pages.
4. Build the allowed-transitions validator + `PATCH /admin/orders/:id/status`.
5. Build `GET /admin/orders` + `GET /admin/orders/:id`.
6. Build the admin orders list + detail UI (depends on `08-admin-dashboard.md`'s
   router/layout groundwork existing first).
7. Wire order confirmation emails (`05-checkout-and-payments.md`) to also
   fire on admin-driven status changes (e.g. "your order is out for
   delivery") — small addition to the same mailer service, not a new one.

## Common pitfalls for this exact stack

- Don't join `OrderItem` to live `Product` rows for display — always use
  the snapshotted `productName`/`unitPriceCents`. This is the single most
  common order-history bug: a price or name change after the fact
  silently rewriting history.
- `GET /orders/:id` for another user's order must 404, not 403 — a 403
  confirms the order id exists, which leaks order volume/ids to anyone
  guessing sequential ids. (Use non-sequential ids — uuid — for `Order`
  regardless, for the same reason.)
- Status transition validation must live in the API, not just the admin
  dropdown — the admin app has no router or state management installed
  yet (`08-admin-dashboard.md`), so it's tempting to skip backend
  validation "since the UI already constrains it." Don't; the API is the
  only trustworthy boundary here.

## What "done" looks like

- A customer sees their own orders and order detail, and cannot fetch
  another user's order by id.
- An admin can move an order through the real state machine, and an
  invalid transition (e.g. `delivered → processing`) is rejected by the
  API with a clear error, not just hidden in the UI.
- Order line items always reflect what was actually charged, even after
  the underlying product's price changes later.
