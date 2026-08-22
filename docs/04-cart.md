# 04 — Cart

## Where this fits

Needs `02-products-and-categories.md` (real product ids/prices to add) and
benefits from `01-auth.md` (merge-on-login), but doesn't strictly require
auth to start — guest cart works without it. Checkout (`05-checkout-and-payments.md`)
consumes the cart directly, so finish this before starting that doc.

## Current state — real UI, no persistence, two live bugs

- `src/contexts/CartContext.tsx` provides `cartItems, addToCart,
  removeFromCart, updateQuantity, clearCart, getCartTotal, getCartCount`
  via React Context, wrapping the app in `src/app/providers.tsx`.
- **No persistence at all** — plain `useState`, cart is lost on every page
  refresh.
- **Bug 1 — type mismatch**: `Product.id`/`CartItem.id` is typed `number`
  (`src/lib/types.ts`), but `CartContext.tsx`'s `removeFromCart` /
  `updateQuantity` type `productId` as `string`. Currently masked by
  `next.config.ts`'s `ignoreBuildErrors: true`.
- **Bug 2 — broken destructure**: `providers.tsx` does
  `const { isCartOpen, closeCart } = useCart()` for `CartPopupWrapper`, but
  `CartContextType` has no `isCartOpen`/`closeCart` members — this is
  `undefined` at runtime. The cart popup is instead separately triggered by
  local `showCartPopup` state in `products/page.tsx`. Fix this as part of
  the persistence rewrite rather than patching around it.
- `cart/page.tsx` is otherwise functional against the in-memory context
  (quantity +/-, remove, proceeds to `/checkout`); its coupon input is a
  no-op (`console.log`) — leave that out of scope, no coupon system exists
  or is requested here.
- No cart module/entity exists in `apps/api`, and **no Redis client is
  installed in `apps/api`** — Redis exists only as a Docker service
  (`docker-local.yml`, port `6380:6379` locally), nothing in the API
  connects to it yet.

## Persistence strategy — decision

**Recommendation: Redis-only cart, no Postgres cart table.** Key it as
`cart:{userId}` for logged-in users or `cart:guest:{guestId}` for guests
(guest id = a random UUID set in a long-lived, non-httpOnly cookie so the
frontend can read it too), value is a JSON blob:
```json
{ "items": [{ "productId": "...", "quantity": 2 }], "updatedAt": "..." }
```
with a TTL (30 days, refreshed on every write).

Why not DB-backed: a cart is disposable, high-write, low-durability-need
state — exactly what Redis is for, and it's already provisioned in
`docker-local.yml`/`docker-production.yml`. A Postgres `cart`/`cart_item`
table would need the same merge-on-login logic anyway, plus migrations,
for no real benefit at this scale. Reach for Postgres only for `Order`
(`06-orders.md`), which genuinely needs durability and reporting.

**Merge-on-login**: on successful login (`01-auth.md`'s `/auth/login`), the
frontend still holds the `guestId` cookie. Call a dedicated endpoint that
unions `cart:guest:{guestId}` into `cart:{userId}` (sum quantities on
overlapping `productId`), then deletes the guest key.

## Data model

No new Postgres entities. The Redis value shape above is the entire model.
Prices are **not** stored in the cart — always resolve current price from
`Product` at read time (cart display) and again at checkout (never trust a
stale/cached price for the charge amount).

## API design

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/cart` | guest or user | Resolves items against live `Product` data (price, stock, name, image), returns computed totals |
| POST | `/cart/items` | guest or user | `{ productId, quantity }` — upsert (add or increment) |
| PATCH | `/cart/items/:productId` | guest or user | `{ quantity }` — set exact quantity; `quantity: 0` removes |
| DELETE | `/cart/items/:productId` | guest or user | |
| DELETE | `/cart` | guest or user | Clear cart (used after order placement) |
| POST | `/cart/merge` | user (post-login) | Merges `cart:guest:{guestId}` into `cart:{userId}` |

NestJS-specific notes:
- Install `ioredis` + wrap it in a small `CartService` — no need for
  `@nestjs/cache-manager` abstraction here, you want direct control over
  key structure and TTLs, not a generic cache.
- A lightweight guard/interceptor resolves "who is this cart for" —
  `req.user?.id` if authenticated (optional JWT — don't require login to
  add to cart), else read/set the `guestId` cookie. This is cart-specific,
  don't reuse `JwtAuthGuard` (which rejects unauthenticated requests).
- Validate `quantity` against current `Product.stock` server-side on every
  write — the frontend should never be the only place enforcing this.

## Frontend implementation (Next.js)

- Replace `CartContext.tsx`'s `useState` with a version that syncs to the
  API: on mount, `GET /cart`; on every mutation, call the corresponding
  endpoint and update local state from the response (don't compute totals
  client-side once the API returns them — one source of truth for prices).
- Fix Bug 1 by making `CartItem`/`removeFromCart`/`updateQuantity` agree on
  a single id type — use whatever `Product.id` actually is once the real
  entity exists (likely a uuid `string`, not `number` — this also means
  updating `src/lib/types.ts`'s `Product.id` type once `02-products-and-categories.md`
  lands, since the mock data's numeric ids won't match real product ids).
- Fix Bug 2 by adding real `isCartOpen`/`openCart`/`closeCart` state to
  `CartContextType` and using it consistently instead of the separate
  `showCartPopup` local state in `products/page.tsx` — pick one mechanism.
- Set the `guestId` cookie on first cart interaction if it doesn't exist
  (client-side, e.g. via a small helper, or have `GET /cart` set it via
  `Set-Cookie` on first call).
- Call `POST /cart/merge` right after a successful login response in the
  auth flow from `01-auth.md`.

## Build steps

1. Install `ioredis` in `apps/api`, add `REDIS_URL` config (already in
   `.env.example`), confirm the API can connect to the `redis` Docker
   service.
2. Build `CartService` (get/set/merge against Redis) + `CartController`
   with the endpoints above, using product data from `02-products-and-categories.md`.
3. Fix Bug 1 (id type mismatch) and Bug 2 (broken destructure) in
   `CartContext.tsx`/`providers.tsx` as part of the rewrite, not before —
   no point fixing types for a context you're about to replace.
4. Rewire `CartContext.tsx` to call the real API instead of local state.
5. Confirm guest cart persists across a page refresh (this is the concrete
   proof persistence works — it didn't before).
6. Add `POST /cart/merge`, wire it into the post-login flow.
7. Test: add items as a guest, log in, confirm items survive and merge
   correctly with anything already in the logged-in user's cart.

## Common pitfalls for this exact stack

- `docker-local.yml`'s Redis service maps host port `6380 → 6379` (a recent
  fix in this repo, not the default) — make sure `REDIS_URL` in `.env`
  points at the right port when running the API outside Docker against the
  Dockerized Redis.
- Don't trust cart-displayed prices at checkout — always re-resolve from
  `Product` when creating the order (`05-checkout-and-payments.md`),
  otherwise a price change between "add to cart" and "checkout" charges
  the wrong amount.
- The guest cart cookie must be readable by client JS (not httpOnly) since
  the frontend needs it for the merge call — keep this distinct from the
  auth refresh token cookie in `01-auth.md`, which *is* httpOnly. Don't
  reuse cookie names/logic between the two.

## What "done" looks like

- Adding items to cart as a guest survives a page refresh.
- Logging in merges the guest cart into the user's cart with correct
  summed quantities, and the guest cart key is cleared.
- Cart totals always reflect current product prices, not stale client
  state.
- Both `CartContext` bugs (id type mismatch, broken `isCartOpen` destructure)
  are gone — the cart popup opens/closes through one real mechanism.
