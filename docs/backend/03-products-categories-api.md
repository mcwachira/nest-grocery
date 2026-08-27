# Backend 03 — Products & Categories API (step-by-step implementation)

Prerequisite: `01-prisma-setup.md` (schema + `PrismaService`) and
`02-auth-api.md` (`JwtAuthGuard`, `RolesGuard`, `@Roles()`) both done —
every write endpoint here is admin-gated. High-level design in
`docs/02-products-and-categories.md`.

## What you're building

`GET /categories`, `POST/PATCH /categories` (admin), `GET /products`,
`GET /products/:slug`, `POST/PATCH/DELETE /products` (admin),
`POST /products/:id/images` (admin).

## Step 1 — DTOs

```typescript
// apps/api/src/products/dto/create-product.dto.ts
import { IsBoolean, IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateProductDto {
  @IsString()
  slug: string;

  @IsString()
  name: string;

  @IsString()
  description: string;

  // Client sends price in whole currency units for readability
  // (e.g. 150.00); the service layer converts to cents before hitting
  // the DB — see ProductsService.create below. Keep the conversion in
  // ONE place, not scattered across controller/service/frontend.
  @IsInt()
  @Min(0)
  priceCents: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  compareAtPriceCents?: number;

  @IsString()
  unit: string;

  @IsInt()
  @Min(0)
  stock: number;

  @IsOptional()
  @IsBoolean()
  isOrganic?: boolean;

  @IsUUID()
  categoryId: string;
}
```

```typescript
// apps/api/src/products/dto/update-product.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';

// PartialType makes every field optional for PATCH, reusing all the
// same class-validator rules — don't hand-write a second DTO with
// duplicated validation.
export class UpdateProductDto extends PartialType(CreateProductDto) {}
```

```bash
pnpm add @nestjs/mapped-types
```

```typescript
// apps/api/src/products/dto/query-products.dto.ts
import { Type } from 'class-transformer';
import { IsBoolean, IsIn, IsOptional, IsString, IsUUID } from 'class-validator';

export class QueryProductsDto {
  @IsOptional()
  @IsString()
  category?: string; // category slug

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  organic?: boolean;

  @IsOptional()
  @IsUUID()
  exclude?: string; // used by the PDP's "related products" query

  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  limit?: number = 20;
}
```

## Step 2 — `ProductsService`

```typescript
// apps/api/src/products/products.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, ProductStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';

const MAX_LIMIT = 100; // hard ceiling — never trust a client-supplied limit unbounded

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(query: QueryProductsDto) {
    const limit = Math.min(query.limit ?? 20, MAX_LIMIT);
    const page = Math.max(query.page ?? 1, 1);

    // Build the WHERE clause incrementally instead of one giant nested
    // ternary — each condition is independently readable and the type
    // (Prisma.ProductWhereInput) catches typos against the schema.
    const where: Prisma.ProductWhereInput = {
      status: ProductStatus.ACTIVE, // public endpoint — never leak DRAFT/ARCHIVED products
    };

    if (query.category) {
      where.category = { slug: query.category };
    }
    if (query.organic !== undefined) {
      where.isOrganic = query.organic;
    }
    if (query.exclude) {
      where.id = { not: query.exclude };
    }
    if (query.search) {
      // ILIKE is fine at this catalog size — see docs/02-products-and-categories.md.
      // mode:'insensitive' is Prisma's ILIKE equivalent for Postgres.
      where.name = { contains: query.search, mode: 'insensitive' };
    }

    // $transaction here isn't for atomicity — it's so both queries run
    // concurrently over the same connection instead of sequentially,
    // and so the total count and the page are consistent with each other
    // (no row could be inserted/deleted between the two calls).
    const [items, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        include: { images: true, category: true }, // avoid N+1 — see pitfalls
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: { images: { orderBy: { sortOrder: 'asc' } }, category: true },
    });
    // findUnique returns null, not a 404 — the service layer decides
    // this is a 404; a different caller (e.g. an internal admin lookup)
    // might want to handle "not found" differently.
    if (!product || product.status !== ProductStatus.ACTIVE) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  create(dto: CreateProductDto) {
    return this.prisma.product.create({ data: dto });
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.assertExists(id);
    return this.prisma.product.update({ where: { id }, data: dto });
  }

  async archive(id: string) {
    await this.assertExists(id);
    // Soft-delete, not prisma.product.delete() — see docs/02-products-and-categories.md.
    // OrderItem.productId still points here even after archiving; a hard
    // delete would either cascade-orphan order history or fail on the FK.
    return this.prisma.product.update({
      where: { id },
      data: { status: ProductStatus.ARCHIVED },
    });
  }

  private async assertExists(id: string) {
    const found = await this.prisma.product.findUnique({ where: { id } });
    if (!found) throw new NotFoundException('Product not found');
  }
}
```

## Step 3 — `CategoriesService` (short — flat list, tree built client-side)

```typescript
// apps/api/src/categories/categories.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  // Returns a FLAT list with parentId — deliberately not a nested tree
  // response. Building the tree from a flat list + parentId is a trivial
  // O(n) client-side operation (one Map pass); doing it server-side adds
  // complexity for no real benefit, and a flat list is easier to cache
  // (see scalability notes).
  findAll() {
    return this.prisma.category.findMany({ orderBy: { sortOrder: 'asc' } });
  }

  create(dto: CreateCategoryDto) {
    return this.prisma.category.create({ data: dto });
  }

  update(id: string, dto: UpdateCategoryDto) {
    return this.prisma.category.update({ where: { id }, data: dto });
  }
}
```

(`CreateCategoryDto`/`UpdateCategoryDto` follow the same
`class-validator` + `PartialType` pattern as products — `name`, `slug`,
optional `parentId`/`description`/`imageUrl`/`sortOrder`.)

## Step 4 — controllers

```typescript
// apps/api/src/products/products.controller.ts
import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('products')
export class ProductsController {
  constructor(private readonly products: ProductsService) {}

  // --- public routes: no guard at all ---

  @Get()
  findMany(@Query() query: QueryProductsDto) {
    return this.products.findMany(query);
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.products.findBySlug(slug);
  }

  // --- admin-only routes ---

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.products.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.products.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  archive(@Param('id') id: string) {
    return this.products.archive(id);
  }
}
```

`CategoriesController` mirrors this exactly (public `GET /categories`,
admin-gated `POST`/`PATCH`) — omitted here since it's a direct copy of the
pattern above with `CategoriesService`.

## Step 5 — image upload

```bash
pnpm add multer
pnpm add -D @types/multer
```

```typescript
// apps/api/src/products/products.controller.ts (addition)
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadedFile, UseInterceptors } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname } from 'path';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Post(':id/images')
@UseInterceptors(
  FileInterceptor('file', {
    // Local disk in dev — see docs/02-products-and-categories.md for why
    // production should point this at S3/R2 instead (swap this
    // diskStorage config for a multer-s3 storage engine when you get
    // there; the controller/service code above it doesn't need to change).
    storage: diskStorage({
      destination: './uploads/products',
      filename: (_req, file, cb) => {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${unique}${extname(file.originalname)}`);
      },
    }),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB — reject oversized uploads at the multer layer, not after they've hit disk
    fileFilter: (_req, file, cb) => {
      // Never trust the client Content-Type header alone for anything
      // security-sensitive, but for a v1 admin-only upload this mimetype
      // check plus the size limit is a reasonable bar — a stricter
      // magic-byte check is a good later hardening step, not a v1 blocker.
      if (!file.mimetype.match(/^image\/(jpeg|png|webp)$/)) {
        return cb(new Error('Only JPEG/PNG/WEBP images are allowed'), false);
      }
      cb(null, true);
    },
  }),
)
uploadImage(@Param('id') productId: string, @UploadedFile() file: Express.Multer.File) {
  return this.products.addImage(productId, `/uploads/products/${file.filename}`);
}
```

```typescript
// apps/api/src/products/products.service.ts (addition)
addImage(productId: string, url: string) {
  return this.prisma.productImage.create({ data: { productId, url } });
}
```

Serve the `uploads/` directory statically in dev
(`app.useStaticAssets(join(__dirname, '..', 'uploads'), { prefix: '/uploads' })`
in `main.ts`, via `@nestjs/serve-static` or Express's built-in static
middleware) — in production, skip this entirely once you've moved to
S3/R2, since the object storage provider serves the file directly.

## Step 6 — `ProductsModule` / `CategoriesModule`

```typescript
// apps/api/src/products/products.module.ts
import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService], // cart (04) and checkout (05) both need this
})
export class ProductsModule {}
```

Register both in `AppModule`'s `imports`.

## Testing it

```bash
curl http://localhost:4000/products
curl http://localhost:4000/products?organic=true&category=leafy-greens
curl http://localhost:4000/products/chinese-cabbage

# admin write — use the accessToken from 02-auth-api.md's admin test user
curl -X POST http://localhost:4000/products \
  -H "Authorization: Bearer <adminAccessToken>" \
  -H 'Content-Type: application/json' \
  -d '{"slug":"kale","name":"Kale","description":"Fresh kale","priceCents":12000,"unit":"bunch","stock":30,"categoryId":"<uuid>"}'
```

## Pitfalls specific to this exact stack

- **N+1 is the single easiest mistake here.** `findMany` without
  `include: { images, category }` returns products with no image/category
  data unless you separately query per-product — turn on Prisma query
  logging (`new PrismaClient({ log: ['query'] })`) while testing
  `GET /products` and confirm you see **one** query, not one-plus-N.
- **`transform: true` on the global `ValidationPipe`** (set in
  `02-auth-api.md`) is what makes `?organic=true` arrive as a real
  boolean and `?page=2` arrive as a real number in `QueryProductsDto` —
  without it, every query param arrives as a string and your `@IsBoolean()`/
  `@IsInt()` decorators reject valid requests. If query filtering
  mysteriously 400s, this is the first thing to check.
- **Never let `DELETE /products/:id` actually delete a row** once any
  order references it — this is why `archive()` is a status update, not
  `prisma.product.delete()`. If you build this the "obvious" way first,
  you'll hit a foreign-key constraint error the moment `06-orders-api.md`
  exists and a product referenced by an order gets deleted.
- **`class-validator`'s `@IsUUID()` on `categoryId`** will reject a
  malformed id with a clear 400 before it ever reaches Prisma — better to
  catch it there than let Prisma throw a less readable database-level
  error.

## Scalability notes

- **Cache `GET /products` and `GET /categories` in Redis** once you have
  read traffic worth caching (you already have Redis provisioned for
  `04-cart.md`). Cache key = serialized query params, short TTL (e.g. 60s)
  or explicit invalidation on every admin write (`create`/`update`/`archive`
  call `redis.del()` for affected keys, or just flush a `products:*`
  key pattern — simpler and fine at this catalog size). Don't build this
  until you've actually noticed product listing latency matters; premature
  caching adds invalidation bugs for no measured benefit.
- **Full-text search**: `ILIKE '%term%'` can't use a btree index
  efficiently (it's a leading-wildcard scan) and will degrade as the
  catalog grows past a few thousand rows. The next step, in order, is
  Postgres's own `tsvector` + GIN index (`ALTER TABLE products ADD COLUMN search_vector tsvector`,
  populate via a trigger or on write, `@@` query it) — not Elasticsearch/
  Algolia, which is real infra overhead this catalog size doesn't justify.
- **Pagination**: offset-based (`skip`/`take`) is fine here and is what's
  built above — it gets measurably slower on very deep pages (`skip: 50000`)
  because Postgres still has to walk past every skipped row. Cursor-based
  pagination (`where: { id: { gt: lastSeenId } }`) fixes that but adds API
  surface complexity; don't add it until an actual admin/customer use case
  needs to page that deep (unlikely for a grocery catalog or a single
  user's order history).
- **The `MAX_LIMIT` ceiling in `ProductsService`** exists specifically so
  a client can't request `?limit=1000000` and force one query to load the
  entire catalog into memory — a small guard, but exactly the kind of
  thing that matters once this API isn't just you calling it from `curl`.

## Done looks like

Same checklist as `docs/02-products-and-categories.md`'s "What done looks
like" — verify against it there.
