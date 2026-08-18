# apps/blog/Dockerfile
# Remix (Vite plugin) content/blog site.
#
# NOTE: because apps/blog has a vite.config.ts, this is Remix v2's Vite
# build, which outputs to build/server/ + build/client/ (different from
# classic Remix, which outputs build/index.js + public/build/). If your
# package.json "start" script is `remix-serve ./build/server/index.js`,
# the CMD below is correct as-is. If you're using a custom Express/Nest
# server instead of remix-serve, swap the final CMD accordingly.

# syntax=docker/dockerfile:1

FROM node:24-alpine AS base
RUN npm install -g turbo pnpm@9
WORKDIR /app

# -----------------------------------------------------------------------
# 1) pruner — isolate just what "blog" needs from the monorepo
# -----------------------------------------------------------------------
FROM base AS pruner
COPY . .
RUN turbo prune blog --docker

# -----------------------------------------------------------------------
# 2) installer — install pruned dependencies
# -----------------------------------------------------------------------
FROM base AS installer
COPY --from=pruner /app/out/json/ .
RUN pnpm install --frozen-lockfile

# -----------------------------------------------------------------------
# 3) dev — hot-reload target used by docker-compose.yml
# -----------------------------------------------------------------------
FROM installer AS dev
COPY --from=pruner /app/out/full/ .
WORKDIR /app/apps/blog
EXPOSE 3000
CMD ["pnpm", "run", "dev"]

# -----------------------------------------------------------------------
# 4) builder — production build
#    Remix-Vite emits:
#      build/client/  -> static assets (served directly)
#      build/server/  -> the server bundle (remix-serve runs this)
# -----------------------------------------------------------------------
FROM installer AS builder
COPY --from=pruner /app/out/full/ .
RUN turbo run build --filter=blog

# -----------------------------------------------------------------------
# 5) runner — minimal runtime image, non-root user
# -----------------------------------------------------------------------
FROM node:24-alpine AS runner
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 remix

COPY --from=builder /app/apps/blog/build ./apps/blog/build
COPY --from=builder /app/apps/blog/public ./apps/blog/public
COPY --from=builder /app/apps/blog/package.json ./apps/blog/package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/blog/node_modules ./apps/blog/node_modules

USER remix
WORKDIR /app/apps/blog
EXPOSE 3000
# Adjust this if your package.json "start" script differs
CMD ["pnpm", "run", "start"]
