import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CartService } from './cart.service';
import { REDIS_CLIENT } from '../redis/redis.module';
import { ProductsService } from '../products/products.service';

function createRedisMock() {
  const store = new Map<string, string>();
  return {
    get: jest.fn((key: string) => Promise.resolve(store.get(key) ?? null)),
    set: jest.fn((key: string, value: string) => {
      store.set(key, value);
      return Promise.resolve('OK');
    }),
    del: jest.fn((key: string) => {
      store.delete(key);
      return Promise.resolve(1);
    }),
    __store: store, // test-only escape hatch to seed/inspect state directly
  };
}

function createProductsServiceMock() {
  return { findByIdOrThrow: jest.fn() };
}

describe('CartService', () => {
  let service: CartService;
  let redis: ReturnType<typeof createRedisMock>;
  let products: ReturnType<typeof createProductsServiceMock>;

  beforeEach(async () => {
    redis = createRedisMock();
    products = createProductsServiceMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        { provide: REDIS_CLIENT, useValue: redis },
        { provide: ProductsService, useValue: products },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
  });

  describe('addItem', () => {
    it('adds a new item when there is enough available stock', async () => {
      products.findByIdOrThrow.mockResolvedValue({
        id: 'p1',
        name: 'Kale',
        priceCents: 200,
        stock: 10,
        reserved: 0,
        images: [],
      });

      const result = await service.addItem('cart:user-1', 'p1', 2);

      expect(result.items).toHaveLength(1);
      expect(result.items[0]).toMatchObject({ productId: 'p1', quantity: 2 });
      expect(redis.set).toHaveBeenCalled(); // confirms it actually persisted, not just returned an in-memory shape
    });

    it('rejects when requested quantity exceeds AVAILABLE (stock - reserved), not raw stock', async () => {
      products.findByIdOrThrow.mockResolvedValue({
        id: 'p1',
        name: 'Kale',
        priceCents: 200,
        stock: 5,
        reserved: 4,
        images: [],
      });
      // available = 1, requesting 2

      await expect(service.addItem('cart:user-1', 'p1', 2)).rejects.toThrow(
        BadRequestException,
      );
      expect(redis.set).not.toHaveBeenCalled();
    });

    it('increments quantity for an item already in the cart, rather than duplicating it', async () => {
      products.findByIdOrThrow.mockResolvedValue({
        id: 'p1',
        name: 'Kale',
        priceCents: 200,
        stock: 10,
        reserved: 0,
        images: [],
      });

      await service.addItem('cart:user-1', 'p1', 2);
      const result = await service.addItem('cart:user-1', 'p1', 3);

      expect(result.items).toHaveLength(1);
      expect(result.items[0].quantity).toBe(5);
    });
  });

  describe('merge', () => {
    it('sums quantities for items present in both carts', async () => {
      products.findByIdOrThrow.mockResolvedValue({
        id: 'p1',
        name: 'Kale',
        priceCents: 200,
        stock: 10,
        reserved: 0,
        images: [],
      });

      await service.addItem('cart:guest:g1', 'p1', 2);
      await service.addItem('cart:user-1', 'p1', 3);

      const result = await service.merge('cart:guest:g1', 'cart:user-1');

      expect(result.items).toHaveLength(1);
      expect(result.items[0].quantity).toBe(5); // 2 + 3, not overwritten
    });

    it('deletes the guest cart key after a successful merge', async () => {
      products.findByIdOrThrow.mockResolvedValue({
        id: 'p1',
        name: 'Kale',
        priceCents: 200,
        stock: 10,
        reserved: 0,
        images: [],
      });
      await service.addItem('cart:guest:g1', 'p1', 1);

      await service.merge('cart:guest:g1', 'cart:user-1');

      expect(redis.del).toHaveBeenCalledWith('cart:guest:g1');
    });

    it('is a no-op read (does not touch the user cart) when the guest cart is empty', async () => {
      const result = await service.merge('cart:guest:empty', 'cart:user-1');
      expect(redis.set).not.toHaveBeenCalled();
      expect(result.items).toEqual([]);
    });
  });

  describe('hydrate (via getCart)', () => {
    it('marks an item inStock:false when quantity exceeds current availability', async () => {
      products.findByIdOrThrow.mockResolvedValue({
        id: 'p1',
        name: 'Kale',
        priceCents: 200,
        stock: 1,
        reserved: 0,
        images: [],
      });
      await service.addItem('cart:user-1', 'p1', 1); // valid at add-time

      // Simulate stock dropping after the item was added — someone else
      // bought it in the meantime.
      products.findByIdOrThrow.mockResolvedValue({
        id: 'p1',
        name: 'Kale',
        priceCents: 200,
        stock: 0,
        reserved: 0,
        images: [],
      });

      const result = await service.getCart('cart:user-1');
      expect(result.items[0].inStock).toBe(false);
    });
  });
});
