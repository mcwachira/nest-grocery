import { ProductsService } from './products.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ProductStatus } from '@prisma/client';

function createPrismMock() {
  return {
    product: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn(),
  };
}

describe('ProductsService', () => {
  let service: ProductsService;
  let prisma: ReturnType<typeof createPrismMock>;

  beforeEach(async () => {
    prisma = createPrismMock();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  describe('findMany', () => {
    it('always filter to ACTIVE status, even with no other filters', async () => {
      prisma.$transaction.mockResolvedValueOnce([[], 0]);

      await service.findMany({});

      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: ProductStatus.ACTIVE,
          }),
        }),
      );

      expect(prisma.product.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: ProductStatus.ACTIVE,
          }),
        }),
      );
    });

    it('caps limit at MAX_LIMIT regardless of what the client requests', async () => {
      prisma.$transaction.mockResolvedValueOnce([[], 0]);

      const result = await service.findMany({ limit: 1000 });

      expect(result.limit).toBe(100);
    });

    it('applies category, organic, exclude, and search filters when provided', async () => {
      prisma.$transaction.mockResolvedValueOnce([[], 0]);

      await service.findMany({
        category: 'leafy-greens',
        organic: true,
        exclude: '11111111-1111-1111-1111-111111111111',
        search: 'kale',
      });

      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: ProductStatus.ACTIVE,
            category: {
              slug: 'leafy-greens',
            },
            isOrganic: true,
            id: {
              not: '11111111-1111-1111-1111-111111111111',
            },
            name: {
              contains: 'kale',
              mode: 'insensitive',
            },
          }),
        }),
      );

      expect(prisma.product.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: ProductStatus.ACTIVE,
          }),
        }),
      );
    });
  });

  describe('findBySlug', () => {
    it('returns the product when found and ACTIVE', async () => {
      prisma.product.findUnique.mockResolvedValueOnce({
        id: 'p1',
        slug: 'kale',
        status: ProductStatus.ACTIVE,
      });

      const result = await service.findBySlug('kale');
      expect(result.slug).toBe('kale');
    });

    it('throws NotFoundException when the product does not exist', async () => {
      prisma.product.findUnique.mockResolvedValueOnce(null);
      await expect(service.findBySlug('ghost')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws NotFoundException for a DRAFT product, even though the row exists', async () => {
      prisma.product.findUnique.mockResolvedValueOnce({
        id: 'p1',
        slug: 'unreleased',
        status: ProductStatus.DRAFT,
      });
      // This is the test that proves the public endpoint can't be used to
      // "discover" unreleased products by guessing slugs.
      await expect(service.findBySlug('unreleased')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('archive', () => {
    it('sets status to ARCHIVED rather than deleting the row', async () => {
      prisma.product.findUnique.mockResolvedValueOnce({ id: 'p1' });
      prisma.product.update.mockResolvedValueOnce({
        id: 'p1',
        status: ProductStatus.ARCHIVED,
      });

      await service.archive('p1');

      expect(prisma.product.update).toHaveBeenCalledWith({
        where: { id: 'p1' },
        data: { status: ProductStatus.ARCHIVED },
      });
    });

    it('throws NotFoundException for a nonexistent product id', async () => {
      prisma.product.findUnique.mockResolvedValueOnce(null);
      await expect(service.archive('ghost-id')).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.product.update).not.toHaveBeenCalled();
    });
  });
});
