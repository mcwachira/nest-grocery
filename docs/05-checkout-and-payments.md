# 05 — Checkout & Payments

## Where this fits

Depends on `04-cart.md` (source of line items) and `01-auth.md` (recommend
requiring login for checkout in v1 — see below). Produces the `Order`
records that `06-orders.md` manages. This is the most infra-sensitive doc —
it's the first feature that needs the Mailhog SMTP service and the nginx
webhook scaffolding to actually do something.

## Current state — form UI exists, nothing behind it

- `apps/storefront/src/app/checkout/page.tsx` has a full billing form
  (name, address, country/state/zip dropdowns with only 3–4 static
  options), a payment method radio (Cash on Delivery / PayPal / Amazon Pay
  — labels only, no integration). `handlePlaceOrder` validates client-side,
  `console.log`s the "order," calls `clearCart()`, shows a browser `alert()`,
  and redirects home. **No API call, no order persistence, no real payment
  flow.** The form layout is reusable; everything behind the submit button
  needs building.
- `apps/api` has no checkout/payment module, no Stripe/M-Pesa SDK
  installed, no webhook controller. `.env.example` reserves
  `PAYMENT_SECRET_KEY` / `PAYMENT_WEBHOOK_SECRET` but nothing reads them.
- `docker/nginx/prod.conf` already has a `location /webhooks/` block
  proxying to `api:4000/webhooks/` with `proxy_request_buffering off` —
  its own comment says this is for "payment provider webhooks (e.g.
  Stripe/M-Pesa) [that] often need the raw, unbuffered request body for
  signature verification." **The infra was built expecting exactly this
  decision to be made** — you're filling in a slot, not designing routing
  from scratch.
- `mailhog` is running in both `docker-local.yml` (web UI on `:8025`, SMTP
  on `:1025`) and referenced via `SMTP_HOST`/`SMTP_PORT`/`SMTP_FROM` in
  `.env.example` — but no `nodemailer` dependency exists yet and nothing
  sends mail.

## Decision: payment provider

**Recommendation: build for Stripe only in v1.** Design one thin
`PaymentProvider` interface (`createPaymentIntent`, `verifyWebhookSignature`,
`extractPaymentStatus`) so M-Pesa (Safaricom Daraja API) can be added later
as a second implementation without touching checkout logic — but don't
build it now.

Why Stripe first, concretely:
- Best-documented SDK for a solo builder, official `@nestjs`-friendly
  Node SDK, sandbox/test mode needs no business registration.
- Webhook signature verification is a few lines (`stripe.webhooks.constructEvent`)
  — this is exactly what the nginx `/webhooks/` unbuffered-body scaffolding
  is set up for.
- M-Pesa's Daraja API requires a Safaricom developer account, sandbox
  shortcodes, and is meaningfully more fiddly to test locally (no local
  simulator equivalent to Stripe CLI's `stripe listen`). It's the right
  choice for a Kenya-market production launch eventually, but it will slow
  down getting a working checkout end-to-end. Add it once Stripe checkout
  is proven, not before.
- Keep "Cash on Delivery" as a second real option (no payment gateway
  needed — order goes straight to `pending_payment`→`processing` without
  a `paidAt`) since it's already in the UI and is genuinely useful for a
  local grocery delivery business. Drop "Amazon Pay" — it doesn't fit this
  market and isn't worth building.

## Data model

Order and OrderItem are specified fully in `06-orders.md` — checkout is
what *creates* them. Relevant fields for this doc:
- `Order.paymentProvider` enum `stripe | cod`
- `Order.paymentReference` — Stripe PaymentIntent id, null for COD
- `Order.status` starts at `pending_payment` (Stripe) or `processing` (COD)
- Address fields are **snapshotted onto the Order** (not just an fk to
  `Address`) — if a user edits/deletes their saved address later, historical
  orders must still show what was shipped where at the time.
- `Order.deliveryFee` — flat-rate for v1 (see below), stored per-order in
  case the rate changes later.

**Shipping/delivery cost**: recommend a flat delivery fee for v1 (e.g. a
single `DELIVERY_FEE_CENTS` config value, maybe waived above a free-delivery
threshold). Distance/zone-based delivery pricing is real scope creep for a
solo build — add it later if you actually need it, don't design for it now.

## API design

| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/checkout` | required (see below) | Body: shipping address, `paymentMethod: 'stripe' \| 'cod'`. Reads the current cart server-side (never trust client-submitted line items/prices), creates the `Order` + `OrderItem`s from live product prices, decrements stock |
| — Stripe path | | | `/checkout` creates a Stripe PaymentIntent, returns `{ orderId, clientSecret }` for the frontend to confirm via Stripe.js |
| — COD path | | | `/checkout` marks the order `processing` immediately, no PaymentIntent |
| POST | `/webhooks/stripe` | Stripe signature, not JWT | Verifies signature, on `payment_intent.succeeded` sets `Order.status = 'paid'`, `paidAt`, triggers confirmation email |
| GET | `/checkout/config` | none | Returns Stripe publishable key + delivery fee, so the frontend doesn't hardcode them |

NestJS-specific notes:
- `/webhooks/stripe` needs the **raw body**, not the JSON-parsed body Nest
  gives you by default — use `express.raw({ type: 'application/json' })`
  scoped to just that route (Nest lets you do this via `rawBody: true` in
  `NestFactory.create` + `req.rawBody` in the controller, or a dedicated
  middleware). This is exactly why `prod.conf` disables `proxy_request_buffering`
  on that path — don't undo that benefit by letting Nest's global body
  parser mangle the payload before signature verification.
- Require login for checkout in v1 (`@UseGuards(JwtAuthGuard)` on
  `/checkout`) — guest checkout is real scope, defer it. It also sidesteps
  "who do we email the receipt to" and "how does a guest see order status"
  questions until `06-orders.md`'s customer order history exists.
- Wrap order creation + stock decrement in a DB transaction — two
  concurrent checkouts on the last unit of a product must not both succeed.
- Install `nodemailer`, point it at `SMTP_HOST`/`SMTP_PORT` (Mailhog in dev,
  a real SMTP provider — e.g. Resend/Postmark/SES — in prod, since Mailhog
  isn't in `docker-production.yml` at all). Send order confirmation on
  `paid`/`processing`.

## Frontend implementation (Next.js)

- Checkout page becomes a real multi-step flow: address → payment method →
  confirm. Keep the existing form UI, wire `handlePlaceOrder` to
  `POST /checkout` instead of `console.log`.
- Stripe path: install `@stripe/stripe-js` + `@stripe/react-stripe-js`,
  use `PaymentElement` with the `clientSecret` from `/checkout`, confirm
  payment client-side, then redirect to an order confirmation page once
  Stripe confirms (don't mark the order "done" client-side — wait for the
  webhook to actually flip status, or poll `GET /orders/:id` briefly on
  the confirmation page).
- COD path: `/checkout` response already has a final order, skip straight
  to confirmation.
- Order confirmation page: replace the `alert()` + redirect-home with a
  real `/orders/[id]/confirmation` page showing the order summary.

## Build steps

1. Add `Order`/`OrderItem` schema (coordinate with `06-orders.md` — build
   the entities once, referenced by both docs).
2. Add flat `deliveryFee` config, build `GET /checkout/config`.
3. Build `POST /checkout` for the COD path first — it's the simpler path
   with no external API, and proves the cart→order transition and stock
   decrement work before adding payment complexity.
4. Wire the storefront checkout form to COD checkout end-to-end, confirm
   an order lands in the DB and the cart clears.
5. Add Stripe: install SDK, build PaymentIntent creation in `/checkout`,
   build `/webhooks/stripe` with raw-body signature verification.
6. Install `stripe listen --forward-to localhost/webhooks/stripe` (Stripe
   CLI) for local webhook testing — test this before trusting the nginx
   prod path.
7. Wire Stripe Elements into the frontend checkout flow.
8. Install `nodemailer`, send order confirmation email on both paths,
   confirm it appears in Mailhog at `localhost:8025`.
9. Build the real order confirmation page.

## Common pitfalls for this exact stack

- **Raw body for webhooks is the single easiest thing to get wrong here.**
  Nest's default `bodyParser` will have already consumed/transformed the
  stream by the time a naive controller handler runs, breaking Stripe's
  signature check. Verify with the Stripe CLI locally before assuming the
  nginx-level `proxy_request_buffering off` setting alone fixes it — it
  only prevents nginx from buffering; Nest still needs the raw body
  explicitly.
- Never compute the charge amount from client-submitted cart data — always
  recompute server-side from `Product.priceCents` at the moment of
  checkout (ties back to the pricing caveat in `04-cart.md`).
- Mailhog is dev-only (`docker-local.yml`) and absent from
  `docker-production.yml` — don't hardcode `SMTP_HOST=mailhog` anywhere;
  keep it env-driven so prod can point at a real provider without code
  changes.
- `next.config.ts`'s `ignoreBuildErrors: true` means a mistyped Stripe
  response field won't fail your build — test the actual payment flow
  manually (Stripe test cards) rather than trusting a green build.

## What "done" looks like

- COD checkout: cart → order in DB → stock decremented → confirmation
  email in Mailhog → order visible on confirmation page.
- Stripe checkout: same, plus the webhook flips `paid` only after Stripe
  actually confirms payment (test by using the Stripe test card that
  triggers `requires_action` — the order must **not** show as paid until
  the webhook fires).
- Two simultaneous checkouts on the last unit of a product: exactly one
  succeeds, the other sees an out-of-stock error.
