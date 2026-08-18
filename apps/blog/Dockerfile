# syntax=docker/dockerfile:1
FROM node:24-alpine AS base
RUN npm install -g turbo pnpm@9
WORKDIR /app

FROM base AS pruner
COPY . .
RUN turbo prune blog --docker

FROM base AS installer
COPY --from=pruner /app/out/json/ .
RUN pnpm install --frozen-lockfile

FROM installer AS dev
COPY --from=pruner /app/out/full/ .
WORKDIR /app/apps/blog
EXPOSE 3000
CMD ["pnpm", "run", "dev"]

FROM installer AS builder
COPY --from=pruner /app/out/full/ .
RUN turbo run build --filter=blog

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
CMD ["pnpm", "run", "start"]