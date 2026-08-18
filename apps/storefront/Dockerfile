# apps/storefront/Dockerfile
# Next.js customer-facing storefront.
#
# IMPORTANT: this Dockerfile assumes next.config.ts has:
#     export default { output: "standalone", ... }
# That mode makes Next.js emit a minimal self-contained server in
# .next/standalone, which is what makes the tiny "runner" stage possible.
# If output: "standalone" isn't set yet, add it before building the
# "runner" target — otherwise .next/standalone won't exist.

# syntax=docker/dockerfile:1

FROM node:24-alpine AS base
RUN apk add --no-cache libc6-compat
RUN npm install -g turbo pnpm@9
WORKDIR /app

# -----------------------------------------------------------------------
# 1) pruner — isolate just what "storefront" needs from the monorepo
# -----------------------------------------------------------------------
FROM base AS pruner
COPY . .
RUN turbo prune storefront --docker

# -----------------------------------------------------------------------
# 2) installer — install pruned dependencies (cached until they change)
# -----------------------------------------------------------------------
FROM base AS installer
COPY --from=pruner /app/out/json/ .
RUN pnpm install --frozen-lockfile

# -----------------------------------------------------------------------
# 3) dev — hot-reload target used by docker-compose.yml
# -----------------------------------------------------------------------
FROM installer AS dev
COPY --from=pruner /app/out/full/ .
WORKDIR /app/apps/storefront
EXPOSE 3000
CMD ["pnpm", "run", "dev"]

# -----------------------------------------------------------------------
# 4) builder — production build (needs output: "standalone", see above)
# -----------------------------------------------------------------------
FROM installer AS builder
COPY --from=pruner /app/out/full/ .
RUN turbo run build --filter=storefront

# -----------------------------------------------------------------------
# 5) runner — copies only the standalone server output, nothing else.
#    This is dramatically smaller than shipping node_modules + full .next
# -----------------------------------------------------------------------
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
