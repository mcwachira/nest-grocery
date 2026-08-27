import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CartService } from '../cart/cart.service';
import { InventoryService } from '../inventory/inventory.service';
import { CouponsService } from '../coupons/coupons.service';
import { CheckoutDto } from './dto/checkout.dto';
import {
  PAYMENT_PROVIDER,
  PaymentProvider,
} from '../payments/payment.provider.interface';
import { PaymentProvider as PaymentProviderEnum } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { cartKeyForUser } from '../cart/cart.constants';

@Injectable()
export class CheckoutService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cart: CartService,
    private readonly inventory: InventoryService,
    private readonly coupons: CouponsService,

    @Inject(PAYMENT_PROVIDER)
    private readonly paymentProviders: Record<
      PaymentProviderEnum,
      PaymentProvider
    >,
    private readonly config: ConfigService,
  ) {}

  getConfig() {
    return {
      paystackPublicKey: this.config.get('PAYSTACK_PUBLIC_KEY'), // ONLY NEEDED IF USING PAYSTACK  INLINE
      deliveryFeeCents: Number(this.config.get('DELIVERY_FEE_CENTS')),
    };
  }

  async checkout(userId: string, dto: CheckoutDto) {
    const cartKey = cartKeyForUser(userId);
    const currentCart = await this.cart.getCart(cartKey);

    if (currentCart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    if (
      dto.paymentMethod === PaymentProviderEnum.MPESA &&
      !dto.mpesaPhoneNumber
    ) {
      throw new BadRequestException('M-Pesa phone number is required');
    }
    const deliveryFeeCents = Number(this.config.get('DELIVERY_FEE_CENTS'));

    // Validate the coupon OUTSIDE the transaction first — fast-fail UX,
    // no point opening a transaction for a request that's going to reject
    // anyway. Re-validated + actually redeemed INSIDE the transaction
    // below — see database/concurrency.md's coupon-redemption race.
    let couponResult: {
      coupon: { id: string; code: string };
      discountCents: number;
    } | null = null;
    if (dto.couponCode) {
      const cartTotalCents = currentCart.items.reduce(
        (s, i) => s + i.subtotalCents,
        0,
      );
      couponResult = await this.coupons.validate(
        dto.couponCode,
        userId,
        cartTotalCents,
      );
    }

    // Everything below runs in ONE Postgres transaction — see
    // database/transactions.md for exactly why, and
    // database/concurrency.md for the row-locking proof this depends on.
    const { order, itemsForPayment } = await this.prisma.$transaction(
      async (tx) => {
        let subtotalCents = 0;
        const itemsData: {
          productId: string;
          productName: string;
          unitPriceCents: number;
          quantity: number;
          subtotalCents: number;
        }[] = [];

        for (const item of currentCart.items) {
          // Lock + reserve — see modules/inventory.md. This is the ONLY
          // place stock re-validation is actually authoritative; the cart's
          // own check (modules/cart.md) is a UX nicety, not this guarantee.
          await this.inventory.reserve(tx, item.productId, item.quantity);

          const product = await tx.product.findUniqueOrThrow({
            where: { id: item.productId },
          });
          const lineSubtotal = product.priceCents * item.quantity;
          subtotalCents += lineSubtotal;
          itemsData.push({
            productId: product.id,
            productName: product.name, // snapshot — database/schema.md Conventions
            unitPriceCents: product.priceCents,
            quantity: item.quantity,
            subtotalCents: lineSubtotal,
          });
        }
        // Never trust dto/cart-derived totals for the actual charge — always
        // recompute from what was just re-priced above. Coupon is the only
        // discount mechanism in this schema — see modules/coupons.md.
        const discountCents = couponResult?.discountCents ?? 0;
        const totalCents = Math.max(
          0,
          subtotalCents + deliveryFeeCents - discountCents,
        );

        const created = await tx.order.create({
          data: {
            userId,
            status: 'PENDING_PAYMENT',
            totalCents,
            deliveryFeeCents,
            couponCode: couponResult?.coupon.code ?? null,
            discountCents,
            shippingLine1: dto.shippingLine1,
            shippingLine2: dto.shippingLine2,
            shippingCity: dto.shippingCity,
            shippingRegion: dto.shippingRegion,
            shippingPostalCode: dto.shippingPostalCode,
            shippingCountry: dto.shippingCountry,
            items: { create: itemsData },
            payments: {
              create: {
                provider: dto.paymentMethod,
                status: 'PENDING',
                amountCents: totalCents,
              },
            },
          },
          include: { items: true, payments: true },
        });

        if (couponResult) {
          await this.coupons.redeem(
            tx,
            couponResult.coupon.id,
            userId,
            created.id,
          );
        }

        return { order: created, itemsForPayment: itemsData };
      },
    );

    // Payment provider call is DELIBERATELY outside the transaction — see
    // database/transactions.md for exactly why.
    const provider = this.paymentProviders[dto.paymentMethod];
    const paymentResult = await provider.initiate({
      amountCents: order.totalCents,
      orderId: order.id,
      phoneNumber: dto.mpesaPhoneNumber,
    });

    await this.prisma.payment.update({
      where: { id: order.payments[0].id },
      data: { providerReference: paymentResult.providerReference },
    });

    await this.cart.clear(cartKeyForUser(userId));

    return {
      orderId: order.id,
      ...paymentResult.clientPayload, // clientSecret (CARD) | checkoutRequestId (MPESA)
    };
  }
}
 