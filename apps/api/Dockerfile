# apps/api/Dockerfile
# NestJS backend. Built with `turbo prune` so the image only contains the
# code and dependencies this app actually needs, not the whole monorepo.
#
# Build context for this file is the REPO ROOT (see docker-compose.yml),
# not apps/api/ — that's required for turbo prune to see packages/*.

# syntax=docker/dockerfile:1

FROM node:24-alpine AS base
RUN apk add --no-cache libc6-compat
RUN npm install -g turbo pnpm@8.15.6
WORKDIR /app

# -----------------------------------------------------------------------
# 1) pruner — turbo prune extracts only what "api" depends on (its own
#    source, plus any packages/* it imports) into /app/out
# -----------------------------------------------------------------------
FROM base AS pruner
COPY . .
RUN turbo prune api --docker

# -----------------------------------------------------------------------
# 2) installer — install deps for just the pruned package.json/lockfile
#    (this layer caches well: it only re-runs when dependencies change)
# -----------------------------------------------------------------------
FROM base AS installer
COPY --from=pruner /app/out/json/ .
RUN pnpm install --frozen-lockfile

# -----------------------------------------------------------------------
# 3) dev — used by docker-compose.yml (target: dev). The actual source
#    is bind-mounted over this at runtime for hot reload, so what's
#    copied here just needs to exist so `pnpm run start:dev` can boot.
# -----------------------------------------------------------------------
FROM installer AS dev
COPY --from=pruner /app/out/full/ .
WORKDIR /app/apps/api
EXPOSE 4000
CMD ["pnpm", "run", "start:dev"]

# -----------------------------------------------------------------------
# 4) builder — compiles the production build
# -----------------------------------------------------------------------
FROM installer AS builder
COPY --from=pruner /app/out/full/ .
RUN turbo run build --filter=api

# -----------------------------------------------------------------------
# 5) runner — minimal final image, no dev dependencies, non-root user.
#    This is the stage docker-compose.prod.yml / CI builds and pushes.
# -----------------------------------------------------------------------
FROM node:24-alpine AS runner
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nestjs

COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules

USER nestjs
WORKDIR /app/apps/api
EXPOSE 4000
CMD ["node", "dist/main.js"]
