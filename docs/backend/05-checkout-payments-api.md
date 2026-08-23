# Backend 05 — Checkout & Payments API (step-by-step implementation)

Prerequisite: `02-auth-api.md`, `03-products-categories-api.md`, and
`04-cart-api.md` all done — checkout reads the real cart and creates real
orders against real products. High-level design/decisions (Stripe for v1,
flat delivery fee, transactional stock decrement) in
`docs/05-checkout-and-payments.md`.

## What you're building

`GET /checkout/config`, `POST /checkout`, `POST /webhooks/stripe`. This is
the most infra-sensitive doc in the series — raw-body webhook handling and
DB transactions are both genuinely easy to get subtly wrong, so read the
pitfalls section before, not after, you hit the bug.

## Step 1 — install Stripe + mailer

```bash
pnpm add stripe nodemailer
pnpm add -D @types/nodemailer
```

```bash
# .env additions
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
DELIVERY_FEE_CENTS=20000
```

## Step 2 — DTOs

```typescript
// apps/api/src/checkout/dto/checkout.dto.ts
import { IsEnum, IsOptional, IsString } from 'class-validator';

enum PaymentMethod {
  STRIPE = 'STRIPE',
  COD = 'COD',
}

export class CheckoutDto {
  @IsString() shippingLine1: string;
  @IsOptional() @IsString() shippingLine2?: string;
  @IsString() shippingCity: string;
  @IsString() shippingRegion: string;
  @IsOptional() @IsString() shippingPostalCode?: string;
  @IsString() shippingCountry: string;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;
}
```

## Step 3 — the mailer (build this first — checkout depends on it, and it's simple)

```typescript
// apps/api/src/mail/mail.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transport: nodemailer.Transporter;

  constructor(config: ConfigService) {
    // Same transport config works for Mailhog (dev, docker-local.yml) and
    // a real SMTP provider (prod) — only the env vars differ, never the
    // code. See docs/10-infrastructure-and-deploy.md: Mailhog is NOT in
    // docker-production.yml, so SMTP_HOST must never be hardcoded.
    this.transport = nodemailer.createTransport({
      host: config.get('SMTP_HOST'),
      port: config.get('SMTP_PORT'),
      secure: false, // Mailhog and most transactional providers use STARTTLS on 587, not implicit TLS
    });
  }

  async sendOrderConfirmation(to: string, orderId: string, totalCents: number) {
    await this.transport.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject: `Order confirmed — #${orderId.slice(0, 8)}`,
      text: `Thanks for your order! Total: ${(totalCents / 100).toFixed(2)}. Order id: ${orderId}`,
    });
  }
}
```

```typescript
// apps/api/src/mail/mail.module.ts
import { Global, Module } from '@nestjs/common';
import { MailService } from './mail.service';

@Global()
@Module({ providers: [MailService], exports: [MailService] })
export class MailModule {}
```

## Step 4 — `PaymentProvider` interface (build the abstraction now, Stripe-only implementation)

```typescript
// apps/api/src/payments/payment-provider.interface.ts

// One thin interface so M-Pesa (or any other provider) can be added
// later as a second implementation WITHOUT touching CheckoutService —
// see docs/05-checkout-and-payments.md for why this is worth doing now
// even though only Stripe is built. Don't build the M-Pesa
// implementation yet — this interface existing is the whole point.
export interface PaymentProvider {
  createPaymentIntent(amountCents: number, currency: string): Promise<{ id: string; clientSecret: string }>;
  verifyWebhookSignature(rawBody: Buffer, signature: string): unknown; // returns the verified provider event
}
```

```typescript
// apps/api/src/payments/stripe-payment.provider.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PaymentProvider } from './payment-provider.interface';

@Injectable()
export class StripePaymentProvider implements PaymentProvider {
  private stripe: Stripe;

  constructor(private readonly config: ConfigService) {
    this.stripe = new Stripe(config.get('STRIPE_SECRET_KEY')!);
  }

  async createPaymentIntent(amountCents: number, currency: string) {
    const intent = await this.stripe.paymentIntents.create({
      amount: amountCents,
      currency: currency.toLowerCase(),
    });
    return { id: intent.id, clientSecret: intent.client_secret! };
  }

  verifyWebhookSignature(rawBody: Buffer, signature: string) {
    // Throws if the signature doesn't match — this is what actually
    // proves a webhook request came from Stripe and wasn't forged by
    // someone POSTing a fake "payment succeeded" event at your endpoint.
    return this.stripe.webhooks.constructEvent(
      rawBody,
      signature,
      this.config.get('STRIPE_WEBHOOK_SECRET')!,
    );
  }
}
```

## Step 5 — `CheckoutService` (the core transaction)

```typescript
// apps/api/src/checkout/checkout.service.ts
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { CartService } from '../cart/cart.service';
import { MailService } from '../mail/mail.service';
import { StripePaymentProvider } from '../payments/stripe-payment.provider';
import { CheckoutDto } from './dto/checkout.dto';
import { cartKeyForUser } from '../cart/cart.constants';

@Injectable()
export class CheckoutService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cart: CartService,
    private readonly mail: MailService,
    private readonly stripe: StripePaymentProvider,
    private readonly config: ConfigService,
  ) {}

  getConfig() {
    return {
      stripePublishableKey: this.config.get('STRIPE_PUBLISHABLE_KEY'),
      deliveryFeeCents: Number(this.config.get('DELIVERY_FEE_CENTS')),
    };
  }

  async checkout(userId: string, dto: CheckoutDto) {
    const cartKey = cartKeyForUser(userId);
    const currentCart = await this.cart.getCart(cartKey);
    if (currentCart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    const deliveryFeeCents = Number(this.config.get('DELIVERY_FEE_CENTS'));

    // Everything below runs in ONE Postgres transaction. This is the
    // single most important correctness guarantee in this whole feature:
    // two customers checking out the last unit of the same product at
    // the same instant must not both succeed. See the pitfalls section
    // for exactly why $transaction alone isn't quite enough on its own —
    // read that before assuming this code is race-condition-free as-is.
    const order = await this.prisma.$transaction(async (tx) => {
      let totalCents = deliveryFeeCents;
      const itemsData: {
        productId: string;
        productName: string;
        unitPriceCents: number;
        quantity: number;
        subtotalCents: number;
      }[] = [];

      for (const item of currentCart.items) {
        // Row lock: SELECT ... FOR UPDATE via Prisma's $queryRaw, so no
        // other concurrent transaction can read-then-decrement the same
        // product row until this one commits or rolls back. A plain
        // tx.product.findUnique() here does NOT lock the row — see
        // pitfalls below for what goes wrong without this.
        const [product] = await tx.$queryRaw<
          { id: string; priceCents: number; stock: number; name: string }[]
        >`SELECT id, "priceCents", stock, name FROM products WHERE id = ${item.productId} FOR UPDATE`;

        if (!product || product.stock < item.quantity) {
          throw new BadRequestException(`"${product?.name ?? item.productId}" is out of stock`);
        }

        await tx.product.update({
          where: { id: product.id },
          data: { stock: { decrement: item.quantity } },
        });

        const subtotalCents = product.priceCents * item.quantity;
        totalCents += subtotalCents;
        itemsData.push({
          productId: product.id,
          productName: product.name, // snapshot — see 00-database-design.md
          unitPriceCents: product.priceCents,
          quantity: item.quantity,
          subtotalCents,
        });
      }

      const isStripe = dto.paymentMethod === 'STRIPE';
      const paymentIntent = isStripe
        ? await this.stripe.createPaymentIntent(totalCents, 'KES')
        : null;

      const created = await tx.order.create({
        data: {
          userId,
          status: isStripe ? 'PENDING_PAYMENT' : 'PROCESSING',
          totalCents,
          deliveryFeeCents,
          currency: 'KES',
          shippingLine1: dto.shippingLine1,
          shippingLine2: dto.shippingLine2,
          shippingCity: dto.shippingCity,
          shippingRegion: dto.shippingRegion,
          shippingPostalCode: dto.shippingPostalCode,
          shippingCountry: dto.shippingCountry,
          paymentProvider: isStripe ? 'STRIPE' : 'COD',
          paymentReference: paymentIntent?.id,
          items: { create: itemsData },
        },
        include: { items: true },
      });

      return { order: created, clientSecret: paymentIntent?.clientSecret };
    });

    await this.cart.clear(cartKey); // cart survives only until checkout succeeds

    if (order.order.paymentProvider === 'COD') {
      const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
      await this.mail.sendOrderConfirmation(user.email, order.order.id, order.order.totalCents);
    }
    // Stripe path sends its confirmation email from the webhook handler
    // instead (Step 6) — only once payment is ACTUALLY confirmed, not
    // just attempted. Don't email "order confirmed" before Stripe says so.

    return { orderId: order.order.id, clientSecret: order.clientSecret };
  }
}
```

## Step 6 — Stripe webhook (raw body — the part that's easy to get wrong)

```typescript
// apps/api/src/main.ts (addition — enable raw body capture globally)
const app = await NestFactory.create(AppModule, { rawBody: true });
```

```typescript
// apps/api/src/webhooks/webhooks.controller.ts
import { Controller, Headers, Post, RawBodyRequest, Req, BadRequestException } from '@nestjs/common';
import type { Request } from 'express';
import { StripePaymentProvider } from '../payments/stripe-payment.provider';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';

@Controller('webhooks')
export class WebhooksController {
  constructor(
    private readonly stripe: StripePaymentProvider,
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  @Post('stripe')
  async handleStripe(@Req() req: RawBodyRequest<Request>, @Headers('stripe-signature') signature: string) {
    if (!req.rawBody) {
      // If this ever fires, `rawBody: true` in main.ts got lost somewhere
      // (e.g. a global body-parser middleware registered before Nest's
      // own, consuming the stream first) — see pitfalls below.
      throw new BadRequestException('Missing raw body');
    }

    let event: any;
    try {
      event = this.stripe.verifyWebhookSignature(req.rawBody, signature);
    } catch {
      throw new BadRequestException('Invalid webhook signature');
    }

    // Idempotency: Stripe can and does send the same event more than
    // once (retries on timeout, etc). Without this check, a duplicate
    // delivery of payment_intent.succeeded would double-send the
    // confirmation email. A dedicated WebhookEvent table (id = event.id,
    // unique) is the real fix — sketched here as a comment since it's a
    // small addition once you've got the happy path working; add it
    // before relying on this in anything beyond local testing.
    // await this.prisma.webhookEvent.create({ data: { id: event.id } }); // throws on duplicate — catch and return early

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntentId = event.data.object.id;
      const order = await this.prisma.order.update({
        where: { paymentReference: paymentIntentId },
        data: { status: 'PAID', paidAt: new Date() },
        include: { user: true },
      });
      await this.mail.sendOrderConfirmation(order.user.email, order.id, order.totalCents);
    }

    if (event.type === 'payment_intent.payment_failed') {
      await this.prisma.order.updateMany({
        where: { paymentReference: event.data.object.id },
        data: { status: 'CANCELLED', cancelledAt: new Date() },
      });
    }

    return { received: true };
  }
}
```

`Order.paymentReference` needs a `@unique` constraint added in
`schema.prisma` for the `where: { paymentReference: ... }` lookup above to
work as a unique query — add it as a follow-up migration
(`prisma migrate dev --name order_payment_reference_unique`).

## Step 7 — controller + module

```typescript
// apps/api/src/checkout/checkout.controller.ts
import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { CheckoutService } from './checkout.service';
import { CheckoutDto } from './dto/checkout.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('checkout')
export class CheckoutController {
  constructor(private readonly checkout: CheckoutService) {}

  @Get('config')
  getConfig() {
    return this.checkout.getConfig();
  }

  // Login required for checkout — v1 decision, see docs/05-checkout-and-payments.md.
  @UseGuards(JwtAuthGuard)
  @Post()
  checkoutNow(@Req() req: Request & { user: { userId: string } }, @Body() dto: CheckoutDto) {
    return this.checkout.checkout(req.user.userId, dto);
  }
}
```

```typescript
// apps/api/src/checkout/checkout.module.ts
import { Module } from '@nestjs/common';
import { CheckoutController } from './checkout.controller';
import { CheckoutService } from './checkout.service';
import { CartModule } from '../cart/cart.module';
import { StripePaymentProvider } from '../payments/stripe-payment.provider';
import { WebhooksController } from '../webhooks/webhooks.controller';

@Module({
  imports: [CartModule],
  controllers: [CheckoutController, WebhooksController],
  providers: [CheckoutService, StripePaymentProvider],
})
export class CheckoutModule {}
```

## Testing it

Build and test the **COD path first** — no external dependency, proves
the transaction/stock-decrement logic works before adding Stripe:

```bash
curl -i -X POST http://localhost:4000/checkout \
  -H "Authorization: Bearer <accessToken>" \
  -H 'Content-Type: application/json' \
  -d '{"shippingLine1":"123 Main St","shippingCity":"Nairobi","shippingRegion":"Nairobi","shippingCountry":"KE","paymentMethod":"COD"}'
```

Confirm: the order exists in Prisma Studio, `stock` on the ordered
product(s) decremented by the right amount, and the confirmation email
appears in Mailhog (`localhost:8025`).

Then test Stripe locally with the Stripe CLI:

```bash
stripe listen --forward-to localhost/webhooks/stripe
# in another terminal, trigger a checkout with paymentMethod:"STRIPE",
# then confirm the PaymentIntent with a Stripe test card via the
# frontend Elements flow (05-checkout-and-payments.md's frontend section)
# or stripe's test helpers, and watch the CLI forward the webhook.
```

## Pitfalls specific to this exact stack

- **`SELECT ... FOR UPDATE` is what actually prevents the overselling
  race — `$transaction` alone does not.** A plain
  `tx.product.findUnique()` followed by a decrement inside a transaction
  still lets two concurrent transactions both read `stock: 1` before
  either commits, and both proceed to decrement — Postgres's default
  `READ COMMITTED` isolation allows this. `FOR UPDATE` takes a row lock at
  read time, so the second transaction blocks until the first commits (and
  then sees the already-decremented stock). This is the single most
  important line in this entire doc — don't skip it to "simplify" the
  code.
- **`main.ts`'s `rawBody: true` option must survive any other body-parser
  middleware you add later.** If you ever add `app.use(express.json())`
  globally for some other reason, put it *after* `NestFactory.create`
  configures raw body capture, or scope it away from `/webhooks/*`
  entirely — a global JSON body parser registered first will consume the
  stream before Stripe's signature verification ever sees the raw bytes,
  and `verifyWebhookSignature` will fail with a confusing signature
  mismatch that has nothing to do with your actual webhook secret being
  wrong.
- **Webhook idempotency is sketched, not built, above** — Stripe's own
  docs are explicit that webhook delivery is at-least-once, not
  exactly-once. Add the `WebhookEvent` dedup table before this touches
  anything beyond local Stripe CLI testing; it's flagged as a TODO
  deliberately, not an oversight.
- **`Order.paymentReference` needs the `@unique` migration** mentioned in
  Step 6 — without it, `prisma.order.update({ where: { paymentReference } })`
  won't compile/run, since Prisma requires a unique field for a
  `where` on `update`.
- **`POST /checkout` itself has no idempotency key, separate from the
  webhook idempotency gap above.** The `FOR UPDATE` lock stops two
  concurrent requests from *overselling* the same product, but nothing
  stops a double-click or a client's retry-on-timeout from creating two
  separate `Order` rows (and two separate `PaymentIntent` charges) for
  one customer action — see `08-production-hardening.md`'s idempotency-key
  section for the fix (a client-generated key, deduped against a new
  unique-indexed `Order` column). Flagged here deliberately, the same way
  the webhook gap above is — build it before this handles real payments.
- **Never trust `dto.paymentMethod` alone to decide the charge amount** —
  notice `checkout()` always recomputes `totalCents` from live product
  prices inside the transaction, never from anything the client sent.
  This closes the same pricing gap flagged in `04-cart-api.md`.

## Scalability notes

- **The `FOR UPDATE` row lock is a real throughput constraint on hot
  products** — if the same single product is being checked out by
  hundreds of concurrent customers (a flash-sale scenario), they'll
  serialize through that lock one at a time. Fine at this project's
  scale; the standard fix at real scale is optimistic concurrency (a
  `version` column, retry-on-conflict) instead of pessimistic locking, or
  moving inventory decrement into a queue. Don't build that now — this
  pattern is correct and simple, which matters more while you're learning
  it.
- **Sending email inline inside the request path** (both in `checkout()`
  and the webhook handler) means a slow/down SMTP server slows down or
  fails the checkout response itself. Once this matters, the fix is a
  queue (BullMQ, backed by the Redis you already have from
  `04-cart-api.md`) — enqueue "send confirmation email" as a job instead
  of awaiting it inline. Worth doing once you're comfortable with the
  synchronous version working correctly first; don't reach for a queue
  before you've proven the logic it wraps.
- **`docker-production.yml` runs `api` with `replicas: 2`** — this is
  exactly why the webhook handler must be idempotent (Step 6's TODO) and
  why the stock-decrement transaction must use real row locking rather
  than in-process locking (a `Map`-based mutex would only protect one
  replica, not both).

## Done looks like

Same checklist as `docs/05-checkout-and-payments.md`'s "What done looks
like" — verify against it there.
