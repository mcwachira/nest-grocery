# 01 — Auth

## Where this fits

Auth is the foundation everything else depends on: cart merge-on-login
(`04-cart.md`), checkout requires a known user (`05-checkout-and-payments.md`),
orders belong to a user (`06-orders.md`), and the admin dashboard requires a
`role === 'admin'` gate (`08-admin-dashboard.md`). Build this first, before
any of those.

## Current state — 100% from scratch

- `apps/api` has **no auth module, no strategies, no guards**. No
  `passport`, `passport-jwt`, `bcrypt`, `@nestjs/jwt`, or `@nestjs/passport`
  in `apps/api/package.json`.
- `.env.example` already reserves `JWT_SECRET` / `JWT_EXPIRES_IN` — nothing
  consumes them yet.
- `apps/api/src/main.ts` is a bare `NestFactory.create(AppModule)` — no
  global `ValidationPipe`, no CORS config. You'll need both for auth DTOs
  and cross-app cookie handling.
- Storefront header (`src/components/Header/header.tsx:99`) links to
  `/auth`, but that route doesn't exist — dead link today.
- `apps/admin` has zero auth code and no router installed yet (see
  `08-admin-dashboard.md` / `09-shared-packages.md` — install a router
  before building the login page).
- `apps/blog` needs no auth for reading. Skip it entirely for now.

## Data model

Pick an ORM before this doc's checklist starts — see `09-shared-packages.md`
for the recommendation (Prisma). Fields below are ORM-agnostic.

**User**
- `id` uuid pk
- `email` unique, indexed (case-insensitive — use `citext` or lowercase on write)
- `passwordHash`
- `firstName`, `lastName`
- `phone` nullable
- `role` enum `customer | admin`, default `customer`
- `emailVerifiedAt` nullable (defer email verification to post-v1 unless you want it now)
- `createdAt`, `updatedAt`

**Address** (used here for account profile, reused by checkout)
- `id`, `userId` fk indexed, `label`, `line1`, `line2` nullable, `city`,
  `region`, `postalCode`, `country`, `isDefault` bool

**RefreshToken** — store refresh tokens server-side so they're revocable
(pure stateless JWT refresh can't be logged out).
- `id`, `userId` fk, `tokenHash`, `expiresAt`, `revokedAt` nullable,
  `replacedByTokenId` nullable

**PasswordResetToken**
- `id`, `userId` fk, `tokenHash`, `expiresAt`, `usedAt` nullable

## API design (NestJS `AuthModule`)

| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/auth/register` | none | `RegisterDto` — email, password, firstName, lastName. Returns `{ user, accessToken }`, sets `refresh_token` httpOnly cookie |
| POST | `/auth/login` | none | `LoginDto` — same response shape |
| POST | `/auth/refresh` | refresh cookie | Reads `refresh_token` cookie, rotates it, returns new `accessToken` |
| POST | `/auth/logout` | refresh cookie | Revokes the refresh token row, clears cookie |
| POST | `/auth/forgot-password` | none | Always 202, never reveal whether the email exists. Sends via Mailhog SMTP (`05-checkout-and-payments.md` has the mailer setup) |
| POST | `/auth/reset-password` | none | `{ token, newPassword }` |
| GET | `/auth/me` | `JwtAuthGuard` | Current user profile |

NestJS-specific setup:
- `PassportModule` + `JwtModule.registerAsync(...)` reading `JWT_SECRET` via
  `@nestjs/config` (install `@nestjs/config`, call `ConfigModule.forRoot()`
  in `AppModule` — doesn't exist yet).
- `JwtStrategy extends PassportStrategy(Strategy)` validates the **access**
  token only; refresh tokens are validated manually against the DB (they're
  opaque/hashed, not verified as JWTs, so a leaked DB row can be revoked).
- `JwtAuthGuard` (wraps `AuthGuard('jwt')`), `RolesGuard` + `@Roles('admin')`
  decorator for RBAC. Apply `@UseGuards(JwtAuthGuard, RolesGuard)` at the
  controller level for admin-only controllers.
- Add `app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))`
  in `main.ts` — this doesn't exist yet and every DTO in every future module
  depends on it.
- `bcrypt` with 10–12 salt rounds for password hashing.
- `app.enableCors({ origin: [...], credentials: true })` in `main.ts` —
  needed even though local dev won't obviously require it (see Pitfalls).

## Frontend implementation

**Storefront (Next.js App Router)**
- Build `src/app/auth/login/page.tsx` and `.../register/page.tsx`
  (client components — forms need interactivity), fixing the dead
  `/auth` link at `header.tsx:99`.
- Call the API with `fetch(..., { credentials: 'include' })` so the refresh
  cookie is set/sent.
- Hold the **access token in memory** via a React context/provider (not
  `localStorage` — XSS risk), rehydrate on app load by calling
  `/auth/refresh` once.
- Add a thin fetch wrapper (`src/lib/api-client.ts` — doesn't exist yet,
  see `09-shared-packages.md`) that attaches the access token and retries
  once through `/auth/refresh` on a 401.

**Admin (Vite/React)**
- No router exists yet — install one first (`react-router` is the pragmatic
  default) before building `/login`.
- Same token strategy as storefront. Additionally: **reject non-admin
  logins client-side** with a clear error, even though the API's
  `RolesGuard` is the real enforcement — don't let a customer land on a
  half-rendered dashboard before the 403 comes back.
- Guard routes with a simple `<RequireAdmin>` wrapper that checks the
  in-memory user/role before rendering protected routes.

**Blog** — nothing to build here yet.

## Build steps

1. Install `@nestjs/config`, `@nestjs/jwt`, `@nestjs/passport`, `passport`,
   `passport-jwt`, `bcrypt`, `class-validator`, `class-transformer` in `apps/api`.
2. Wire `ConfigModule.forRoot({ isGlobal: true })` and the global
   `ValidationPipe` in `main.ts`. Commit — this unblocks every later module.
3. Add `User`, `Address`, `RefreshToken`, `PasswordResetToken` to your ORM
   schema, run the first migration.
4. Build `POST /auth/register` + `POST /auth/login`, test with `curl`.
5. Add `JwtStrategy` + `JwtAuthGuard`, build `GET /auth/me`, confirm it
   401s without a token and 200s with one.
6. Add `RefreshToken` rotation (`POST /auth/refresh`, `POST /auth/logout`).
7. Add `RolesGuard` + `@Roles('admin')`, create one throwaway admin-only
   route to prove RBAC works before building real admin endpoints.
8. Add forgot/reset password (needs the mailer from `05-checkout-and-payments.md`
   — you can stub the email send with a console log until that doc is done,
   then wire it for real).
9. Build the storefront login/register pages, wire the fetch wrapper.
10. Install a router in `apps/admin`, build its login page + route guard.

## Pitfalls specific to this stack

- **Local dev hides a cookie bug that prod will hit.** `docker/nginx/local.conf`
  path-routes everything through one origin (`localhost/api/*`,
  `localhost/admin/*`, ...), so cookies work same-origin without any CORS
  or `Domain` configuration in dev. `docker/nginx/prod.conf` routes by
  **subdomain** instead (`storefront.example.com`, `api.example.com`, ...) —
  a genuinely cross-origin setup. If you don't set `enableCors({ credentials: true, origin: [...] })`
  and cookie `Domain=.example.com` from the start, auth will work perfectly
  in dev and silently fail in prod. Configure CORS correctly now even
  though you won't see the failure locally.
- Don't put the access token in `localStorage` — any XSS in the storefront
  (you're rendering user-generated review/blog content eventually) becomes
  session theft. Memory + httpOnly refresh cookie is the safer default here.
- `next.config.ts` currently has `typescript.ignoreBuildErrors: true` and
  `eslint.ignoreDuringBuilds: true` — real type errors in your new auth
  fetch code won't fail the build. Worth removing once you're writing
  real logic instead of mock data (flagged again in `09-shared-packages.md`).
- `SameSite=Lax` is fine across `*.example.com` subdomains (same registrable
  domain) — you don't need `SameSite=None`/extra `Secure` gymnastics, just
  the explicit `Domain` attribute.

## Done looks like

- Register → login → refresh → logout all work against the real DB, tested
  via `curl` and from the storefront UI.
- A customer JWT gets a 403 from an admin-only route; an admin JWT gets 200.
- Refreshing the storefront page keeps the user logged in (silent refresh
  works).
- Admin login rejects a customer account with a visible error, not a blank
  dashboard.
- Forgot/reset password round-trips through Mailhog (visible at
  `localhost:8025`).
