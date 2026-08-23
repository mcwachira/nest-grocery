# Backend implementation guides

Deep, code-level companions to the high-level docs in `/docs` — build these
in order, before touching any frontend work. Each one assumes the previous
is done.

1. [`00-database-design.md`](./00-database-design.md) — every table, every
   index, and why each design decision was made. Read this first; every
   other doc here builds against it.
2. [`01-prisma-setup.md`](./01-prisma-setup.md) — installs Prisma, the full
   `schema.prisma`, the `PrismaService`/`PrismaModule` pattern, and a seed
   script.
3. [`02-auth-api.md`](./02-auth-api.md) — register/login/refresh/logout,
   `JwtAuthGuard`, `RolesGuard`. Everything else depends on this. (See
   [`02-auth-api-fixes.md`](./02-auth-api-fixes.md) for a real
   diagnose-and-fix log of every bug this module actually hit while being
   built — worth reading as a case study before you build `03`.)
4. [`03-products-categories-api.md`](./03-products-categories-api.md) —
   catalog CRUD, search/filter, image upload.
5. [`04-cart-api.md`](./04-cart-api.md) — Redis-backed cart, guest/user
   identity resolution, merge-on-login.
6. [`05-checkout-payments-api.md`](./05-checkout-payments-api.md) — the
   checkout transaction, Stripe integration, webhook handling, order
   confirmation email.
7. [`06-orders-api.md`](./06-orders-api.md) — order state machine,
   customer order history, admin order management.
8. [`07-testing-guide.md`](./07-testing-guide.md) — how to actually write
   the tests every doc above assumes you can write. Read this once,
   early, not just when `06` tells you to write a test.
9. [`08-production-hardening.md`](./08-production-hardening.md) —
   cross-cutting concerns no single feature doc owns (global error
   shape, env validation at boot, health checks, structured logging,
   security headers, graceful shutdown, API docs, checkout idempotency).
   Apply incrementally starting with `02`, not as a final pass at the end.

Each doc includes runnable `curl` examples to test the endpoints as you
build them, a **pitfalls** section specific to that feature, and a
**scalability notes** section — read those even when the basic version
works, since they explain *why* certain patterns (row locking, snapshot
fields, shared Redis clients) are built the way they are, not just that
they are.

These are companions to, not replacements for, the higher-level docs in
`/docs` (`01-auth.md` through `06-orders.md`) — those cover frontend
implementation and product decisions; these cover the NestJS/Prisma
backend in full code detail. Frontend work resumes once this series is
done, per `/docs/00-roadmap.md`.
