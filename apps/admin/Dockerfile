# apps/admin/Dockerfile
# Vite SPA — internal admin dashboard.
# Vite produces static files, so unlike api/storefront/blog there's no
# Node server to run in production: the "runner" stage is a tiny nginx
# that just serves the built static/index.html with SPA fallback routing
# (see docker/nginx/spa.conf).

# syntax=docker/dockerfile:1

FROM node:24-alpine AS base
RUN npm install -g turbo pnpm@9
WORKDIR /app

# -----------------------------------------------------------------------
# 1) pruner — isolate just what "admin" needs from the monorepo
# -----------------------------------------------------------------------
FROM base AS pruner
COPY . .
RUN turbo prune admin --docker

# -----------------------------------------------------------------------
# 2) installer — install pruned dependencies
# -----------------------------------------------------------------------
FROM base AS installer
COPY --from=pruner /app/out/json/ .
RUN pnpm install --frozen-lockfile

# -----------------------------------------------------------------------
# 3) dev — hot-reload target used by docker-compose.yml.
#    --host is required so Vite's dev server accepts connections from
#    outside the container, not just localhost inside it.
# -----------------------------------------------------------------------
FROM installer AS dev
COPY --from=pruner /app/out/full/ .
WORKDIR /app/apps/admin
EXPOSE 5173
CMD ["pnpm", "run", "dev", "--", "--host"]

# -----------------------------------------------------------------------
# 4) builder — static production build (outputs to apps/admin/dist)
# -----------------------------------------------------------------------
FROM installer AS builder
COPY --from=pruner /app/out/full/ .
RUN turbo run build --filter=admin

# -----------------------------------------------------------------------
# 5) runner — nginx serving the static build. This is a *second*, small
#    nginx instance separate from your main docker/nginx reverse proxy —
#    the main nginx proxies requests to this container.
# -----------------------------------------------------------------------
FROM nginx:1.27-alpine AS runner
COPY --from=builder /app/apps/admin/dist /usr/share/nginx/html
COPY docker/nginx/spa.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
