# Backend 06 — Orders API (step-by-step implementation)

Prerequisite: `05-checkout-payments-api.md` done — `Order`/`OrderItem` rows
already exist by the time this doc's endpoints matter (checkout creates
the first order; this doc is about reading and managing orders after the
fact). High-level design/state machine in `docs/06-orders.md`.

## What you're building

`GET /orders`, `GET /orders/:id` (customer-facing), `GET /admin/orders`,
`GET /admin/orders/:id`, `PATCH /admin/orders/:id/status` (admin-facing).

## Step 1 — the transition validator (the one real piece of business logic here)

```typescript
// apps/api/src/orders/order-status.util.ts
import { OrderStatus } from '@prisma/client';

// A pure function, no NestJS DI needed to test it — exactly the kind of
// logic worth a real unit test, since it's the one place a bug here has
// a concrete, easy-to-describe failure mode (an order silently skipping
// a state, or reversing one it shouldn't).
const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING_PAYMENT: ['PAID', 'CANCELLED'],
  PAID: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['FULFILLED', 'CANCELLED'],
  FULFILLED: ['OUT_FOR_DELIVERY'],
  OUT_FOR_DELIVERY: ['DELIVERED'],
  DELIVERED: [], // terminal — refunds are a deferred feature, see docs/06-orders.md
  CANCELLED: [], // terminal
};

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
}

// Maps a target status to the corresponding timestamp column, so the
// service layer doesn't need a parallel if/else chain — see
// OrdersService.updateStatus below.
export function timestampFieldFor(status: OrderStatus): string | null {
  switch (status) {
    case 'PAID':
      return 'paidAt';
    case 'FULFILLED':
      return 'fulfilledAt';
    case 'DELIVERED':
      return 'deliveredAt';
    case 'CANCELLED':
      return 'cancelledAt';
    default:
      return null;
  }
}
```

```typescript
// apps/api/src/orders/order-status.util.spec.ts
import { canTransition } from './order-status.util';

describe('canTransition', () => {
  it('allows PROCESSING -> FULFILLED', () => {
    expect(canTransition('PROCESSING', 'FULFILLED')).toBe(true);
  });

  it('rejects DELIVERED -> PROCESSING (no going backwards)', () => {
    expect(canTransition('DELIVERED', 'PROCESSING')).toBe(false);
  });

  it('rejects skipping straight to DELIVERED', () => {
    expect(canTransition('PAID', 'DELIVERED')).toBe(false);
  });
});
```

Run `pnpm test order-status` — this is worth actually running, not just
reading, since it's the cheapest possible proof the state machine behaves
before any API code depends on it.

## Step 2 — `OrdersService`

```typescript
// apps/api/src/orders/orders.service.ts
import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { canTransition, timestampFieldFor } from './order-status.util';

const MAX_LIMIT = 50;

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  // --- customer-facing ---

  async findMyOrders(userId: string, page = 1, limit = 20) {
    const take = Math.min(limit, MAX_LIMIT);
    const [items, total] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        where: { userId },
        include: { items: true }, // avoid N+1 on the list view too, not just detail
        orderBy: { placedAt: 'desc' },
        skip: (page - 1) * take,
        take,
      }),
      this.prisma.order.count({ where: { userId } }),
    ]);
    return { items, total, page, limit: take };
  }

  async findMyOrderById(userId: string, orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    // 404, not 403, for "exists but isn't yours" — see docs/06-orders.md:
    // a 403 confirms the order id exists at all, which leaks order
    // volume/ids to anyone probing sequential-looking requests. Since
    // ids are uuids (00-database-design.md) this is defense in depth,
    // not the only protection, but the distinction costs nothing to get
    // right.
    if (!order || order.userId !== userId) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  // --- admin-facing ---

  async findAllForAdmin(status?: OrderStatus, page = 1, limit = 20) {
    const take = Math.min(limit, MAX_LIMIT);
    const where = status ? { status } : {};
    const [items, total] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        where,
        include: { items: true, user: { select: { email: true, firstName: true, lastName: true } } },
        orderBy: { placedAt: 'desc' },
        skip: (page - 1) * take,
        take,
      }),
      this.prisma.order.count({ where }),
    ]);
    return { items, total, page, limit: take };
  }

  async findOneForAdmin(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true, user: true },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async updateStatus(orderId: string, newStatus: OrderStatus) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');

    // The API is the enforcement boundary, not the admin UI — see
    // docs/06-orders.md's pitfalls. The admin dashboard (08) will only
    // ever OFFER valid next states in its dropdown, but this check is
    // what actually stops a raw API call from skipping the state machine.
    if (!canTransition(order.status, newStatus)) {
      throw new BadRequestException(`Cannot transition from ${order.status} to ${newStatus}`);
    }

    const timestampField = timestampFieldFor(newStatus);
    return this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: newStatus,
        ...(timestampField ? { [timestampField]: new Date() } : {}),
      },
    });
  }
}
```

## Step 3 — DTOs

```typescript
// apps/api/src/orders/dto/query-orders.dto.ts
import { Type } from 'class-transformer';
import { IsEnum, IsOptional } from 'class-validator';
import { OrderStatus } from '@prisma/client';

export class QueryOrdersDto {
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @IsOptional() @Type(() => Number) page?: number = 1;
  @IsOptional() @Type(() => Number) limit?: number = 20;
}
```

```typescript
// apps/api/src/orders/dto/update-order-status.dto.ts
import { IsEnum } from 'class-validator';
import { OrderStatus } from '@prisma/client';

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
```

## Step 4 — controllers

```typescript
// apps/api/src/orders/orders.controller.ts
import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { OrdersService } from './orders.service';
import { QueryOrdersDto } from './dto/query-orders.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard) // every route here requires a logged-in user
@Controller('orders')
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Get()
  findMine(@Req() req: Request & { user: { userId: string } }, @Query() query: QueryOrdersDto) {
    return this.orders.findMyOrders(req.user.userId, query.page, query.limit);
  }

  @Get(':id')
  findOne(@Req() req: Request & { user: { userId: string } }, @Param('id') id: string) {
    return this.orders.findMyOrderById(req.user.userId, id);
  }
}
```

```typescript
// apps/api/src/orders/admin-orders.controller.ts
import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { QueryOrdersDto } from './dto/query-orders.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

// A SEPARATE controller (not just extra routes bolted onto
// OrdersController) with its own base path (/admin/orders) and its own
// guard stack at the class level — this makes it structurally impossible
// to accidentally leave one admin route unguarded, unlike adding
// per-method @UseGuards() calls to a shared controller where it's easy
// to forget one on a new route later.
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin/orders')
export class AdminOrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Get()
  findAll(@Query() query: QueryOrdersDto) {
    return this.orders.findAllForAdmin(query.status, query.page, query.limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orders.findOneForAdmin(id);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.orders.updateStatus(id, dto.status);
  }
}
```

## Step 5 — `OrdersModule`

```typescript
// apps/api/src/orders/orders.module.ts
import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { AdminOrdersController } from './admin-orders.controller';
import { OrdersService } from './orders.service';

@Module({
  controllers: [OrdersController, AdminOrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
```

## Testing it

```bash
# customer: list own orders
curl http://localhost:4000/orders -H "Authorization: Bearer <customerAccessToken>"

# customer: fetch someone else's order id -> must 404, not 403
curl -i http://localhost:4000/orders/<someone-elses-order-id> -H "Authorization: Bearer <customerAccessToken>"

# admin: list all, filter by status
curl "http://localhost:4000/admin/orders?status=PROCESSING" -H "Authorization: Bearer <adminAccessToken>"

# admin: valid transition
curl -X PATCH http://localhost:4000/admin/orders/<id>/status \
  -H "Authorization: Bearer <adminAccessToken>" -H 'Content-Type: application/json' \
  -d '{"status":"FULFILLED"}'

# admin: INVALID transition -> must 400, not silently succeed
curl -i -X PATCH http://localhost:4000/admin/orders/<delivered-order-id>/status \
  -H "Authorization: Bearer <adminAccessToken>" -H 'Content-Type: application/json' \
  -d '{"status":"PROCESSING"}'
```

## Pitfalls specific to this exact stack

- **Never join `OrderItem` back to live `Product` data for display** —
  `findMyOrderById`/`findOneForAdmin` return `items` straight from the DB,
  which already contain the snapshotted `productName`/`unitPriceCents`.
  Resist the temptation to `include: { items: { include: { product: true } } }`
  and read `product.name`/`product.priceCents` instead — that reintroduces
  exactly the "order history silently changes when a price changes" bug
  the snapshot fields exist to prevent (see `00-database-design.md`).
- **The two-controller split (customer vs. admin) is deliberate, not
  boilerplate** — a single `OrdersController` with a mix of
  `@UseGuards(JwtAuthGuard)` and `@UseGuards(JwtAuthGuard, RolesGuard) @Roles('ADMIN')`
  scattered per-method is exactly the pattern that leads to a forgotten
  guard on a new route six months from now. The class-level guard on
  `AdminOrdersController` makes "is this route admin-only" a one-glance
  answer.
- **`@IsEnum(OrderStatus)` on `UpdateOrderStatusDto`** rejects a garbage
  status string with a clean 400 before it ever reaches `canTransition` —
  don't rely on `canTransition`'s `ALLOWED_TRANSITIONS[from]?.includes(to)`
  optional chaining alone to handle an invalid enum value; the DTO
  validation is what actually catches it first.

## Scalability notes

- **`orders.userId` and `orders.status` indexes** (already in
  `00-database-design.md`'s schema) are what keep `findMyOrders` and
  `findAllForAdmin` fast as the table grows — every query above filters
  on one or both. If you ever add a new admin filter (e.g. date range),
  check whether it needs its own index the same way, rather than assuming
  Postgres will always find an efficient plan on an unindexed column.
- **Order history naturally only grows** (orders are rarely deleted) —
  this is the one table in the schema where thinking about eventual
  partitioning (by `placedAt`, e.g. monthly) or archiving old
  `DELIVERED`/`CANCELLED` orders to cold storage actually matters at
  scale. Not needed for this project's real size; flagged here so you
  know it's `orders`, specifically, that would need it first if this ever
  became a real high-volume business — not `products` or `users`.
- **The admin order list is the first place pagination limits genuinely
  matter for UX, not just performance** — an admin scrolling through
  thousands of orders needs status filters and reasonable page sizes far
  more than a customer ever will (a customer's own order history is
  naturally small). The `MAX_LIMIT = 50` ceiling here is deliberately
  tighter than `03-products-categories-api.md`'s `100` for exactly this
  reason — admin order rows carry more joined data (items + user) per row.

## Done looks like

Same checklist as `docs/06-orders.md`'s "What done looks like" — verify
against it there, plus: the `order-status.util.spec.ts` test suite passes,
and you've manually confirmed at least one invalid transition is rejected
by the live API (not just the unit test).
