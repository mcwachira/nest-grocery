import { Test, TestingModule } from '@nestjs/testing';
import { CouponsController } from './coupons.controller';
import { CouponsService } from './coupons.service';

describe('CouponsController', () => {
  let controller: CouponsController;
  let couponsService: {
    validate: jest.Mock;
    findAll: jest.Mock;
    create: jest.Mock;
  };

  beforeEach(async ()  => {
 couponsService = {
      validate: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CouponsController],
      providers: [{ provide: CouponsService, useValue: couponsService }],
    }).compile();

    controller = module.get<CouponsController>(CouponsController);
  });

  it('validate reads the userId from the guarded request, not the request body', async () => {
    couponsService.validate.mockResolvedValueOnce({
      coupon: {},
      discountCents: 500,
    });
    const req = { user: { userId: 'user-1' } } as any;

    await controller.validate(req, { code: 'SAVE10', cartTotalCents: 5000 });

    expect(couponsService.validate).toHaveBeenCalledWith(
      'SAVE10',
      'user-1',
      5000,
    );
  });

  it('validate response never includes internal coupon fields, only { valid, discountCents }', async () => {
    couponsService.validate.mockResolvedValueOnce({
      coupon: { id: 'c1', usageLimitPerUser: 1 }, // internal detail
      discountCents: 500,
    });
    const req = { user: { userId: 'user-1' } } as any;

    const result = await controller.validate(req, {
      code: 'SAVE10',
      cartTotalCents: 5000,
    });

    expect(result).toEqual({ valid: true, discountCents: 500 });
    expect(result).not.toHaveProperty('coupon');
  });
});
