# syntax=docker/dockerfile:1
FROM node:24-alpine AS base
RUN apk add --no-cache libc6-compat
RUN npm install -g turbo pnpm@9
WORKDIR /app

# ---- Prune the monorepo down to just what "api" needs ----
FROM base AS pruner
COPY . .
RUN turbo prune api --docker

# ---- Install deps for the pruned subset ----
FROM base AS installer
COPY --from=pruner /app/out/json/ .
RUN pnpm install --frozen-lockfile

# ---- Dev target: full source mounted over this, hot reload ----
FROM installer AS dev
COPY --from=pruner /app/out/full/ .
WORKDIR /app/apps/api
EXPOSE 4000
CMD ["pnpm", "run", "start:dev"]

# ---- Build ----
FROM installer AS builder
COPY --from=pruner /app/out/full/ .
RUN turbo run build --filter=api

# ---- Minimal prod runtime ----
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