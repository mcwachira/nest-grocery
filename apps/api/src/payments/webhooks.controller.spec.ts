import { Test, TestingModule } from '@nestjs/testing';
import { WebhooksController } from './webhooks.controller';
import { PrismaService } from '../prisma/prisma.service';
import { InventoryService } from '../inventory/inventory.service';
import { PaystackPaymentProvider } from './paystack-payment.provider';
import { MpesaPaymentProvider } from './mpesa-payment.provider';

function createPrismaMock() {
  const tx = {
    payment: { update: jest.fn() },
    order: { update: jest.fn() },
  };
  return {
    payment: { findUnique: jest.fn() },
    $transaction: jest.fn((cb) => cb(tx)),
    __tx: tx,
  };
}

describe('WebhooksController', () => {
  let controller: WebhooksController;
  let prisma: ReturnType<typeof createPrismaMock>;
  let inventory: { confirm: jest.Mock; release: jest.Mock };
  let mpesa: { queryStatus: jest.Mock };
  let paystack: { verifySignature: jest.Mock };

  beforeEach(async () => {
    prisma = createPrismaMock();
    inventory = { confirm: jest.fn(), release: jest.fn() };
    mpesa = { queryStatus: jest.fn() };
    paystack = { verifySignature: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [WebhooksController],
      providers: [
        { provide: PrismaService, useValue: prisma },
        { provide: InventoryService, useValue: inventory },
        { provide: PaystackPaymentProvider, useValue: paystack },
        { provide: MpesaPaymentProvider, useValue: mpesa },
      ],
    }).compile();

    controller = module.get<WebhooksController>(WebhooksController);
  });

  describe('handleMpesa — the security-critical path', () => {
    it('independently verifies the M-Pesa transaction status', async () => {
      prisma.payment.findUnique.mockResolvedValueOnce({
        id: 'pay-1',
        status: 'PENDING',
        orderId: 'order-1',
        order: { items: [{ productId: 'p1', quantity: 1 }] },
      });

      mpesa.queryStatus.mockResolvedValueOnce({ ResultCode: '0' });

      const req = {
        body: {
          Body: {
            stkCallback: {
              CheckoutRequestId: 'ws_1',
              ResultCode: 0,
            },
          },
        },
      } as any;

      await controller.handleMpesa(req);

      expect(mpesa.queryStatus).toHaveBeenCalledWith('ws_1');
    });

    it('marks the payment FAILED, and releases the reservation, when queryStatus disagrees with a forged success callback', async () => {
      prisma.payment.findUnique.mockResolvedValueOnce({
        id: 'pay-1',
        status: 'PENDING',
        orderId: 'order-1',
        order: { items: [{ productId: 'p1', quantity: 1 }] },
      });
      // The callback body claims success...
      const req = {
        body: {
          Body: { stkCallback: { CheckoutRequestId: 'ws_1', ResultCode: 0 } },
        },
      } as any;
      // ...but the independently-queried status says otherwise (e.g. a
      // forged/replayed callback, or a genuine late failure).
      mpesa.queryStatus.mockResolvedValueOnce({ ResultCode: '1032' });

      await controller.handleMpesa(req);

      expect(prisma.__tx.payment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'FAILED' }),
        }),
      );
      expect(inventory.release).toHaveBeenCalledWith(prisma.__tx, 'p1', 1);
      expect(inventory.confirm).not.toHaveBeenCalled();
    });
  });

  describe('idempotency', () => {
    it('markPaid is a no-op for a payment that is already SUCCEEDED', async () => {
      prisma.payment.findUnique.mockResolvedValueOnce({
        id: 'pay-1',
        status: 'SUCCEEDED',
        orderId: 'order-1',
        order: { items: [{ productId: 'p1', quantity: 1 }] },
      });
      mpesa.queryStatus.mockResolvedValueOnce({ ResultCode: '0' });

      const req = {
        body: {
          Body: { stkCallback: { CheckoutRequestId: 'ws_1', ResultCode: 0 } },
        },
      } as any;

      await controller.handleMpesa(req);

      // A duplicated webhook delivery for an already-successful payment
      // must NOT decrement stock a second time.
      expect(prisma.$transaction).not.toHaveBeenCalled();
      expect(inventory.confirm).not.toHaveBeenCalled();
    });

    it('markFailed is a no-op for a payment that is already FAILED (or SUCCEEDED)', async () => {
      prisma.payment.findUnique.mockResolvedValueOnce({
        id: 'pay-1',
        status: 'FAILED',
        orderId: 'order-1',
        order: { items: [{ productId: 'p1', quantity: 1 }] },
      });
      mpesa.queryStatus.mockResolvedValueOnce({ ResultCode: '1032' });

      const req = {
        body: {
          Body: {
            stkCallback: { CheckoutRequestId: 'ws_1', ResultCode: 1032 },
          },
        },
      } as any;

      await controller.handleMpesa(req);

      expect(inventory.release).not.toHaveBeenCalled(); // already released once, don't do it twice
    });
  });

  describe('handlePaystack', () => {
    it('throws BadRequestException when the HMAC signature does not match', async () => {
      paystack.verifySignature.mockReturnValueOnce(false);
      const req = { rawBody: Buffer.from('{}') } as any;

      await expect(controller.handlePaystack(req, 'bad-sig')).rejects.toThrow(
        'Invalid webhook signature',
      );
    });

    it('throws BadRequestException when raw body capture is missing entirely', async () => {
      const req = { rawBody: undefined } as any;
      await expect(controller.handlePaystack(req, 'sig')).rejects.toThrow(
        'Missing raw body',
      );
    });

    it("marks the payment paid on a valid charge.success event, keyed by Paystack's reference", async () => {
      paystack.verifySignature.mockReturnValueOnce(true);
      prisma.payment.findUnique.mockResolvedValueOnce({
        id: 'pay-1',
        status: 'PENDING',
        orderId: 'order-1',
        order: { items: [{ productId: 'p1', quantity: 1 }] },
      });
      const event = { event: 'charge.success', data: { reference: 'order-1' } };
      const req = { rawBody: Buffer.from(JSON.stringify(event)) } as any;

      await controller.handlePaystack(req, 'good-sig');

      expect(prisma.__tx.order.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'PAID' }),
        }),
      );
      expect(inventory.confirm).toHaveBeenCalledWith(prisma.__tx, 'p1', 1);
    });
  });

  describe('unknown providerReference', () => {
    it('markPaid silently ignores a webhook for a reference that matches no Payment row', async () => {
      prisma.payment.findUnique.mockResolvedValueOnce(null);
      mpesa.queryStatus.mockResolvedValueOnce({ ResultCode: '0' });

      const req = {
        body: {
          Body: {
            stkCallback: { CheckoutRequestId: 'unknown-ref', ResultCode: 0 },
          },
        },
      } as any;

      // Should not throw — an unrecognized reference is logged and
      // ignored (see security/webhook-security.md), not a 500.
      await expect(controller.handleMpesa(req)).resolves.toBeDefined();
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });
  });
});
