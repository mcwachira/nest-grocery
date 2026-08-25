import {
  BadRequestException,
  Controller,
  Post,
  RawBodyRequest,
  Req,
  Headers,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InventoryService } from '../inventory/inventory.service';
import { PaystackPaymentProvider } from './paystack-payment.provider';
import {MpesaPaymentProvider} from "./mpesa-payment.provider";

@Controller('webhooks')
export class WebhooksController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly inventory: InventoryService,
    private readonly paystack: PaystackPaymentProvider,
    private readonly mpesa: MpesaPaymentProvider,
  ) {}

  @Post('paystack')
  async handlePaystack(
    @Req() req: RawBodyRequest<Request>,
    @Headers('x-paystack-signature') signature: string,
  ) {
    if (!req.rawBody) {
      //if this ever fires,rawBody got lost somewhere before

      throw new BadRequestException('Missing raw body');
    }

    if (!this.paystack.verifySignature(req.rawBody, signature)) {
      throw new BadRequestException('Invalid webhook signature');
    }

    const event = JSON.parse(req.rawBody.toString('utf8'));

    if (event.event === 'charge.success') {
      await this.markPaid(event.data.reference, event);
    } else if (event.event === 'charge.failed') {
      await this.markFailed(event.data.reference);
    }

    return { received: true };
  }

  @Post('mpesa')
  async handleMpesa(@Req req: Request) {
    const callback = req.body?.Body?.stkCallback;

    if (!callback?.CheckoutRequestId) {
      throw new BadRequestException('Malformed M-pesa CALLBACK');
    }

    // CRITICAL: M-Pesa callbacks are not signed. Never trust ResultCode
    // from the raw body alone — independently re-confirm via the STK
    // Query API first. See security/payment-security.md.

    const confirmed = await this.mpesa.queryStatus(callback.CheckoutRequestId);

    if (confirmed.ResultCode === '0' || confirmed.ResultCode === 0) {
      await this.markPaid(callback.CheckoutRequestId, callback);
    } else {
      await this.markFailed(callback.CheckoutRequestId);
    }
    // Always 200 — Safaricom retries on non-2xx, and we've already made
    // our own authoritative decision via queryStatus above regardless of
    // what the (unsigned) callback body said.
    return { ResultCode: 0, ResultDesc: 'Accepted' };
  }

  private async markPaid(providerReference: string, rawCallback: unknown) {
    const payment = await this.prisma.payment.findUnique({
      where: { providerReference },
      include: { order: { include: { items: true } } },
    });
    if (!payment) return; // unknown reference — log and ignore, don't throw (see security/webhook-security.md)

    // Idempotency: a second delivery of an already-processed event is a
    // no-op, not a re-run. See database/concurrency.md's webhook section.
    if (payment.status === 'SUCCEEDED') return;

    await this.prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: { status: 'SUCCEEDED', rawCallback: rawCallback as any },
      });

      await tx.order.update({
        where: { id: payment.orderId },
        data: { status: 'PAID', paidAt: new Date() },
      });

      for (const item of payment.order.items) {
        await this.inventory.confirm(tx, item.productId, item.quantity);
      }
    });
    // Emit OrderPaid event here (infrastructure/queues.md) — notification
    // + confirmation email, both AFTER the transaction commits.
  }

  private async markFailed(providerReference: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { providerReference },
      include: { order: { include: { items: true } } },
    });
    if (!payment || payment.status !== 'PENDING') return; // idempotent no-op

    await this.prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: { status: 'FAILED' },
      });
      for (const item of payment.order.items) {
        await this.inventory.release(tx, item.productId, item.quantity);
      }
    });
  }
}
