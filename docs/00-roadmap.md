# 00 — Roadmap

A single sequenced build order across every area in `/docs`. Each step
names its doc, a rough size (S/M/L), and what it depends on. Sizes assume
solo work with AI-assisted implementation, not from-scratch research time.

## Decisions to make before you start (don't defer these)

1. **ORM: Prisma.** Needed before step 1. Justification in
   `09-shared-packages.md`. `apps/api` currently has no ORM installed at
   all — this is a real blocking decision, not a preference to revisit
   later.
2. **Payment provider: Stripe for v1, M-Pesa deferred.** Needed before
   `05-checkout-and-payments.md`. Justification there — Stripe has the
   fastest solo-dev path to a working, testable payment flow; M-Pesa's
   Daraja integration is real added complexity worth deferring until
   Stripe checkout is proven end-to-end.
3. **Blog content model: MDX files in the repo, not a CMS or DB.** Needed
   before `07-blog.md`. Keeps the blog dependency-free from `apps/api` and
   avoids building an authoring UI for an audience of one.
4. **Cart persistence: Redis only, no Postgres cart table.** Needed before
   `04-cart.md`. Redis is already provisioned in `docker-local.yml`;
   a DB-backed cart adds migration/schema overhead for disposable data.

## Build order

| # | Doc | What | Size | Depends on |
|---|---|---|---|---|
| 1 | `09-shared-packages.md` | Install Prisma in `apps/api`; fix the live React 18/19 mismatch (`apps/blog` → 19.1.1) | S | — |
| 2 | `01-auth.md` | Global `ValidationPipe`/CORS in `main.ts`; `User`/`Address`/`RefreshToken` schema; register/login/refresh/logout; `RolesGuard`; storefront login/register pages | M | 1 |
| 3 | `02-products-and-categories.md` | `Product`/`Category`/`ProductImage` schema; seed from `src/lib/data.ts`; public list/detail endpoints; admin write endpoints | M | 2 (admin endpoints need `RolesGuard`) |
| 4 | `03-product-detail-page.md` | Fix the `[id]`→`[slug]` routing bug; wire real product data into the existing PDP layout | S | 3 |
| 5 | `04-cart.md` | Redis-backed cart service + endpoints; fix `CartContext`'s two live bugs (id type mismatch, broken `isCartOpen` destructure); merge-on-login | M | 2, 3 |
| 6 | `08-admin-dashboard.md` (partial) | Install a router in `apps/admin`; build login + authenticated shell; products + categories screens | M | 2, 3 |
| 7 | `05-checkout-and-payments.md` | `Order`/`OrderItem` schema; COD checkout path first, then Stripe (PaymentIntent + webhook); Mailhog order confirmation email | L | 5 |
| 8 | `06-orders.md` | Order state machine + transition validation; customer order history pages; admin order list/detail/status endpoints | M | 7 |
| 9 | `08-admin-dashboard.md` (rest) | Orders screens; read-only users list | S | 8 |
| 10 | `07-blog.md` | MDX content pipeline; index/detail routes; optional product cross-linking | M | 1 (React bump), 3 (if cross-linking) — otherwise independent, can be built in parallel with 4–9 |
| 11 | `10-infrastructure-and-deploy.md` | Commit the two pending port fixes; add image-storage env vars (step 3) and real SMTP env vars (step 7) as they come up; work through the "ready to deploy" checklist | S, ongoing | all of the above, incrementally |

**Total shape**: steps 1–9 are the critical path (auth → catalog → cart →
checkout → orders → admin) — each genuinely blocks the next. Step 10
(blog) can run in parallel with any of 4–9 if you want a change of pace;
it shares no API surface with the shop flow except the optional product
cross-link. Step 11 isn't a discrete phase — its sub-items land alongside
the step that needs them, with the final deploy checklist as the last
gate before going live.

## The one thing to build next

**Start with `09-shared-packages.md` step 1 (install Prisma) immediately
followed by `01-auth.md`.**

Why this over anything else: right now `apps/api` is a bare, unmodified
`nest new` scaffold — no ORM, no auth, no global validation pipe, no CORS
config. Every other doc's API design assumes those things exist. The
storefront, meanwhile, already *looks* like a working shop (product pages,
cart UI, checkout form all render) — which makes it tempting to keep
polishing frontend UI. But that UI is currently wired to nothing:
`src/lib/data.ts` mock arrays, a `console.log`-only checkout, a PDP that
ignores its own route param. None of that visible progress is real until
there's a backend and an auth system underneath it. Auth in particular
gates *everything* downstream — cart merge-on-login, checkout requiring a
user, order ownership, and the entire admin RBAC story all assume it
exists. Get `POST /auth/register` → `POST /auth/login` → `GET /auth/me`
working end-to-end against a real Postgres database first; everything
else in this roadmap builds on that one working loop.
