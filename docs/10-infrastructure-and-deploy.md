# 10 — Infrastructure & Deploy

## Where this fits

This isn't a feature to build once — it's the environment every other doc
runs against, and it needs small updates as each feature lands (new env
vars, new services). Read it once now for the current state, then come
back to the "as features land" checklist while working through `01`–`08`.

## Current state — infra is ahead of the app code

Unusually for this repo, `docker-local.yml`, `docker-production.yml`, and
the nginx configs already encode the *intended* architecture more
completely than `apps/api`'s code does. You're filling in slots that
already exist, not designing infra from scratch.

**`docker-local.yml`** (7 services): `postgres` (16-alpine, `:5432`),
`redis` (7-alpine, host port `6380→6379`, password-protected), `mailhog`
(web UI `:8025`, SMTP `:1025`), `api` (NestJS, `:4000`, depends on
postgres+redis healthy), `storefront` (`:3000`), `admin` (`:5173`), `blog`
(`:3002→5173`), `nginx` (`:80`, path-based routing to all of the above).
Two port fixes are currently uncommitted in the working tree: Redis
`6379→6380`, blog `3002:3000→3002:5173` — these are real fixes (the old
mappings were wrong), not exploratory changes; commit them.

**`docker-production.yml`**: `postgres`/`redis` with no host ports exposed
(internal-only), `api` pulled as a prebuilt image (`${REGISTRY}/nest-grocery-api:${IMAGE_TAG}`,
2 replicas), `storefront`/`admin`/`blog` likewise pulled images, `nginx`
(TLS, ports `80`/`443`, subdomain routing), `certbot` (Let's Encrypt
renewal every 12h). **No Mailhog service** — production email must go
through a real SMTP provider via env vars, never `mailhog`.

**`docker/nginx/local.conf`**: single-origin, **path-based** routing
(`/api/*`, `/admin/*`, `/blog/*`, `/*` catch-all → storefront). Its own
header comment about the blog port is stale (says "3002→3000") relative to
the corrected upstream (5173) — fix the comment when you commit the port
fix.

**`docker/nginx/prod.conf`**: **subdomain-based** routing
(`storefront.example.com`, `admin.example.com`, `blog.example.com`,
`api.example.com`), HTTP→HTTPS redirect + ACME challenge passthrough,
per-subdomain TLS termination, rate limiting on the api server block
(`10r/s`, burst 20), and a `location /webhooks/` block already scaffolded
with `proxy_request_buffering off` specifically for payment webhook
signature verification (used in `05-checkout-and-payments.md`). Admin's
server block has a commented-out IP allowlist/basic-auth suggestion — worth
enabling once real admin usage starts, not required for early development.

**`docker/nginx/spa.conf`**: baked into admin's own production image,
handles SPA fallback (`try_files ... /index.html`) — this is what makes
client-side routing in `08-admin-dashboard.md` work in prod.

**The path-based (dev) vs. subdomain-based (prod) routing difference is
the single most important infra fact for this build** — it's called out
in `01-auth.md`'s pitfalls because it changes CORS/cookie behavior between
environments. Every doc that touches cross-app requests should be tested
against both, not just dev.

## Env vars already reserved (`.env.example`)

Postgres (`POSTGRES_USER/PASSWORD/DB`, `DATABASE_URL`), Redis
(`REDIS_PASSWORD`, `REDIS_URL`), API (`PORT=4000`, `NODE_ENV`, `JWT_SECRET`,
`JWT_EXPIRES_IN`), frontend API URLs (`NEXT_PUBLIC_API_URL`, `VITE_API_URL`
— note the different prefixes per `08-admin-dashboard.md`'s pitfalls),
email (`SMTP_HOST=mailhog`, `SMTP_PORT=1025`, `SMTP_FROM`), payments
(`PAYMENT_SECRET_KEY`, `PAYMENT_WEBHOOK_SECRET`), prod-only (`REGISTRY`,
`IMAGE_TAG`). `make dev`/`make env` (root `Makefile`) copies this to `.env`
automatically.

## As features land — env/infra checklist

- **`01-auth.md`**: `JWT_SECRET`/`JWT_EXPIRES_IN` already reserved, no new
  infra. In prod, set `Domain=.example.com` on the refresh cookie and
  confirm `nginx`'s subdomain routing doesn't strip/alter `Set-Cookie`
  headers (it shouldn't by default, but verify against `prod.conf` once
  deployed to a staging subdomain setup, not just locally).
- **`02-products-and-categories.md`**: add an image storage env var
  (e.g. `S3_BUCKET`/`S3_REGION`/`S3_ACCESS_KEY` or R2 equivalent) — not in
  `.env.example` yet, add it there when you build image upload. Local dev
  can write to a mounted volume instead of real object storage if you want
  to defer the S3/R2 setup.
- **`04-cart.md`**: no new infra — `REDIS_URL` already reserved, just
  confirm the app connects to the already-fixed `6380` host port locally.
- **`05-checkout-and-payments.md`**: `PAYMENT_SECRET_KEY`/`PAYMENT_WEBHOOK_SECRET`
  already reserved for Stripe. Add a real SMTP provider's env vars
  (`SMTP_HOST`/`SMTP_PORT`/`SMTP_USER`/`SMTP_PASS`) for **production only**
  — `docker-production.yml` has no Mailhog service, so `SMTP_HOST=mailhog`
  must never leak into a prod `.env`. Confirm the Stripe CLI
  (`stripe listen`) can reach `localhost/webhooks/stripe` through
  `local.conf` before assuming the equivalent prod path works.
- **`07-blog.md`**: no new infra if MDX-in-repo (recommended) — if you
  ever add remote images for posts, reuse whatever object storage
  `02-products-and-categories.md` set up rather than standing up a second
  one.
- **`08-admin-dashboard.md`**: no new infra — `VITE_API_URL` already
  reserved.

## "Ready to deploy" checklist (`docker-production.yml` + `prod.conf`)

- [ ] `.env` for production has every var from `.env.example` set to real
      values — `JWT_SECRET` is a strong random value (not the dev default),
      `REGISTRY`/`IMAGE_TAG` point at real built/pushed images.
- [ ] DNS: `storefront.`, `admin.`, `blog.`, `api.` subdomains all point at
      the server running nginx.
- [ ] TLS certs issued via `certbot` for all four subdomains — confirm the
      ACME HTTP-01 challenge path in `prod.conf` is reachable before
      relying on auto-renewal.
- [ ] CORS on the API (`01-auth.md`) explicitly allowlists the real
      `storefront.`/`admin.` origins — not `*`, since cookies require
      `credentials: true` + a specific origin.
- [ ] Real SMTP provider configured (not Mailhog) — send one real test
      email through the deployed stack.
- [ ] Stripe webhook endpoint registered in the Stripe dashboard pointing
      at `https://api.example.com/webhooks/stripe`, tested with a real
      (test-mode) payment, not just the local Stripe CLI forward.
- [ ] Admin subdomain's IP allowlist/basic-auth (commented out in
      `prod.conf` today) enabled, or at minimum confirm `RolesGuard`
      alone is an acceptable exposure for your risk tolerance before
      going live without it.
- [ ] Database backups configured for the production `postgres` volume —
      nothing in the current compose files handles this; it's infra this
      guide's docs don't otherwise cover but is a hard requirement before
      real customer orders exist.
- [ ] `redis` in prod has `maxmemory 256mb`/`allkeys-lru` already set
      (per `docker-production.yml`) — confirm that's still an appropriate
      ceiling once cart traffic is real, not hypothetical.

## Common pitfalls for this exact stack

- Don't test auth/cookie/CORS behavior only against `docker-local.yml`'s
  path-based routing and assume it "just works" in prod — the subdomain
  switch is a genuine behavior change, not just a URL cosmetic difference.
- Don't let a dev-only value (`SMTP_HOST=mailhog`, permissive CORS,
  a weak `JWT_SECRET`) survive into a committed `docker-production.yml`
  override or a real `.env` — keep prod env values out of the repo
  entirely, sourced from a secrets manager or CI secret store instead of
  a committed file.
- The `apps/api` directory currently contains a **stray nested `.git`
  directory** and a **committed `dist/` build artifact** from the initial
  `nest new` scaffold — clean these up (remove the nested `.git`, add
  `dist/` to `.gitignore` if not already there) before this matters for a
  CI build step that might get confused by either.

## What "done" looks like

- A fresh clone + `make env` + `make dev` brings up the full stack
  (`postgres`, `redis`, `mailhog`, `api`, `storefront`, `admin`, `blog`,
  `nginx`) with no manual fixes needed.
- The production deploy checklist above is fully checked before the first
  real customer order.
