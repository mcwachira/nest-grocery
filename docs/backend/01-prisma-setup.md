# Backend 01 — Prisma ORM Setup

Do this before touching any feature guide (`02`–`06`) — every one of them
assumes this is done. This doc gets you from "no ORM installed" (the
current state of `apps/api`) to a working `PrismaService` injectable
anywhere in the app, a full schema matching `00-database-design.md`, and a
seed script with real data.

## Why Prisma over TypeORM (quick recap)

Full reasoning in `docs/09-shared-packages.md`. Short version for a
learning project: one readable `schema.prisma` file beats scattered
decorator classes when you're holding the whole data model in your head
solo, `prisma migrate dev` generates real reviewable SQL with minimal
ceremony, and generated types flow into NestJS DTOs without extra
boilerplate.

## Step 1 — install

```bash
cd apps/api
pnpm add @prisma/client
pnpm add -D prisma
```

```bash
pnpm exec prisma init --datasource-provider postgresql
```

This creates `apps/api/prisma/schema.prisma` and adds `DATABASE_URL` to
`apps/api/.env` (you already have `DATABASE_URL` in the root `.env.example`
— the Prisma CLI reads `apps/api/.env` specifically when run from
`apps/api`, so either symlink/copy it or set `env` explicitly; simplest is
to add a `apps/api/.env` that just points at the same Postgres instance
`docker-local.yml` runs).

## Step 2 — the schema

Replace the generated `apps/api/prisma/schema.prisma` with the full schema
below. This matches every table in `00-database-design.md` exactly — refer
back there for *why* each field/index exists; this file is the *what*.

```prisma
// apps/api/prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ---------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------

enum Role {
  CUSTOMER
  ADMIN
}

enum ProductStatus {
  DRAFT
  ACTIVE
  ARCHIVED
}

enum OrderStatus {
  PENDING_PAYMENT
  PAID
  PROCESSING
  FULFILLED
  OUT_FOR_DELIVERY
  DELIVERED
  CANCELLED
}

enum PaymentProvider {
  STRIPE
  COD
}

// ---------------------------------------------------------------------
// Auth domain — see docs/backend/02-auth-api.md
// ---------------------------------------------------------------------

model User {
  id              String    @id @default(uuid())
  email           String    @unique
  passwordHash    String
  firstName       String
  lastName        String
  phone           String?
  role            Role      @default(CUSTOMER)
  emailVerifiedAt DateTime?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  addresses     Address[]
  refreshTokens RefreshToken[]
  resetTokens   PasswordResetToken[]
  orders        Order[]

  @@map("users")
}

model Address {
  id         String   @id @default(uuid())
  userId     String
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  label      String?
  line1      String
  line2      String?
  city       String
  region     String
  postalCode String?
  country    String   @default("KE")
  isDefault  Boolean  @default(false)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@index([userId])
  @@map("addresses")
}

model RefreshToken {
  id                String    @id @default(uuid())
  userId            String
  user              User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  tokenHash         String    @unique
  expiresAt         DateTime
  revokedAt         DateTime?
  replacedByTokenId String?
  createdAt         DateTime  @default(now())

  @@index([userId])
  @@map("refresh_tokens")
}

model PasswordResetToken {
  id        String    @id @default(uuid())
  userId    String
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  tokenHash String    @unique
  expiresAt DateTime
  usedAt    DateTime?
  createdAt DateTime  @default(now())

  @@index([userId])
  @@map("password_reset_tokens")
}

// ---------------------------------------------------------------------
// Catalog domain — see docs/backend/03-products-categories-api.md
// ---------------------------------------------------------------------

model Category {
  id          String     @id @default(uuid())
  name        String
  slug        String     @unique
  parentId    String?
  // self-relation: adjacency list, not nested-set — see 00-database-design.md
  parent      Category?  @relation("CategoryToCategory", fields: [parentId], references: [id], onDelete: SetNull)
  children    Category[] @relation("CategoryToCategory")
  description String?
  imageUrl    String?
  sortOrder   Int        @default(0)
  products    Product[]
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  @@index([parentId])
  @@map("categories")
}

model Product {
  id                  String         @id @default(uuid())
  slug                String         @unique
  name                String
  description         String
  priceCents          Int
  compareAtPriceCents Int?
  currency            String         @default("KES")
  unit                String
  stock               Int            @default(0)
  sku                 String?        @unique
  isOrganic           Boolean        @default(false)
  status              ProductStatus  @default(DRAFT)
  categoryId          String
  category            Category       @relation(fields: [categoryId], references: [id])
  images              ProductImage[]
  orderItems          OrderItem[]
  createdAt           DateTime       @default(now())
  updatedAt           DateTime       @updatedAt

  @@index([categoryId])
  @@index([status])
  @@map("products")
}

model ProductImage {
  id        String  @id @default(uuid())
  productId String
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  url       String
  altText   String?
  sortOrder Int     @default(0)

  @@index([productId])
  @@map("product_images")
}

// ---------------------------------------------------------------------
// Orders domain — see docs/backend/05-checkout-payments-api.md
// and docs/backend/06-orders-api.md
// ---------------------------------------------------------------------

model Order {
  id     String @id @default(uuid())
  userId String
  user   User   @relation(fields: [userId], references: [id])

  status           OrderStatus @default(PENDING_PAYMENT)
  totalCents       Int
  deliveryFeeCents Int
  currency         String      @default("KES")

  // Shipping address SNAPSHOT — intentionally not a foreign key.
  // If the user edits/deletes the Address row later, this order must
  // still show exactly what was shipped where at the time. See
  // 00-database-design.md "Conventions".
  shippingLine1      String
  shippingLine2      String?
  shippingCity       String
  shippingRegion     String
  shippingPostalCode String?
  shippingCountry    String

  paymentProvider  PaymentProvider
  paymentReference String? // Stripe PaymentIntent id; null for COD

  placedAt    DateTime  @default(now())
  paidAt      DateTime?
  fulfilledAt DateTime?
  deliveredAt DateTime?
  cancelledAt DateTime?

  items     OrderItem[]
  createdAt DateTime    @default(now())
  updatedAt DateTime    @updatedAt

  @@index([userId])
  @@index([status])
  @@map("orders")
}

model OrderItem {
  id      String @id @default(uuid())
  orderId String
  order   Order  @relation(fields: [orderId], references: [id], onDelete: Cascade)

  productId String
  product   Product @relation(fields: [productId], references: [id])

  // Snapshot at time of order — never re-read from Product for display.
  productName    String
  unitPriceCents Int
  quantity       Int
  subtotalCents  Int

  @@index([orderId])
  @@map("order_items")
}
```

## Step 3 — first migration

```bash
pnpm exec prisma migrate dev --name init
```

This creates `apps/api/prisma/migrations/<timestamp>_init/migration.sql`
(real, readable SQL — open it and read it once, so you know what Prisma
actually does under the hood) and applies it to your local Postgres
(`docker-local.yml`'s `postgres` service must be running — `make dev`
starts it).

Every schema change from here on: edit `schema.prisma`, run
`prisma migrate dev --name <description>` again. Never hand-edit a
generated migration file after it's been applied — if you need to change
something you already migrated, write a *new* migration, the same way
you'd never `git commit --amend` a commit someone already pulled.

## Step 4 — `PrismaService` / `PrismaModule` (the NestJS integration pattern)

This is the standard pattern — one service wrapping `PrismaClient`,
injected everywhere via one global module, rather than instantiating
`PrismaClient` per-module.

```typescript
// apps/api/src/prisma/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

// Extending PrismaClient (rather than wrapping it as a property) means
// every model method (this.user.findUnique, this.product.create, ...)
// is available directly on the injected service — no extra indirection.
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    // Connect explicitly at app startup instead of lazily on first query —
    // this way a bad DATABASE_URL fails fast at boot, not on the first
    // request a real user makes.
    await this.$connect();
  }

  async onModuleDestroy() {
    // Release the connection cleanly on shutdown (relevant for graceful
    // container restarts in docker-production.yml).
    await this.$disconnect();
  }
}
```

```typescript
// apps/api/src/prisma/prisma.module.ts
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

// @Global() means every feature module (AuthModule, ProductsModule, ...)
// can inject PrismaService without each one importing PrismaModule
// individually — appropriate here because literally everything needs DB
// access. Don't reach for @Global() for anything less universal than this.
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

```typescript
// apps/api/src/app.module.ts
import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule /* , other feature modules as you build them */],
})
export class AppModule {}
```

Usage in any feature service (example, don't build this file yet — it's
here to show the pattern `02`–`06` all reuse):

```typescript
// apps/api/src/products/products.service.ts (preview — see 03-products-categories-api.md)
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  findBySlug(slug: string) {
    return this.prisma.product.findUnique({
      where: { slug },
      include: { images: true, category: true }, // avoid N+1 — see pitfalls below
    });
  }
}
```

## Step 5 — seed script

```typescript
// apps/api/prisma/seed.ts
import { PrismaClient, ProductStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // --- one admin account so you can log into apps/admin from day one ---
  const adminPasswordHash = await bcrypt.hash('ChangeMe123!', 10);
  await prisma.user.upsert({
    where: { email: 'admin@nest-grocery.local' },
    update: {},
    create: {
      email: 'admin@nest-grocery.local',
      passwordHash: adminPasswordHash,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
    },
  });

  // --- categories, ported from apps/storefront/src/lib/data.ts's 8 mock
  //     categories so the seeded catalog matches what the UI already
  //     expects to render ---
  const produce = await prisma.category.upsert({
    where: { slug: 'produce' },
    update: {},
    create: { name: 'Produce', slug: 'produce', sortOrder: 1 },
  });

  const leafyGreens = await prisma.category.upsert({
    where: { slug: 'leafy-greens' },
    update: {},
    create: {
      name: 'Leafy Greens',
      slug: 'leafy-greens',
      parentId: produce.id, // nested under Produce — proves the adjacency list works
      sortOrder: 1,
    },
  });

  // --- a handful of real products, ported from the same mock file ---
  await prisma.product.upsert({
    where: { slug: 'chinese-cabbage' },
    update: {},
    create: {
      slug: 'chinese-cabbage',
      name: 'Chinese Cabbage',
      description: 'Fresh, locally grown Chinese cabbage.',
      priceCents: 15000, // 150.00 — always cents, see 00-database-design.md
      currency: 'KES',
      unit: 'kg',
      stock: 42,
      isOrganic: true,
      status: ProductStatus.ACTIVE,
      categoryId: leafyGreens.id,
      images: {
        create: [{ url: 'https://placehold.co/600x400', sortOrder: 0 }],
      },
    },
  });

  // Add the remaining ~25 products from src/lib/data.ts the same way —
  // this seed is deliberately shown short; port the rest as a mechanical
  // step once this pattern is proven working.
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Wire it into `package.json` so `prisma db seed` (and `prisma migrate reset`,
which auto-seeds) picks it up:

```json
// apps/api/package.json — add this top-level key
"prisma": {
  "seed": "ts-node prisma/seed.ts"
}
```

```bash
pnpm add -D ts-node
pnpm exec prisma db seed
```

## Common pitfalls specific to this stack

- **N+1 queries** — Prisma won't warn you. `prisma.product.findMany()`
  followed by a per-product `prisma.productImage.findMany({ where: { productId }})`
  in a loop is N+1. Always reach for `include`/`select` to fetch relations
  in the same query (as in the `ProductsService` example above). Turn on
  `log: ['query']` in `PrismaClient` construction during development and
  actually watch the query log for a list endpoint — seeing 20 queries
  fire for one `GET /products` call is the fastest way to internalize this.
- **Migrations in CI/prod are `migrate deploy`, not `migrate dev`.**
  `migrate dev` is interactive and can prompt to reset your DB on drift —
  never run it against a database with real data. Production deploys
  (`docker-production.yml`) should run `prisma migrate deploy` as a
  release step, which only applies pending migrations non-interactively.
- **Enum changes are migrations, not free.** Adding a value to
  `OrderStatus` is safe (additive), but removing/renaming one requires a
  data migration for any existing rows using it — think about this before
  renaming an enum value casually once you have real orders.
- **`onDelete` behavior is easy to get backwards.** `Category.parent` uses
  `SetNull` (orphan children on parent delete) while `Address.user` and
  `RefreshToken.user` use `Cascade` (delete auth artifacts when a user is
  deleted). Get this wrong and you either cascade-delete something you
  meant to preserve, or leave orphaned rows with dangling FKs. Re-check
  `00-database-design.md`'s table before adding a new relation.

## What "done" looks like

- `pnpm exec prisma studio` (Prisma's built-in DB browser, run it — it's
  genuinely useful for a solo project) shows every table from
  `00-database-design.md` with the seeded rows.
- `PrismaService` is injectable in any module without importing
  `PrismaModule` per-feature.
- `prisma migrate dev` and `prisma db seed` both run cleanly against
  `docker-local.yml`'s Postgres service.
