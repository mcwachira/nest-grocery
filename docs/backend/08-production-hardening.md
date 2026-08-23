# Backend 08 — Production Hardening (cross-cutting)

## Where this fits

Every doc from `02` through `06` is genuinely thorough about its own
feature's correctness and scalability — row locking in checkout, N+1
avoidance in products, snapshot fields in orders, reuse-detection in
auth. What none of them cover, because it isn't any single feature's
job, is the handful of concerns that apply to *every* module equally:
what happens when something throws that nobody expected, whether the app
even starts if an env var is missing, how you'd know it's unhealthy from
outside, and so on.

This doc is that missing layer. Unlike `02`–`06`, it's not a sequence to
build once and move past — apply each section incrementally as you build
each new module, the same way `10-infrastructure-and-deploy.md`'s "as
features land" checklist works. `AuthModule` already exists, so it's the
natural place to retrofit the first two or three sections below before
building `ProductsModule`; everything after that should just be there
from the start.

## 1. A global exception filter (consistent error shape)

Right now, an unhandled error anywhere in the app becomes NestJS's
default `{"statusCode":500,"message":"Internal server error"}` — you've
already seen this exact response live, from before the Prisma client was
generated. That default is fine for a genuinely unexpected crash, but
every module so far throws its own ad hoc messages
(`'Only ${product.stock} in stock'`, `` `"${product.name}" is out of
stock` ``, `'Cannot transition from X to Y'`) with no machine-readable
`code` field — a frontend can only match on the exact English string,
which breaks the moment you reword a message or add i18n.

```typescript
// apps/api/src/common/filters/all-exceptions.filter.ts
import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import type { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionsFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();
    const isHttp = exception instanceof HttpException;
    const status = isHttp ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const body = isHttp ? exception.getResponse() : { message: 'Internal server error' };

    // Never log the full stack for an expected 4xx (e.g. "invalid
    // credentials") at error level — that's normal traffic, not an
    // incident. Only genuine 5xx-and-unknown exceptions deserve a loud
    // log line an on-call human should actually look at.
    if (!isHttp || status >= 500) {
      this.logger.error(exception instanceof Error ? exception.stack : exception);
    }

    res.status(status).json(
      typeof body === 'string'
        ? { statusCode: status, message: body }
        : { statusCode: status, ...body },
    );
  }
}
```

```typescript
// apps/api/src/main.ts (addition)
app.useGlobalFilters(new AllExceptionsFilter());
```

This alone doesn't add error `code`s — that's a bigger, deliberate design
decision (an enum of stable machine-readable codes per exception type)
worth doing once you have 2–3 real frontends consuming these errors and
can see which ones actually need to branch on the failure reason, not
speculatively now.

## 2. Validate environment variables at boot, not at first use

Every module so far calls `config.get('SOME_VAR')` (or `getOrThrow`)
right where it's used — `JWT_SECRET` in `JwtStrategy`, `STRIPE_SECRET_KEY`
in `StripePaymentProvider`, `SMTP_HOST` in `MailService`. That means a
missing `STRIPE_SECRET_KEY` doesn't fail until someone actually hits
checkout, potentially hours after a bad deploy — the exact failure mode
`PrismaService.onModuleInit`'s comment already calls out for
`DATABASE_URL` ("fails fast at boot, not on the first request a real
user makes"). Apply that same principle to every required env var at
once:

```bash
pnpm add joi
```

```typescript
// apps/api/src/app.module.ts (addition)
import * as Joi from 'joi';

ConfigModule.forRoot({
  isGlobal: true,
  validationSchema: Joi.object({
    DATABASE_URL: Joi.string().required(),
    JWT_SECRET: Joi.string().min(32).required(),
    JWT_EXPIRES_IN: Joi.string().default('15m'),
    REDIS_URL: Joi.string().required(),
    STOREFRONT_ORIGIN: Joi.string().uri().required(),
    ADMIN_ORIGIN: Joi.string().uri().required(),
    NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
    // Add each new required var here as the feature that needs it lands
    // (STRIPE_SECRET_KEY/STRIPE_WEBHOOK_SECRET with 05, SMTP_* with 05,
    // S3_*/R2_* with 03's image upload) — this list should grow in
    // lockstep with .env.example, never drift from it.
  }),
}),
```

A missing or malformed var now crashes `NestFactory.create` immediately
with a readable Joi error naming the exact var — not a confusing runtime
failure three modules away from the actual misconfiguration.

## 3. A health check endpoint

`docker-production.yml` runs `api` with `replicas: 2` behind nginx — a
load balancer or orchestrator needs a way to ask "is this specific
replica actually able to serve traffic" (not just "is the process
running," which a bare TCP check would tell you even if `PrismaService`
lost its DB connection). Nothing in this repo exposes that today.

```bash
pnpm add @nestjs/terminus
```

```typescript
// apps/api/src/health/health.controller.ts
import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService, PrismaHealthIndicator } from '@nestjs/terminus';
import { PrismaService } from '../prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly prismaIndicator: PrismaHealthIndicator,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    // Checks the actual DB connection, not just "the process is up" —
    // that's the whole point of a readiness check vs. a liveness check.
    return this.health.check([() => this.prismaIndicator.pingCheck('database', this.prisma)]);
  }
}
```

Point `docker-production.yml`'s (currently absent) healthcheck at
`GET /health`, the same way `postgres`/`redis` already have
`healthcheck:` blocks in `docker-local.yml` — this is the missing piece
that makes `depends_on: condition: service_healthy` possible for `api`
too, not just its own dependencies.

## 4. Structured logging with request correlation

`09-shared-packages.md` already flags `packages/logger` as
either-wire-it-up-or-delete-it dead code, and recommends wrapping `pino`
or NestJS's built-in `Logger`. Do the "wire it up" half now: NestJS's
built-in `Logger` is already structured enough to start with (no new
dependency needed), but nothing currently gives you a way to correlate
every log line from one request across a multi-replica deployment.

```typescript
// apps/api/src/common/middleware/request-id.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const id = (req.headers['x-request-id'] as string) ?? randomUUID();
    req.headers['x-request-id'] = id;
    res.setHeader('x-request-id', id);
    next();
  }
}
```

Apply it globally in `AppModule`'s `configure(consumer: MiddlewareConsumer)`
(`consumer.apply(RequestIdMiddleware).forRoutes('*')`). The immediate
payoff: when a customer reports "my checkout failed," the `x-request-id`
your frontend can surface in an error toast is the same id that appears
in that request's log lines on whichever of the 2 `api` replicas actually
handled it — without this, correlating a bug report to specific log
output across replicas is close to impossible.

## 5. Security headers

Nothing in `main.ts` sets `Content-Security-Policy`,
`X-Content-Type-Options`, `Strict-Transport-Security`, etc. — these cost
nothing to add and close off a class of attacks (clickjacking, MIME
sniffing) that have nothing to do with any single feature's logic.

```bash
pnpm add helmet
```

```typescript
// apps/api/src/main.ts (addition — before enableCors)
import helmet from 'helmet';
app.use(helmet());
```

One thing to watch: `helmet()`'s default CSP is strict and can interfere
with Stripe's client-side JS if the storefront ever embeds Stripe Elements
in a page also served by this API (unlikely for a pure API backend, but
worth knowing) — if you ever see a Stripe/CSP conflict, scope a
`contentSecurityPolicy` override rather than disabling it wholesale.

## 6. Graceful shutdown

`PrismaService.onModuleDestroy` already disconnects cleanly, but that
lifecycle hook only fires if Nest's shutdown hooks are enabled — they
aren't, by default.

```typescript
// apps/api/src/main.ts (addition)
app.enableShutdownHooks();
```

This is what makes a rolling deploy (`docker-production.yml` replacing
one of 2 replicas at a time) actually graceful: on `SIGTERM`, Nest lets
in-flight requests and `OnModuleDestroy` hooks finish before the process
exits, instead of the container being killed mid-transaction.

## 7. API documentation (OpenAPI/Swagger)

With `apps/admin` and `apps/storefront` both consuming this API, and
every DTO already using `class-validator` decorators, generating live API
docs is a small addition with an outsized payoff for a solo developer
switching between frontend and backend context:

```bash
pnpm add @nestjs/swagger
```

```typescript
// apps/api/src/main.ts (addition)
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

const config = new DocumentBuilder()
  .setTitle('Nest Grocery API')
  .setVersion('1.0')
  .addBearerAuth() // matches JwtStrategy's Bearer-token access tokens
  .build();
SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, config));
```

Add `@ApiProperty()` to DTO fields incrementally as you touch them — not
a blocking, one-time migration of every existing DTO. `GET /docs` becomes
a live, always-current reference the moment even one module has it.

## 8. Idempotency for `POST /checkout` itself

`05-checkout-payments-api.md`'s webhook handler already flags Stripe
webhook idempotency as a known, deliberate gap (`WebhookEvent` dedup
table, sketched but not built). There's a **second**, un-flagged
idempotency gap in the same doc, on the client-facing side: nothing stops
a double-click or a client's automatic retry-on-timeout from sending two
back-to-back `POST /checkout` requests before the first one's
`cart.clear()` call takes effect. The `SELECT ... FOR UPDATE` row lock
correctly prevents *overselling* stock between the two requests, but it
does **not** prevent two separate, valid `Order` rows being created and
two separate `PaymentIntent`s being charged for what the customer
experienced as one checkout click.

The standard fix is a client-supplied idempotency key:

```typescript
// apps/api/src/checkout/dto/checkout.dto.ts (addition)
@IsString()
idempotencyKey: string; // client generates once per checkout attempt (e.g. crypto.randomUUID()), reuses it on retry
```

```typescript
// apps/api/src/checkout/checkout.service.ts (addition, inside checkout())
const existing = await this.prisma.order.findFirst({ where: { idempotencyKey: dto.idempotencyKey } });
if (existing) return { orderId: existing.id, clientSecret: /* re-derive or store alongside */ };
```

This needs a new unique-indexed `idempotencyKey` column on `Order` (a
follow-up migration, same pattern as `05`'s own `paymentReference`
`@unique` follow-up) — sketched here rather than fully built out, exactly
like the webhook dedup table in `05` itself; build it before this checkout
flow handles real payments, not before then.

## 9. Rate limiting beyond auth

`ThrottlerGuard` is now registered globally (see
`02-auth-api-fixes.md`'s security checklist) via `APP_GUARD`, so every
route in every future module is throttled by the same default (10
requests/60s) unless overridden — you don't need to remember to add
throttling to `ProductsController`/`CheckoutController`/etc. yourself.
What you *do* need to do per-module: reach for `@Throttle({ default: {
limit: N, ttl: M } })` on a specific route when the global default is
wrong for it — `POST /checkout` in particular deserves its own, stricter
limit given it triggers a real payment-provider charge attempt, not just
a database write.

## Pitfalls specific to this exact stack

- **Apply these incrementally, not as a big-bang refactor.** Retrofitting
  all nine sections into `AuthModule` in one sitting risks the same kind
  of hand-typing slip bugs `02-auth-api-fixes.md` already documented
  happening with a much smaller change. Add one section, verify (`tsc`,
  `pnpm test`, a manual `curl`), commit, move to the next.
- **The global exception filter must not swallow NestJS's own validation
  error shape** — `ValidationPipe`'s 400 responses already have a useful
  `message: string[]` array (one entry per failed field). Test that the
  filter above still surfaces that array correctly, not just the generic
  `HttpException` case, before relying on it.
- **`app.enableShutdownHooks()` has a real cost during local `--watch`
  development** — it makes `nest start --watch` slightly slower to
  restart on file changes, since it now waits for graceful teardown each
  time. Worth it; just don't be surprised by it.

## Done looks like

- A deliberately-thrown error (e.g. request a nonexistent product) and a
  genuinely unexpected one (e.g. temporarily rename a Prisma model to
  break a query) both return the same `{statusCode, message}` JSON shape,
  and only the second one produces a logged stack trace.
- Deleting `JWT_SECRET` from `.env` and restarting the container fails at
  boot with a clear Joi validation error, not a confusing failure the
  first time someone logs in.
- `GET /health` returns 200 when Postgres is reachable and a non-200 when
  it isn't (test by stopping the `postgres` container briefly).
- Every response includes an `x-request-id` header, and it's the same
  value that appears in that request's server-side log lines.
- `GET /docs` renders a live Swagger UI covering at least the auth
  endpoints.
