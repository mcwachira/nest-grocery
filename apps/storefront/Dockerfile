# syntax=docker/dockerfile:1
FROM node:24-alpine AS base
RUN apk add --no-cache libc6-compat
RUN npm install -g turbo pnpm@9
WORKDIR /app

FROM base AS pruner
COPY . .
RUN turbo prune storefront --docker

FROM base AS installer
COPY --from=pruner /app/out/json/ .
RUN pnpm install --frozen-lockfile

FROM installer AS dev
COPY --from=pruner /app/out/full/ .
WORKDIR /app/apps/storefront
EXPOSE 3000
CMD ["pnpm", "run", "dev"]

FROM installer AS builder
COPY --from=pruner /app/out/full/ .
# Requires next.config.js: `output: "standalone"`
RUN turbo run build --filter=storefront

FROM node:24-alpine AS runner
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=builder /app/apps/storefront/public ./apps/storefront/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/storefront/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/storefront/.next/static ./apps/storefront/.next/static
USER nextjs
EXPOSE 3000
ENV PORT=3000
CMD ["node", "apps/storefront/server.js"]