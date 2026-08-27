import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CouponType, Prisma } from '@prisma/client';

@Injectable()
export class CouponsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateCouponDto) {
    if (
      dto.type === CouponType.PERCENTAGE &&
      (dto.value < 1 || dto.value > 100)
    ) {
      // Can't express "1-100 only if type is PERCENTAGE, unbounded if
      // FIXED_AMOUNT" with class-validator decorators alone (they don't
      // see sibling fields) — this cross-field rule lives here instead.
      throw new BadRequestException(
        'Percentage coupons must have a value between 1 and 100',
      );
    }

    return this.prisma.coupon.create({
      data: {
        ...dto,
        code: dto.code.toUpperCase(),
      },
    });
  }

  findAll() {
    return this.prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
  }

  // Validates a coupon for a given user and cart total WITHOUT redeeming it
  // — used both for a "preview my discount" endpoint and, internally, by
  // checkout right before actually redeeming. Does NOT take a transaction
  // client, because a plain validation read has no locking requirement of
  // its own — only the actual redemption (see redeem() below) does, and
  // that always happens inside checkout's transaction, not here

  async validate(code: string, userId: string, cartTotalCents: number) {
    const coupon = await this.prisma.coupon.findUnique({
      where: {
        code: code.toUpperCase(),
      },
    });

    if (!coupon || !coupon.isActive) {
      throw new NotFoundException('Invalid coupon code');
    }

    const now = new Date();
    if (coupon.startsAt && coupon.startsAt > now) {
      throw new BadRequestException('This coupon is not active yet');
    }

    if (coupon.expiresAt && coupon.expiresAt < now) {
      throw new BadRequestException('The coupon has expires');
    }

    if (coupon.minOrderCents && cartTotalCents < coupon.minOrderCents) {
      throw new BadRequestException(
        `The coupon requires a minimum order of ${coupon.minOrderCents / 100} cents`,
      );
    }

    if (coupon.usageLimit != null) {
      const totalRedemptions = await this.prisma.couponRedemption.count({
        where: {
          couponId: coupon.id,
        },
      });

      if (totalRedemptions >= coupon.usageLimit) {
        throw new BadRequestException(
          'This coupon has reached its usage limit',
        );
      }
    }

    if (coupon.usageLimitPerUser != null) {
      const userRedemptions = await this.prisma.couponRedemption.count({
        where: { couponId: coupon.id, userId },
      });

      if (userRedemptions >= coupon.usageLimitPerUser) {
        throw new BadRequestException('You have already used this coupon');
      }
    }

    return {
      coupon,
      discountCents: this.computeDiscount(coupon, cartTotalCents),
    };
  }
  // Called from WITHIN checkout's transaction (tx), after validate() has
  // already been called once outside it (for the fast-fail UX case) —
  // this second, transactional check is what actually prevents the
  // double-redemption race. See database/concurrency.md's coupon section
  // for why BOTH calls are necessary, not redundant.
  async redeem(
    tx: Prisma.TransactionClient,
    couponId: string,
    userId: string,
    orderId: string,
  ) {
    await tx.couponRedemption.create({
      data: { couponId, userId, orderId },
    });
  }

  private computeDiscount(
    coupon: {
      type: CouponType;
      value: number;
      maxDiscountCents: number | null;
    },
    cartTotalCents: number,
  ): number {
    if (coupon.type === CouponType.FIXED_AMOUNT) {
      return Math.min(coupon.value, cartTotalCents); // never discount more than the cart is worth
    }
    // PERCENTAGE
    const raw = Math.round((cartTotalCents * coupon.value) / 100);
    return coupon.maxDiscountCents != null
      ? Math.min(raw, coupon.maxDiscountCents)
      : raw;
  }
}
