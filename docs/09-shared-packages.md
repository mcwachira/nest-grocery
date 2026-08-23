# 09 — Shared Packages

## Where this fits

Cross-cutting — read this before pulling `packages/ui` into any of the
three frontends' work, and revisit it whenever you're tempted to "just
share" something between apps. This is also where the ORM choice (needed
starting in `01-auth.md`) is decided.

## Current state

**`packages/ui`** — built with `bunchee` (dual ESM/CJS output to
`dist/es`/`dist/cjs`), exports only two subpaths: `./counter-button` and
`./link` (no barrel `.` export). This is starter-template content, not a
real design system yet — everything you actually need (product card,
data table, form inputs, buttons, badges) doesn't exist here.

**`packages/logger`** — a single-function `console.log` wrapper. Not used
by `apps/api` at all. Was referenced by `apps/storefront`'s home page but
that import was just removed in the working tree (per `git status`) —
effectively unused right now.

**`packages/config-eslint`**, **`packages/config-typescript`**,
**`packages/jest-presets`** — genuinely useful shared tooling config,
already in reasonable shape, nothing to change here.

## The live React version mismatch (fix this first)

This repo has a **real, currently-unresolved** version mismatch, not a
hypothetical one to guard against:

| Package | React version |
|---|---|
| `apps/storefront` | `19.1.1` (exact) |
| `apps/admin` | `^19.1.1` (staged change, was `^18.3.1`) |
| `apps/blog` | `^18.3.1` (**not bumped**) |
| `packages/ui` peerDependency | `>=18` (permissive — doesn't prevent this) |
| `packages/ui` devDependency | `^19.1.1` (staged — its build/types now target 19) |

`packages/ui`'s permissive peer range (`>=18`) means pnpm won't warn you
about this, but its `devDependencies`/`@types/react` are now pinned to 19
— so **`apps/blog` is consuming a package built and typed against a React
major it isn't running.** This is exactly the failure mode described in
the prompt for this build guide, and it's live today, not a risk to watch
for later.

**Fix**: bump `apps/blog`'s `react`/`react-dom`/`@types/react`/`@types/react-dom`
to match (`19.1.1`/`^19.1.13`) as step 1 of `07-blog.md`. Do this before
building any blog UI that imports from `@repo/ui`.

**Prevent recurrence**: tighten `packages/ui`'s peerDependency from
`>=18` to a specific major (`"react": "19.x"` or `"^19.0.0"`) once every
app is actually on 19. A permissive peer range is what let this drift
happen silently in the first place — pnpm only flags a peer mismatch if
the range excludes the installed version.

## What belongs in a shared package vs. app-local

Default to **app-local until a second real consumer exists**, not before:

- **Promote to `packages/ui`** once the same visual component is needed
  by two apps with the same design intent — e.g. a `DataTable` will
  likely be needed by both admin (products/orders/categories tables) and
  possibly a future storefront account/orders table. Don't build it in
  `packages/ui` speculatively; build it in `apps/admin/src/components`
  first, promote it once admin needs it twice or storefront needs it too.
- **Keep app-local**: anything storefront-specific (product card grid,
  cart popup, checkout form) — admin's product *table* and storefront's
  product *card* look and behave nothing alike; don't force a shared
  abstraction because they're both "product UI."
- **`packages/logger`**: either commit to actually using it from
  `apps/api` (a structured logger — e.g. wrap `pino` or Nest's built-in
  `Logger` — is genuinely useful backend infra) or delete it. A
  `console.log` wrapper nobody imports is dead weight; don't let it linger
  unused just because it exists.

## ORM decision (needed starting in `01-auth.md`)

**Recommendation: Prisma**, not TypeORM. For a solo-built project:
- Schema-first `.prisma` file is a single, readable source of truth for
  every entity across `01-auth.md` through `06-orders.md` — easier to hold
  the whole data model in your head than scattered TypeORM decorator
  classes.
- `prisma migrate dev` gives you real, reviewable SQL migrations with
  minimal ceremony — good for a project with no separate DBA/reviewer.
  TypeORM's migration generation is more manual and easier to get subtly
  wrong.
- Generated types flow naturally into NestJS DTOs/services without extra
  decorator boilerplate.
- Wrap it in a `PrismaService` (extends `PrismaClient`, implements
  `OnModuleInit`) injected via a `PrismaModule` — the standard NestJS+Prisma
  pattern, one module, reused by every domain module (`UsersModule`,
  `ProductsModule`, `OrdersModule`, etc.).

Install this in `apps/api` as literally the first infra step before
`01-auth.md`'s checklist starts.

## Common pitfalls for this exact stack

- **`pnpm-lock.yaml` churn**: this repo has already seen small, scoped
  lockfile diffs from dependency bumps (the React 18→19 change touched
  ~24 lines). Keep dependency bumps scoped and reviewed per-PR — don't
  let an unrelated feature branch also silently bump/pin something in
  `packages/ui`, which affects every consuming app at once.
- **`packages/ui` has no barrel export** (`./counter-button`, `./link`
  subpaths only, no `.`) — as you add real components, keep this pattern
  (explicit subpath exports) rather than switching to a single barrel
  file; it keeps bundlers from pulling in unused components and makes
  each addition to `package.json`'s `exports` map an explicit, reviewable
  decision.
- Any new shared UI component needs to build cleanly under `bunchee`'s
  dual ESM/CJS output — test `pnpm build` in `packages/ui` itself after
  adding a component, don't just test it via the consuming app's dev
  server (which is more forgiving of module resolution issues than a
  production build will be).
- `next.config.ts`'s `ignoreBuildErrors`/`eslint.ignoreDuringBuilds: true`
  in `apps/storefront` mean a broken import from a newly-changed
  `packages/ui` export won't fail the storefront's build — actually run
  `pnpm build` (not just `pnpm dev`) across affected apps after changing
  a shared package, since dev-server module resolution can mask breakage
  that a production build won't.

## What "done" looks like

- All three frontends (`storefront`, `admin`, `blog`) run the same React
  major, and `packages/ui`'s peerDependency range reflects that (not left
  permissive at `>=18`).
- `packages/logger` is either wired into `apps/api`'s real logging or
  removed — not left as unused dead code.
- Prisma is installed in `apps/api`, with a single `schema.prisma`
  covering every entity introduced across docs `01`–`06`.
