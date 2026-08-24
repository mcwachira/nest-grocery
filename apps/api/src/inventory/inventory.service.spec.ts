import { Test, TestingModule } from '@nestjs/testing';
import { InventoryService } from './inventory.service';
import { BadRequestException } from '@nestjs/common';

// InventoryService takes no constructor dependencies (see modules/inventory.md
// for why) — no TestingModule/DI setup needed at all, just instantiate it
// directly and pass a mocked `tx` object into each method call.

function createTxMock() {
  return {
    $queryRaw: jest.fn(),
    product: { update: jest.fn() },
  };
}
describe('InventoryService', () => {
  let service: InventoryService;

  beforeEach(() => {
    service = new InventoryService();
  });
  describe('reserve', () => {
    it('increment reserved when enough is available', async () => {
      const tx = createTxMock();
      tx.$queryRaw.mockResolvedValueOnce([
        { id: 'p1', name: 'Kale', stock: 10, reserved: 2 },
      ]);

      await service.reserve(tx as any, 'p1', 3);

      expect(tx.product.update).toHaveBeenCalledWith({
        where: { id: 'p1' },
        data: { reserved: { increment: 3 } },
      });
    });

    it('throws BadRequestException when requested quantity exceeds available', async () => {
      const tx = createTxMock();
      // stock 10, reserved 8 -> available 2, requesting 3
      tx.$queryRaw.mockResolvedValueOnce([
        { id: 'p1', name: 'Kale', stock: 10, reserved: 8 },
      ]);

      await expect(service.reserve(tx as any, 'p1', 3)).rejects.toThrow(
        BadRequestException,
      );
      expect(tx.product.update).not.toHaveBeenCalled();
    });

    it('throws BadRequestException for a product id that returns no rows', async () => {
      const tx = createTxMock();
      tx.$queryRaw.mockResolvedValueOnce([]);

      await expect(service.reserve(tx as any, 'ghost', 1)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('confirm', () => {
    it('decrements BOTH stock and reserved by the same quantity', async () => {
      const tx = createTxMock();
      await service.confirm(tx as any, 'p1', 3);

      expect(tx.product.update).toHaveBeenCalledWith({
        where: { id: 'p1' },
        data: { stock: { decrement: 3 }, reserved: { decrement: 3 } },
      });
    });
  });

  describe('release', () => {
    it('decrements ONLY reserved, never touches stock', async () => {
      const tx = createTxMock();
      await service.release(tx as any, 'p1', 3);

      expect(tx.product.update).toHaveBeenCalledWith({
        where: { id: 'p1' },
        data: { reserved: { decrement: 3 } },
      });
      // The negative assertion is the actual point of this test: proving
      // `stock` never appears in the update payload at all, not just that
      // SOME update happened.
    });
  });

  describe('available (static)', () => {
    it('computes stock minus reserved', () => {
      expect(InventoryService.available({ stock: 10, reserved: 3 })).toBe(7);
    });
  });
});
