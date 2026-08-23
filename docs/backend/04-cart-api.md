# Backend 04 — Cart API (step-by-step implementation)

Prerequisite: `02-auth-api.md` (optional-auth pattern used here) and
`03-products-categories-api.md` (`ProductsService`, for price/stock
resolution) both done. High-level design/decision (Redis-only, no
Postgres cart table) in `docs/04-cart.md`.

## What you're building

`GET /cart`, `POST /cart/items`, `PATCH /cart/items/:productId`,
`DELETE /cart/items/:productId`, `DELETE /cart`, `POST /cart/merge`.

## Step 1 — install and configure `ioredis`

```bash
pnpm add ioredis
```

```typescript
// apps/api/src/redis/redis.module.ts
import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export const REDIS_CLIENT = 'REDIS_CLIENT';

@Global() // same reasoning as PrismaModule — cart is far from the only
          // future consumer of Redis (sessions, caching in 03, rate
          // limiting), so make the client available everywhere once.
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [ConfigService],
      // ONE shared ioredis client via DI, not `new Redis()` per request —
      // ioredis manages its own connection pool internally; creating a
      // fresh client per request would exhaust connections under load
      // for no benefit. This is the single most common Redis-in-NestJS
      // mistake to avoid.
      useFactory: (config: ConfigService) => new Redis(config.get('REDIS_URL')),
    },
  ],
  exports: [REDIS_CLIENT],
})
export class RedisModule {}
```

Register `RedisModule` in `AppModule`'s `imports`.

## Step 2 — cart key design + value shape

```typescript
// apps/api/src/cart/cart.constants.ts
export const CART_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days, refreshed on every write

export function cartKeyForUser(userId: string) {
  return `cart:${userId}`;
}
export function cartKeyForGuest(guestId: string) {
  return `cart:guest:${guestId}`;
}

export interface CartItemRecord {
  productId: string;
  quantity: number;
}
export interface CartRecord {
  items: CartItemRecord[];
  updatedAt: string;
}
```

## Step 3 — "who is this cart for" resolution (custom, not `JwtAuthGuard`)

```typescript
// apps/api/src/cart/cart-identity.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request, Response } from 'express';
import { randomUUID } from 'crypto';

const GUEST_COOKIE = 'guest_cart_id';

export interface CartIdentity {
  key: string; // the resolved cart:* redis key
  isGuest: boolean;
  guestId?: string;
}

// A custom param decorator (not a guard) because cart access is
// deliberately NOT all-or-nothing like JwtAuthGuard — an unauthenticated
// request is a valid guest cart request, not a 401. This decorator reads
// req.user if JwtAuthGuard already ran optionally upstream, otherwise
// falls back to reading/setting a guest cookie.
export const CartId = createParamDecorator((_: unknown, ctx: ExecutionContext): CartIdentity => {
  const req = ctx.switchToHttp().getRequest<Request>();
  const res = ctx.switchToHttp().getResponse<Response>();

  const user = (req as any).user as { userId: string } | undefined;
  if (user) {
    return { key: `cart:${user.userId}`, isGuest: false };
  }

  let guestId = req.cookies?.[GUEST_COOKIE];
  if (!guestId) {
    guestId = randomUUID();
    // NOT httpOnly — the frontend needs to read this to pass it to
    // /cart/merge after login. This is a different trust boundary than
    // the auth refresh cookie in 02-auth-api.md, which IS httpOnly —
    // don't reuse cookie logic between the two. See docs/04-cart.md's
    // pitfalls.
    res.cookie(GUEST_COOKIE, guestId, {
      httpOnly: false,
      maxAge: 30 * 24 * 60 * 60 * 1000,
      sameSite: 'lax',
    });
  }
  return { key: `cart:guest:${guestId}`, isGuest: true, guestId };
});
```

For "optional JWT" (attach `req.user` if a valid access token is present,
but never reject the request if it's missing), add a small
`OptionalJwtAuthGuard` that wraps `JwtAuthGuard` and overrides
`handleRequest` to swallow errors:

```typescript
// apps/api/src/auth/guards/optional-jwt-auth.guard.ts
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  // Default AuthGuard throws on missing/invalid token; overriding
  // handleRequest to just return the user-or-undefined instead makes
  // auth optional for this one guard without touching JwtStrategy.
  handleRequest(_err: any, user: any) {
    return user; // undefined if no/invalid token — never throws here
  }
}
```

## Step 4 — `CartService`

```typescript
// apps/api/src/cart/cart.service.ts
import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from '../redis/redis.module';
import { ProductsService } from '../products/products.service';
import { CART_TTL_SECONDS, CartRecord } from './cart.constants';

@Injectable()
export class CartService {
  constructor(
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    private readonly products: ProductsService,
  ) {}

  async getCart(key: string) {
    const raw = await this.redis.get(key);
    const record: CartRecord = raw ? JSON.parse(raw) : { items: [], updatedAt: new Date().toISOString() };
    return this.hydrate(record);
  }

  async addItem(key: string, productId: string, quantity: number) {
    const record = await this.readRaw(key);
    const existing = record.items.find((i) => i.productId === productId);

    // Re-validate stock server-side on every write — the frontend showing
    // "in stock" is not enough, per docs/04-cart.md. The client can send
    // any quantity it wants; only the API's view of current stock counts.
    const product = await this.products.findByIdOrThrow(productId);
    const newQuantity = (existing?.quantity ?? 0) + quantity;
    if (newQuantity > product.stock) {
      throw new BadRequestException(`Only ${product.stock} in stock`);
    }

    if (existing) {
      existing.quantity = newQuantity;
    } else {
      record.items.push({ productId, quantity });
    }
    await this.writeRaw(key, record);
    return this.hydrate(record);
  }

  async setItemQuantity(key: string, productId: string, quantity: number) {
    const record = await this.readRaw(key);
    if (quantity <= 0) {
      record.items = record.items.filter((i) => i.productId !== productId);
    } else {
      const product = await this.products.findByIdOrThrow(productId);
      if (quantity > product.stock) {
        throw new BadRequestException(`Only ${product.stock} in stock`);
      }
      const existing = record.items.find((i) => i.productId === productId);
      if (existing) existing.quantity = quantity;
      else record.items.push({ productId, quantity });
    }
    await this.writeRaw(key, record);
    return this.hydrate(record);
  }

  async removeItem(key: string, productId: string) {
    return this.setItemQuantity(key, productId, 0);
  }

  async clear(key: string) {
    await this.redis.del(key);
  }

  async merge(guestKey: string, userKey: string) {
    const guestRecord = await this.readRaw(guestKey);
    if (guestRecord.items.length === 0) return this.getCart(userKey);

    const userRecord = await this.readRaw(userKey);
    for (const guestItem of guestRecord.items) {
      const existing = userRecord.items.find((i) => i.productId === guestItem.productId);
      if (existing) existing.quantity += guestItem.quantity; // sum overlapping quantities, per docs/04-cart.md
      else userRecord.items.push(guestItem);
    }

    await this.writeRaw(userKey, userRecord);
    await this.redis.del(guestKey); // guest cart is fully consumed
    return this.hydrate(userRecord);
  }

  // --- internals ---

  private async readRaw(key: string): Promise<CartRecord> {
    const raw = await this.redis.get(key);
    return raw ? JSON.parse(raw) : { items: [], updatedAt: new Date().toISOString() };
  }

  private async writeRaw(key: string, record: CartRecord) {
    record.updatedAt = new Date().toISOString();
    // EX refreshes the TTL on every write — an actively-used cart never
    // expires mid-session; an abandoned one cleans itself up after 30
    // days with zero cron job needed. This is the main reason Redis was
    // chosen over a Postgres table in docs/04-cart.md.
    await this.redis.set(key, JSON.stringify(record), 'EX', CART_TTL_SECONDS);
  }

  // Resolves current price/name/image/stock from Product for every item —
  // the cart record itself only ever stores {productId, quantity}. This
  // is what guarantees cart totals never reflect a stale price. See
  // docs/04-cart.md.
  private async hydrate(record: CartRecord) {
    const items = await Promise.all(
      record.items.map(async (item) => {
        const product = await this.products.findByIdOrThrow(item.productId);
        return {
          productId: item.productId,
          quantity: item.quantity,
          name: product.name,
          priceCents: product.priceCents,
          image: product.images[0]?.url ?? null,
          subtotalCents: product.priceCents * item.quantity,
          inStock: product.stock >= item.quantity,
        };
      }),
    );
    const totalCents = items.reduce((sum, i) => sum + i.subtotalCents, 0);
    return { items, totalCents, updatedAt: record.updatedAt };
  }
}
```

Add `findByIdOrThrow` to `ProductsService` (a one-line
`findUniqueOrThrow`-based lookup) alongside the existing `findBySlug`.

## Step 5 — controller

```typescript
// apps/api/src/cart/cart.controller.ts
import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { IsInt, IsUUID, Min } from 'class-validator';
import { CartService } from './cart.service';
import { CartId, CartIdentity } from './cart-identity.decorator';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

class AddItemDto {
  @IsUUID() productId: string;
  @IsInt() @Min(1) quantity: number;
}
class SetQuantityDto {
  @IsInt() @Min(0) quantity: number;
}

// OptionalJwtAuthGuard runs on every route here so req.user is populated
// WHEN a valid token is present, without ever rejecting an anonymous
// request — see Step 3.
@UseGuards(OptionalJwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private readonly cart: CartService) {}

  @Get()
  get(@CartId() identity: CartIdentity) {
    return this.cart.getCart(identity.key);
  }

  @Post('items')
  add(@CartId() identity: CartIdentity, @Body() dto: AddItemDto) {
    return this.cart.addItem(identity.key, dto.productId, dto.quantity);
  }

  @Patch('items/:productId')
  setQuantity(
    @CartId() identity: CartIdentity,
    @Param('productId') productId: string,
    @Body() dto: SetQuantityDto,
  ) {
    return this.cart.setItemQuantity(identity.key, productId, dto.quantity);
  }

  @Delete('items/:productId')
  remove(@CartId() identity: CartIdentity, @Param('productId') productId: string) {
    return this.cart.removeItem(identity.key, productId);
  }

  @Delete()
  clear(@CartId() identity: CartIdentity) {
    return this.cart.clear(identity.key);
  }

  // Requires a REAL logged-in user (unlike every other route above) —
  // merging only makes sense right after a successful login, so this one
  // route uses the strict JwtAuthGuard instead of the optional one.
  @UseGuards(JwtAuthGuard)
  @Post('merge')
  merge(@CartId() identity: CartIdentity, @Param() _: unknown) {
    // identity.key here is the USER's key (JwtAuthGuard ran, so CartId
    // resolves req.user first) — the guest key comes from the request's
    // guest cookie directly, read again since CartId only returns one
    // resolved key at a time.
    return this.cart.getCart(identity.key); // placeholder — see note below
  }
}
```

The `merge` endpoint needs both keys simultaneously, which the single
`@CartId()` decorator doesn't give you — read the guest cookie directly in
the controller instead:

```typescript
// apps/api/src/cart/cart.controller.ts (merge, corrected)
import type { Request } from 'express';
import { Req } from '@nestjs/common';

@UseGuards(JwtAuthGuard)
@Post('merge')
merge(@CartId() identity: CartIdentity, @Req() req: Request) {
  const guestId = req.cookies?.['guest_cart_id'];
  if (!guestId) return this.cart.getCart(identity.key); // nothing to merge
  return this.cart.merge(`cart:guest:${guestId}`, identity.key);
}
```

## Step 6 — `CartModule`

```typescript
// apps/api/src/cart/cart.module.ts
import { Module } from '@nestjs/common';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [ProductsModule], // CartService injects ProductsService — must import the module that exports it
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService], // checkout (05) reads the cart directly
})
export class CartModule {}
```

## Testing it

```bash
# guest add-to-cart (no Authorization header)
curl -i -c cookies.txt -X POST http://localhost:4000/cart/items \
  -H 'Content-Type: application/json' \
  -d '{"productId":"<uuid>","quantity":2}'

# confirm it persists across a second call using the same cookie jar
curl -b cookies.txt http://localhost:4000/cart

# log in (from 02-auth-api.md), then merge using both cookie jars
curl -i -b cookies.txt -c cookies.txt -X POST http://localhost:4000/auth/login -d '...'
curl -i -b cookies.txt -X POST http://localhost:4000/cart/merge \
  -H "Authorization: Bearer <accessToken>"
```

## Pitfalls specific to this exact stack

- **`docker-local.yml`'s Redis maps host port `6380 → 6379`** (a fix
  already applied in this repo, not the default) — if `REDIS_URL` in your
  `.env` still says `6379` and you're running the API outside Docker
  against the Dockerized Redis, connections will hang/refuse. Confirmed
  in `docs/10-infrastructure-and-deploy.md`.
- **Don't `new Redis()` inside `CartService`'s constructor or any request
  handler** — always inject the shared client from `RedisModule`. A
  per-request client will work fine in manual testing and then exhaust
  Redis's max-connections under any real concurrent load; this bug is
  invisible until you load-test.
- **The guest cart cookie is intentionally not `httpOnly`** — resist the
  urge to "harden" it to match the auth refresh cookie's settings; the
  frontend genuinely needs to read this one for the merge call. `04-cart.md`
  calls out keeping this logic distinct from `02-auth-api.md`'s cookie.
- **Stock validation happens at both add-to-cart time and (again, in
  `05-checkout-payments-api.md`) at checkout time** — this looks
  redundant but isn't: stock can change between "add to cart" and
  "checkout" (someone else buys the last unit), so the cart-time check is
  a UX nicety, not the actual guarantee. Never treat the cart-time check
  as sufficient on its own.

## Scalability notes

- **This design is already horizontally scalable** — any `api` replica
  can serve any cart request since all cart state lives in Redis, not
  in-process memory. This is worth noticing explicitly: an in-memory
  `Map` cart (tempting for a "simple" first implementation) would silently
  break the moment `docker-production.yml`'s `replicas: 2` actually
  routes two requests from the same user to two different containers.
- **Redis single-instance is a single point of failure** — fine for this
  project's scale, but the natural next step at real scale is Redis
  Sentinel (HA failover) or a managed Redis (ElastiCache, Upstash) rather
  than hand-rolling clustering. Not needed now; mentioned so you know
  what "the next step" looks like when you get there.
- **Hydrating every cart item from Postgres on every `GET /cart` call**
  (the `hydrate()` method) means cart reads scale with product-read load,
  not just cart-write load. If this becomes measurable, the fix is the
  same Redis product-cache from `03-products-categories-api.md`'s
  scalability notes — cart hydration becomes cache reads instead of DB
  reads. Don't build that cache preemptively; build it when `hydrate()`
  shows up in real latency numbers.

## Done looks like

Same checklist as `docs/04-cart.md`'s "What done looks like" — verify
against it there, plus: confirm via Prisma Studio or direct Redis
inspection (`redis-cli` against the `6380` port) that no `cart` table
exists in Postgres at all — if you find yourself wanting one, that's a
signal you've drifted from the Redis-only decision, revisit
`docs/04-cart.md` before adding it.
