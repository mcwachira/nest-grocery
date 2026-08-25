import { Test, TestingModule } from '@nestjs/testing';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';

describe('CartController merge', () => {
  let controller: CartController;
  let cartService: { getCart: jest.Mock; merge: jest.Mock };

  beforeEach(async () => {
    cartService = { getCart: jest.fn(), merge: jest.fn() };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CartController],
      providers: [{ provide: CartService, useValue: cartService }],
    }).compile();
    controller = module.get<CartController>(CartController);
  });

  it('merges using the guest cookie value when present', async () => {
    const identity = { key: 'cart:user-1', isGuest: false };
    const req = { cookies: { guest_cart_id: 'g1' } } as any;
    cartService.merge.mockResolvedValueOnce({ items: [] });

    await controller.merge(identity, req);

    expect(cartService.merge).toHaveBeenCalledWith('cart:guest:g1', 'cart:user-1');
  });

  it('falls back to a plain getCart when there is no guest cookie to merge', async () => {
    const identity = { key: 'cart:user-1', isGuest: false };
    const req = { cookies: {} } as any;
    cartService.getCart.mockResolvedValueOnce({ items: [] });

    await controller.merge(identity, req);

    expect(cartService.merge).not.toHaveBeenCalled();
    expect(cartService.getCart).toHaveBeenCalledWith('cart:user-1');
  });
});