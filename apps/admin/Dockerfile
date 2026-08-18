# syntax=docker/dockerfile:1
FROM node:24-alpine AS base
RUN npm install -g turbo pnpm@9
WORKDIR /app

FROM base AS pruner
COPY . .
RUN turbo prune admin --docker

FROM base AS installer
COPY --from=pruner /app/out/json/ .
RUN pnpm install --frozen-lockfile

FROM installer AS dev
COPY --from=pruner /app/out/full/ .
WORKDIR /app/apps/admin
EXPOSE 5173
CMD ["pnpm", "run", "dev", "--", "--host"]

FROM installer AS builder
COPY --from=pruner /app/out/full/ .
RUN turbo run build --filter=admin

# Vite output is static — served by its own tiny nginx, proxied to by the main nginx
FROM nginx:1.27-alpine AS runner
COPY --from=builder /app/apps/admin/dist /usr/share/nginx/html
COPY nginx/spa.conf /etc/nginx/conf.d/default.conf
EXPOSE 80