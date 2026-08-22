# Backend 02b — Auth API: fix guide

This is a **diagnosis + fix checklist** for the auth module, tracking it
from "doesn't compile" through "compiles and runs" to "matches the full
spec in `01-auth.md`." The target design lives in `docs/01-auth.md` (spec)
and `docs/backend/02-auth-api.md` (reference implementation) — this doc is
the delta between that reference and reality, in the order to close it.

**Status as of 2026-08-22: everything in this doc is done and verified —
Priority 0, 1, 1.5, Priority 2 (Steps A–C), the security checklist (except
the cleanup cron job, deferred on purpose, not urgent), and the test
suite. Full flow (register → login → `/auth/me` → refresh → logout →
forgot-password → reset-password → rate-limited login) verified against
the real dev stack, and `pnpm test` passes 16/16.** The rest of this doc
is kept as a record of what broke and how it got fixed — useful the next
time something in this area regresses, and as a template for hardening
the next feature module the same way.

> **A note on editing this file:** an earlier revision of this doc got
> corrupted when a full `auth.service.ts` rewrite was pasted directly into
> one of the code fences below instead of into the actual `.ts` file —
> the fence never closed properly and the doc briefly contained a second,
> divergent copy of the service. If you're following a step in this guide
> by retyping it, type it into the source file in your editor, not into
> this markdown file. Use this doc to read and verify, not as scratch
> space.

```bash
cd apps/api
npx tsc --noEmit -p tsconfig.json   # should report 0 errors
```

(Ignore a `TS5033 ... dist/tsconfig.tsbuildinfo: EACCES` line if you see
one — stale `dist/` permissions, unrelated to auth.)

## Priority 0 — the build was broken ✅ fixed

All in `apps/api/src/auth/auth.controller.ts`, all resolved:

1. Constructor property (`authService`) didn't match what the methods
   called (`this.auth`) — unified to `this.authService` everywhere.
2. `refresh()`/`logout()` had a bogus `@Req() dto: Register` parameter
   instead of `@Req() req: Request` — fixed.
3. `refresh()` was passing the whole Express request into
   `AuthService.refresh()` instead of the extracted raw token — fixed,
   now calls `this.authService.refresh(raw)`.
4. `logout()`'s `res.clearCookie(...)` had a stray 3rd argument
   referencing an undeclared variable — fixed to the 2-arg form.
5. `AuthService.findProfile()` didn't exist — added, with `passwordHash`
   explicitly excluded via `select` (never fetch-then-strip).

## Priority 1 — compiled, but wrong behavior ✅ fixed

6. `register()` was mounted on bare `@Post()` (→ `POST /auth`) instead of
   `@Post('register')` (→ `POST /auth/register`) — fixed.
7. `RolesGuard`'s `getAllAndOverride` call had a nested-array bug
   (`[[handler, class]]` instead of `[handler, class]`) that broke RBAC
   and produced the cascading `TS2769`/`TS2339` errors — flattened, both
   errors are gone.
8. `JwtStrategy`'s `secretOrKey: config.get('JWT_SECRET')` typed as
   `string | undefined` — switched to `config.getOrThrow<string>(...)` in
   both `jwt.strategy.ts` and `auth.module.ts`'s `JwtModule.registerAsync`
   factory, so a missing `JWT_SECRET` now fails fast at boot instead of
   silently producing tokens signed with `undefined`.

## Priority 1.5 — Docker environment was stale (found via `docker logs`, now fixed)

`docker logs nest-grocery-api` showed a *different* error set than a local
`tsc` run: `Cannot find module '@nestjs/config'`, `bcrypt`, `passport-jwt`,
`class-validator`, `@prisma/client`, `pg`, etc. — every auth-related
dependency. This wasn't a code bug; it was environment drift:

- `apps/api/package.json` / `pnpm-lock.yaml` had these dependencies added
  locally (`pnpm install` on the host), but the `api` container's
  `node_modules` is baked into the image at build time
  (`apps/api/Dockerfile`'s `installer` stage runs
  `pnpm install --frozen-lockfile`) and then re-exposed via **anonymous
  volumes** (`docker-local.yml`'s `/app/node_modules`,
  `/app/apps/api/node_modules`). Anonymous volumes persist across
  container restarts and are *not* refreshed by a plain rebuild — the
  container was still running packages from whenever the image was last
  built, before the auth deps existed.
- Once the image was rebuilt, `@prisma/client` was present but not yet
  **generated** against `schema.prisma` (`PrismaClient`, `Role`,
  `OrderStatus`, etc. weren't exported yet) — Prisma 7 requires an
  explicit `prisma generate` step; nothing in this repo runs it
  automatically on install.
- Once generated, the first real request (`POST /auth/login`) 500'd with
  Prisma error `P2021 — table "public.users" does not exist`: the two
  migrations in `apps/api/prisma/migrations/` had never been applied to
  this Postgres volume (`prisma migrate status` confirmed both pending).

**The fix, in order** (re-run this whenever you add a dependency to
`apps/api/package.json` or change `schema.prisma` and the container
doesn't pick it up):

```bash
# 1. Rebuild the image (reruns pnpm install against the current lockfile)
docker compose -f docker-local.yml build api

# 2. Recreate the container with FRESH anonymous volumes — a plain
#    `up -d` reuses the old node_modules volume even after a rebuild
docker compose -f docker-local.yml up -d --force-recreate --renew-anon-volumes api

# 3. Generate the Prisma client inside the container against the current schema
docker exec -w /app/apps/api nest-grocery-api npx prisma generate

# 4. Apply any pending migrations (dev database — safe to run repeatedly)
docker exec -w /app/apps/api nest-grocery-api npx prisma migrate deploy

# 5. Restart so the nest watcher re-typechecks against the now-populated
#    @prisma/client (it doesn't watch node_modules for changes)
docker restart nest-grocery-api
```

Verify with `docker logs nest-grocery-api --tail 30` — you want
`Found 0 errors` followed by all five `Mapped {/auth/..., ...}` route
lines and no stack trace on the next request.

## Priority 2 — implement the missing spec pieces ✅ fixed

These didn't show up as compiler errors — they were gaps against
`01-auth.md`'s API table. Steps A–C below are all implemented now.
Getting there hand-typed a few new slip bugs, worth recording since
they're the same *kind* of mistake as Priority 0's, not new lessons:

- `issueTokenPair` was refactored to take one `user` object instead of
  `(userId, role)` (Step A below), but the three call sites
  (`register`/`login`/`refresh`) still called it the old two-argument way
  — `TS2554: Expected 1 arguments, but got 2` at all three. Fixed by
  passing the full `user`/`stored.user` object each already had in scope.
- The returned user object had `lastNane: user.lastName` — a typo in the
  *key*, not the value. TypeScript doesn't catch this because the return
  type isn't explicitly annotated, so it compiles fine and just silently
  ships a misspelled field to every client. This is exactly the kind of
  bug an explicit return-type annotation (or a test asserting the exact
  response shape — see `auth.service.spec.ts`'s `register` test) catches
  that a quick manual `curl` might not, if you don't look closely at the
  field names.
- `auth.controller.ts`'s `resetPassword` handler called
  `this.authService.resetPassword(dto.toke, dto.newPassword)` —
  `dto.toke` instead of `dto.token`. TypeScript *did* catch this one
  (`TS2551: Property 'toke' does not exist... Did you mean 'token'?`) —
  the difference from the previous bug is purely that this one used a
  property that genuinely doesn't exist, so `tsc` could reject it,
  whereas `lastNane` created a *new* property that TypeScript had no
  reason to object to.
- `register()`/`login()` in the controller kept destructuring only
  `{ accessToken, rawRefreshToken }` and returning `{ accessToken }` even
  after the service started returning `user` too — an incomplete
  refactor, not a typo. Fixed by destructuring and returning `user`
  alongside `accessToken` in both handlers.

Do these next, in this order, to finish the auth module fully before
moving to the next part of the API.

### Step A — decide and fix `register()`/`login()`'s response shape

`01-auth.md`'s API table says register/login return `{ user, accessToken
}`. Right now `AuthService.register`/`login` return only `{ accessToken,
rawRefreshToken }` (the controller strips `rawRefreshToken` into the
cookie and returns `{ accessToken }` — no `user`). Fix by having
`issueTokenPair` also return a safe user object:

```ts
// auth.service.ts — issueTokenPair currently takes (userId, role);
// change call sites to pass the user object you already have instead
// of just its id/role, and shape a safe subset to return.

private async issueTokenPair(user: { id: string; role: Role; email: string; firstName: string; lastName: string }) {
  const accessToken = this.jwt.sign(
    { sub: user.id, role: user.role },
    { expiresIn: this.config.get('JWT_EXPIRES_IN') ?? '15m' },
  );

  const rawRefreshToken = crypto.randomBytes(40).toString('hex');
  const tokenHash = this.hashToken(rawRefreshToken);
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);

  await this.prisma.refreshToken.create({ data: { userId: user.id, tokenHash, expiresAt } });

  return {
    accessToken,
    rawRefreshToken,
    user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role },
  };
}
```

Update `register()`/`login()`/`refresh()` to pass the full user (they
already have it — `user` from `create`/`findUnique`, `stored.user` from
the refresh lookup) instead of `user.id, user.role`. Then in
`auth.controller.ts`, destructure and return `user` alongside
`accessToken`:

```ts
const { accessToken, rawRefreshToken, user } = await this.authService.register(dto);
res.cookie(REFRESH_COOKIE, rawRefreshToken, REFRESH_COOKIE_OPTS);
return { accessToken, user };
```

Same change in `login()`. `refresh()` can keep returning just
`{ accessToken }` — the client already has the user from the initial
login/register and doesn't need it re-sent on every silent refresh.

Verify: `curl -s -X POST http://localhost:4000/auth/register -d '...'`
response body should now include a `user` object with no `passwordHash`
field.

### Step B — `POST /auth/forgot-password`

Add to `auth.controller.ts`:

```ts
@Post('forgot-password')
@HttpCode(202)
async forgotPassword(@Body() dto: ForgotPasswordDto) {
  await this.authService.forgotPassword(dto.email);
  // Always 202, regardless of whether the email exists — same
  // user-enumeration reasoning as login()'s generic error message.
}
```

You'll need a small `ForgotPasswordDto` (doesn't exist yet):

```ts
// apps/api/src/auth/dto/forgot-password.dto.ts
import { IsEmail } from 'class-validator';

export class ForgotPasswordDto {
  @IsEmail()
  email: string;
}
```

Add to `auth.service.ts` — this is the first code to touch the
`PasswordResetToken` model, which already exists in `schema.prisma`:

```ts
async forgotPassword(rawEmail: string) {
  const email = rawEmail.toLowerCase();
  const user = await this.prisma.user.findUnique({ where: { email } });

  // Do the token creation + "send" only if the user exists, but never
  // let the caller learn that from the response — same shape either way.
  if (user) {
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await this.prisma.passwordResetToken.create({
      data: { userId: user.id, tokenHash, expiresAt },
    });

    // Stub until the mailer from 05-checkout-and-payments.md exists.
    // Log the raw token so you can copy it into reset-password during
    // local testing — this line must not survive to production.
    console.log(`[dev-only] password reset link: /reset-password?token=${rawToken}`);
  }
}
```

### Step C — `POST /auth/reset-password`

`ResetPasswordDto` already exists (`dto/reset-password.dto.ts`) — nothing
to add there. Controller:

```ts
@Post('reset-password')
@HttpCode(200)
async resetPassword(@Body() dto: ResetPasswordDto) {
  await this.authService.resetPassword(dto.token, dto.newPassword);
}
```

Service:

```ts
async resetPassword(rawToken: string, newPassword: string) {
  const tokenHash = this.hashToken(rawToken);
  const stored = await this.prisma.passwordResetToken.findUnique({ where: { tokenHash } });

  if (!stored || stored.usedAt || stored.expiresAt < new Date()) {
    throw new UnauthorizedException('Invalid or expired reset token');
  }

  const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

  await this.prisma.$transaction([
    this.prisma.user.update({ where: { id: stored.userId }, data: { passwordHash } }),
    this.prisma.passwordResetToken.update({ where: { id: stored.id }, data: { usedAt: new Date() } }),
    // Also revoke every existing refresh token for this user — a
    // password reset should kill all existing sessions, not just
    // change the password under them.
    this.prisma.refreshToken.updateMany({
      where: { userId: stored.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
  ]);
}
```

Verify the round trip: call `forgot-password`, copy the logged token,
call `reset-password` with it, confirm login works with the new password
and the old refresh cookie no longer works.

## Security checklist — implementation steps

- ✅ **`GET /auth/me` selects fields explicitly** — done via
  `findProfile`'s `select` (Priority 0, item 5).
- ✅ **CORS origin env vars** — `STOREFRONT_ORIGIN`/`ADMIN_ORIGIN` are now
  in `.env.example` and `apps/api/.env` (`http://localhost` for both in
  dev). Set these to the real subdomains
  (`https://storefront.example.com`, `https://admin.example.com`) when
  you actually deploy to prod.
- ✅ **Refresh-token reuse revocation** — `AuthService.refresh()` now
  revokes every live token for the user the moment a *already-revoked*
  token is presented again (the reuse-detection branch), before rejecting
  the request. Verified with a unit test
  (`auth.service.spec.ts`'s "revokes every live token... when a REVOKED
  token is replayed").
- ✅ **Rate limiting** — `@nestjs/throttler` is installed and
  `ThrottlerModule.forRoot(...)` is configured in `app.module.ts`
  (10 requests/60s), but that alone doesn't enforce anything —
  `ThrottlerModule.forRoot` only registers the *limits*; you still need
  `ThrottlerGuard` applied somewhere to actually check them.
  `app.module.ts` was missing that second half — it configured the
  throttler and then never used it. Fixed by registering
  `{ provide: APP_GUARD, useClass: ThrottlerGuard }` in `AppModule`'s
  `providers`, which applies it to every route repo-wide (not just auth).
  Verified live: 8 rapid `POST /auth/login` attempts return `401`
  (bad credentials), the next several return `429`.
- 🔲 **`refresh_tokens` has no cleanup job.** Not urgent at this scale.
  **Steps when you get to it:** add a `@Injectable()` service with a
  `@Cron(CronExpression.EVERY_DAY_AT_3AM)` method calling
  `this.prisma.refreshToken.deleteMany({ where: { expiresAt: { lt: new
  Date() } } })`; requires `pnpm add @nestjs/schedule` and
  `ScheduleModule.forRoot()` in `app.module.ts`.

## Scalability notes (informational — no action needed yet)

- Access-token verification (`JwtStrategy`) is fully stateless — any
  `api` replica can verify a JWT with only `JWT_SECRET`, no DB round
  trip. This is *why* refresh tokens are DB-backed and revocable while
  access tokens aren't — don't blur that line by making access tokens
  long-lived to avoid refresh calls.
- `bcrypt` at cost 12 blocks the event loop for tens of milliseconds per
  login/register call. Fine at this project's traffic; the first thing
  to reach for if auth becomes a bottleneck is a worker thread pool or
  queue, not lowering the cost factor.
- `refresh_tokens.tokenHash` is a unique index, so lookups stay cheap
  regardless of table size — the cleanup job above is about storage
  hygiene, not query performance.

## Tests ✅ fixed — two separate bugs, not one

There were two independent problems here, and fixing only one would still
have left every test suite in `apps/api` broken.

**Bug 1 — every test in `apps/api` failed before any test body ran,**
with `TypeError: this._moduleMocker.clearMocksOnScope is not a function`
thrown from inside `jest-runtime`, regardless of which file you ran
(confirmed by running the untouched, always-passing
`app.controller.spec.ts` — it failed the exact same way). This made it
look like an auth-specific problem; it wasn't.

Root cause, found via `npx jest --showConfig | grep testEnvironment`:
`apps/api` runs Jest 30, but its *resolved* `testEnvironment` was
`jest-environment-node@29.7.0` — the wrong major version. Why: three
packages elsewhere in this pnpm workspace (`packages/jest-presets`,
`packages/logger`, `packages/ui`) all declare `jest: ^29.7.0`, which gets
a `jest-environment-node@29.7.0` hoisted to the **workspace root**
`node_modules`. `apps/api` never listed `jest-environment-node` as its
own direct dependency, so pnpm never gave it a correctly-versioned copy
in `apps/api/node_modules` — and Jest resolves its test environment with
plain Node module resolution, which walks *up* from `apps/api` and finds
the wrong hoisted 29.x copy at the root before it would ever look
elsewhere. `jest-runtime@30` then calls a method
(`clearMocksOnScope`) that only exists on Jest 30's `ModuleMocker`, but
got handed a `moduleMocker` instance from the 29.x environment, which
doesn't have it.

**Fix:** add `"jest-environment-node": "^30.0.0"` as an explicit
devDependency in `apps/api/package.json`, then `pnpm install`. This gives
`apps/api` its own correctly-versioned symlink directly in
`apps/api/node_modules/jest-environment-node`, which Node's resolution
finds before ever walking up to the workspace root. Verify with
`npx jest --showConfig | grep testEnvironment` — the path should now
contain `jest-environment-node@30.4.1` (or whatever your installed Jest
30.x patch is), not `29.7.0`. This is a real, generally-applicable pnpm
monorepo footgun, not specific to this file — any package in
`apps/api` that Jest resolves via plain Node resolution (not via pnpm's
own strict per-package linking) is at risk of picking up a hoisted
version from a sibling workspace package with a different major pinned.
Watch for it again if `packages/jest-presets` (or anything else) ever
moves off Jest 29.

**Bug 2 — the DI gap.** `auth.controller.spec.ts` and
`auth.service.spec.ts` both built a `TestingModule` with only the class
under test as a provider — neither `AuthController` nor `AuthService`'s
real dependencies (`PrismaService`, `JwtService`, `ConfigService`, or
`AuthService` itself, for the controller) were supplied, so Nest's DI
container couldn't resolve them for anything beyond a bare
`toBeDefined()` check. Fixed by rewriting both files with hand-rolled
`jest.fn()`-based mocks for every dependency (see either file for the
pattern — it's also the worked example in the new testing guide,
`docs/backend/07-testing-guide.md`) and real assertions covering the
behavior that actually matters: duplicate-email `ConflictException`,
identical error messages for "no such user" vs "wrong password", refresh
reuse-revocation, token rotation, and the controller's cookie/response
shape.

Run `pnpm test` (or `npx jest` from `apps/api`) — **16/16 tests pass.**

## What's left

Only the `refresh_tokens` cleanup cron job (Security checklist, last
item) — deliberately deferred, not urgent at this project's scale. Every
other item in this doc is done and verified. Cross-check against
`01-auth.md`'s "Done looks like" checklist next, then move to the next
part of the API — see `docs/backend/08-production-hardening.md` for the
cross-cutting gaps (health checks, structured logging, env validation,
etc.) worth applying to every module from here on, not just auth.
