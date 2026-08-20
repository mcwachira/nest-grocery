# Makefile
# Shortcuts for the commands used throughout local dev, CI, and prod.
# Run `make` or `make help` to see this list.

.DEFAULT_GOAL := help
.PHONY: help install env \
        dev up down down-v restart logs ps build-images \
        lint typecheck test build check \
        prod-up prod-down prod-logs prod-pull prod-restart \
        shell-api shell-storefront shell-admin shell-blog \
        db-shell redis-cli \
        docker-build-api docker-build-storefront docker-build-admin docker-build-blog docker-build-all \
        clean prune

# ---------------------------------------------------------------------------
# Setup
# ---------------------------------------------------------------------------

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

install: ## Install all workspace dependencies (pnpm)
	pnpm install --frozen-lockfile

env: ## Create .env from .env.example if it doesn't exist yet
	@test -f .env || (cp .env.example .env && echo "Created .env — fill in real values before running make dev")

# ---------------------------------------------------------------------------
# Local dev (docker-local.yml): postgres, redis, mailhog, all 4 apps, nginx
# ---------------------------------------------------------------------------

dev: env ## Build and start the full local stack (docker-local.yml)
	docker compose -f docker-local.yml up --build

up: env ## Start the local stack without rebuilding
	docker compose -f docker-local.yml up -d

down: ## Stop the local stack (keeps volumes: postgres/redis data)
	docker compose -f docker-local.yml down

down-v: ## Stop the local stack AND wipe volumes (fresh postgres/redis)
	docker compose -f docker-local.yml down -v

restart: down up ## Restart the local stack

logs: ## Tail logs from every local service
	docker compose -f docker-local.yml logs -f

ps: ## Show status of local containers
	docker compose -f docker-local.yml ps

# ---------------------------------------------------------------------------
# Turbo tasks (run on host, not in containers — fast, uses local pnpm)
# ---------------------------------------------------------------------------

lint: ## Run eslint across the monorepo
	pnpm turbo run lint

typecheck: ## Run tsc --noEmit across the monorepo (storefront excluded, known debt)
	pnpm turbo run check-types --filter=!storefront

test: ## Run tests across the monorepo
	pnpm turbo run test

build: ## Build every app (turbo)
	pnpm turbo run build

check: lint typecheck test ## Run lint + typecheck + test together (mirrors CI, minus storefront types)

# ---------------------------------------------------------------------------
# Production (docker-production.yml): pulls prebuilt GHCR images
# ---------------------------------------------------------------------------

prod-up: ## Start the production stack (pulls images, detached)
	docker compose -f docker-production.yml pull
	docker compose -f docker-production.yml up -d --remove-orphans

prod-down: ## Stop the production stack
	docker compose -f docker-production.yml down

prod-logs: ## Tail logs from the production stack
	docker compose -f docker-production.yml logs -f

prod-pull: ## Pull latest images without restarting
	docker compose -f docker-production.yml pull

prod-restart: prod-down prod-up ## Restart the production stack

# ---------------------------------------------------------------------------
# Debug shells — drop into a running local container
# ---------------------------------------------------------------------------

shell-api: ## Open a shell in the running api container
	docker compose -f docker-local.yml exec api sh

shell-storefront: ## Open a shell in the running storefront container
	docker compose -f docker-local.yml exec storefront sh

shell-admin: ## Open a shell in the running admin container
	docker compose -f docker-local.yml exec admin sh

shell-blog: ## Open a shell in the running blog container
	docker compose -f docker-local.yml exec blog sh

db-shell: ## Open a psql shell in the local postgres container
	docker compose -f docker-local.yml exec postgres psql -U $${POSTGRES_USER:-postgres} -d $${POSTGRES_DB:-nest_grocery}

redis-cli: ## Open a redis-cli shell in the local redis container
	docker compose -f docker-local.yml exec redis redis-cli -a $${REDIS_PASSWORD:-redispass}

# ---------------------------------------------------------------------------
# Sanity-build individual prod images (mirrors CI's docker-build-check job)
# ---------------------------------------------------------------------------

docker-build-api: ## Build the api production image locally (no push)
	docker build -f apps/api/Dockerfile --target runner -t nest-grocery-api:local .

docker-build-storefront: ## Build the storefront production image locally (no push)
	docker build -f apps/storefront/Dockerfile --target runner -t nest-grocery-storefront:local .

docker-build-admin: ## Build the admin production image locally (no push)
	docker build -f apps/admin/Dockerfile --target runner -t nest-grocery-admin:local .

docker-build-blog: ## Build the blog production image locally (no push)
	docker build -f apps/blog/Dockerfile --target runner -t nest-grocery-blog:local .

docker-build-all: docker-build-api docker-build-storefront docker-build-admin docker-build-blog ## Build all 4 production images locally

# ---------------------------------------------------------------------------
# Cleanup
# ---------------------------------------------------------------------------

clean: ## Remove node_modules, turbo cache, and build outputs everywhere
	rm -rf node_modules apps/*/node_modules packages/*/node_modules
	rm -rf .turbo apps/*/.turbo
	rm -rf apps/*/dist apps/*/build apps/*/.next apps/storefront/.next

prune: ## Remove dangling docker images/containers/volumes (careful: repo-wide docker cleanup)
	docker system prune -f