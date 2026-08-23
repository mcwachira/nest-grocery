# 07 — Blog

## Where this fits

Mostly independent of the storefront/api build-out — can be built any time
after `02-products-and-categories.md` if you want product cross-linking, or
entirely in parallel with cart/checkout since it doesn't share auth or data
requirements with the shop flow (readers don't need accounts).

## Current state — unmodified starter template

`apps/blog` is the stock Turborepo "kitchen-sink" Remix starter, not a
partial blog build. Route tree is exactly two files: `app/routes/_index.tsx`
(renders a demo `CounterButton` + boilerplate Turborepo/Remix links) and
`app/routes/edge.tsx` (a demo edge-runtime page). No loaders, no MDX, no
database, no CMS integration anywhere. A repo-wide search for `mdx`,
`posts`, `cms` turns up nothing. This is a from-scratch build.

One thing to fix as you touch this app: `apps/blog` is still on
**React 18.3.1** while `apps/storefront`/`apps/admin` are being moved to
React 19 via `@repo/ui` (see `09-shared-packages.md`) — bump it as part of
this work, not as an afterthought, since any shared component you pull in
from `packages/ui` will be built/typed against React 19.

## Decision: content model

**Recommendation: MDX files in the repo, not a database or headless CMS.**
Concretely: `apps/blog/app/content/*.mdx` with YAML frontmatter (title,
slug, date, excerpt, coverImage, optional `relatedProductSlugs`), loaded via
Remix loaders reading the filesystem + `gray-matter` for frontmatter +
`@mdx-js/mdx` (or `mdx-bundler`) to compile.

Why, concretely, for a solo-built project:
- No CMS infrastructure to run, pay for, or keep patched (Sanity/Contentful
  free tiers are fine, but they're one more account, one more API key,
  one more thing that can be down when you're trying to ship a post).
- No DB-backed authoring UI to build — a `BlogPost` entity + admin CRUD
  screens would be real scope added to `08-admin-dashboard.md` for a
  feature (blogging) that isn't the core product.
- Git-based versioning and review "for free" — a post is a PR.
- Writing in a code editor with MDX means you can embed real interactive
  components (e.g. an actual `ProductCard` pulling live data) directly in
  post content, which a DB `content: text` column can't do without its own
  templating layer.

Revisit only if a non-technical person other than you starts writing posts
— that's the actual trigger for needing a real authoring UI/CMS, not
"scale."

## Data model

No database entities for this doc. The "model" is the MDX frontmatter
schema:
```yaml
title: string
slug: string          # filename-derived is fine; keep explicit for clarity
date: ISO date
excerpt: string
coverImage: string     # path under public/ or a remote URL
relatedProductSlugs: string[]   # optional, see cross-linking below
```

## API design

None. This is the one area of the app that doesn't talk to `apps/api` at
all for its core content — that's a feature of the MDX-in-repo choice, not
a gap. The only API interaction is optional: if a post references
`relatedProductSlugs`, the blog can `fetch()` `apps/api`'s public
`GET /products/:slug` (from `02-products-and-categories.md`) at render time
to show a live product card (price, stock) inside the post, rather than
hardcoding product details that go stale.

## Frontend implementation (Remix)

- `app/routes/blog._index.tsx` — loader reads all files in
  `app/content/`, parses frontmatter, returns a sorted-by-date list.
  Remix's loader pattern (server-only code, no client fetch waterfall) is
  a good fit here — this is exactly what loaders are for.
- `app/routes/blog.$slug.tsx` — loader reads the one matching MDX file,
  compiles it, returns the rendered content + frontmatter; `throw new Response("Not Found", { status: 404 })`
  for an unknown slug.
- If using `relatedProductSlugs`, the same loader can `Promise.all` fetch
  calls to `apps/api` alongside reading the file — Remix loaders are a
  natural place for this kind of parallel data fetch, unlike a Next.js
  server component where you'd reach for the same pattern differently.
- Delete `app/routes/edge.tsx` (the demo edge page) and the demo
  `CounterButton` usage in `_index.tsx` once real content routes exist.
- Storefront cross-linking: add a "From the Blog" section on relevant
  storefront pages (e.g. category pages) that links out to
  `blog.example.com/...` — simple `<a>` to the separate app/subdomain, no
  shared routing needed since these are genuinely separate deployments.

## Build steps

1. Bump `apps/blog`'s React 18.3.1 → 19.1.1 to match storefront/admin
   (small, mechanical — do it before pulling in any `packages/ui`
   component here).
2. Install `gray-matter` + an MDX compiler (`@mdx-js/mdx` or `mdx-bundler`
   — `mdx-bundler` handles component embedding more cleanly if you want
   live product cards in posts; plain `@mdx-js/mdx` is simpler if you
   don't need that yet).
3. Create `app/content/` with 2–3 real posts as you build, replacing the
   demo route content.
4. Build the index loader/route (list view).
5. Build the `$slug` loader/route (detail view) with proper 404 handling.
6. If desired, wire `relatedProductSlugs` → live product fetch from
   `apps/api`.
7. Remove the demo `edge.tsx` route and leftover `CounterButton` usage.
8. Add the storefront → blog cross-link section.

## Common pitfalls for this exact stack

- Don't let the MDX compile step run in the request path for every
  request in production — cache compiled output (a simple in-memory cache
  keyed by slug + file mtime is enough at this content volume; don't
  reach for a build-time static-generation pipeline unless post count
  grows into the hundreds).
- If you do pull `packages/ui` components into MDX content, remember its
  `peerDependencies` currently allow `react >=18` but its own
  `devDependencies`/build output are React 19-targeted (`09-shared-packages.md`)
  — this is the exact mismatch surface the repo is already mid-fixing for
  admin; don't reintroduce it here by skipping step 1.
- Keep the product-fetch-in-loader pattern resilient to `apps/api` being
  down — a blog post shouldn't 500 because the product API is unreachable;
  catch the fetch error and render the post without the live product card.

## What "done" looks like

- `/blog` lists real posts from `app/content/`, sorted by date; `/blog/:slug`
  renders one, 404s for unknown slugs.
- The demo `edge.tsx` route and starter boilerplate are gone.
- `apps/blog` is on React 19, matching storefront/admin.
- At least one post embeds a live product reference that reflects current
  price/stock, not a hardcoded snapshot.
