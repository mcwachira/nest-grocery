import { Test, TestingModule } from '@nestjs/testing';
import { CouponsService } from './coupons.service';
import { PrismaService } from '../prisma/prisma.service';
import { CouponType } from '@prisma/client';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { describe } from 'node:test';

function createPrismaMock() {
  return {
    coupon: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    couponRedemption: {
      create: jest.fn(),
      count: jest.fn(),
    },
  };
}

describe('CouponsService', () => {
  let service: CouponsService;
  let prisma: ReturnType<typeof createPrismaMock>;

  beforeEach(async () => {
    prisma = createPrismaMock();
    const module: TestingModule = await Test.createTestingModule({
      providers: [CouponsService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<CouponsService>(CouponsService);
  });

  describe('create coupon', () => {
    it('Uppercases the code before storing', async () => {
      prisma.coupon.create.mockResolvedValueOnce({});
      await service.create({
        code: 'save10',
        type: CouponType.FIXED_AMOUNT,
        value: 1000,
      });
      expect(prisma.coupon.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ code: 'SAVE10' }),
      });
    });

    it('rejects a PERCENTAGE coupon with value over 100', () => {
      expect(() =>
        service.create({
          code: 'TOOMUCH',
          type: CouponType.PERCENTAGE,
          value: 150,
        }),
      ).toThrow('Percentage coupons must have a value between 1 and 100');

      expect(prisma.coupon.create).not.toHaveBeenCalled();
    });
  });
  describe('validate coupon', () => {
    const activeCoupon = {
      id: 'c1',
      code: 'SAVE10',
      type: CouponType.FIXED_AMOUNT,
      value: 1000,
      minOrderCents: null,
      maxDiscountCents: null,
      usageLimit: null,
      usageLimitPerUser: 1,
      startsAt: null,
      expiresAt: null,
      isActive: true,
    };

    it('throws NotFoundException for an unknown code', async () => {
      prisma.coupon.findUnique.mockResolvedValueOnce(null);
      await expect(service.validate('GHOST', 'user-1', 5000)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws BadRequestException for an expired coupon', async () => {
      prisma.coupon.findUnique.mockResolvedValueOnce({
        ...activeCoupon,
        expiresAt: new Date(Date.now() - 1000),
      });
      await expect(service.validate('SAVE10', 'user-1', 5000)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('throws when the cart is under minOrderCents', async () => {
      prisma.coupon.findUnique.mockResolvedValueOnce({
        ...activeCoupon,
        minOrderCents: 10000,
      });
      await expect(service.validate('SAVE10', 'user-1', 5000)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('throws when this user has already used a usageLimitPerUser:1 coupon', async () => {
      prisma.coupon.findUnique.mockResolvedValueOnce(activeCoupon);
      prisma.couponRedemption.count.mockResolvedValueOnce(1); // already redeemed once

      await expect(service.validate('SAVE10', 'user-1', 5000)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('caps a FIXED_AMOUNT discount at the cart total, never producing a negative order', async () => {
      prisma.coupon.findUnique.mockResolvedValueOnce({
        ...activeCoupon,
        value: 10000,
      }); // KES 100 off
      prisma.couponRedemption.count.mockResolvedValueOnce(0);

      const { discountCents } = await service.validate(
        'SAVE10',
        'user-1',
        5000,
      ); // KES 50 cart

      expect(discountCents).toBe(5000); // capped at the cart total, not 10000
    });

    it('applies maxDiscountCents to cap a PERCENTAGE coupon', async () => {
      prisma.coupon.findUnique.mockResolvedValueOnce({
        ...activeCoupon,
        type: CouponType.PERCENTAGE,
        value: 50,
        maxDiscountCents: 2000,
      });
      prisma.couponRedemption.count.mockResolvedValueOnce(0);

      // 50% of 10000 = 5000, but capped at maxDiscountCents: 2000
      const { discountCents } = await service.validate(
        'SAVE10',
        'user-1',
        10000,
      );

      expect(discountCents).toBe(2000);
    });
  });
});
