import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Injectable()
export class InventoryService {
  // Every method here takes a Prisma transaction client (`tx`), not the
  // module-level PrismaService — these operations are ALWAYS meant to run
  // inside a transaction that some other module (checkout, payments) owns
  // and controls the boundaries of. See database/transactions.md. This
  // service deliberately has no `prisma: PrismaService` constructor
  // dependency at all, to make it structurally awkward to accidentally
  // call one of these methods outside a transaction.

  // Locks the product row and reserves `quantity` units, or throws if not
  // enough is available. Must be called inside an open transaction — the
  // row lock (FOR UPDATE) is only meaningful as long as the surrounding
  // transaction holds it. See database/concurrency.md for the full proof
  // of why this specific query shape prevents overselling.

  async reserve(
    tx: Prisma.TransactionClient,
    productId: string,
    quantity: number,
  ) {
    const rows = await tx.$queryRaw<
      {
        id: string;
        name: string;
        reserved: number;
        stock: number;
      }[]
    >`SELECT id, name, reserved, stock FROM products WHERE id = ${productId} FOR UPDATE`;

    const product = rows[0];
    if (!product) {
      throw new BadRequestException(`Product ${productId} not found`);
    }

    const available = product.stock - product.reserved;
    if (available < quantity) {
      throw new BadRequestException(`"${product.name}" is out of stock`);
    }

    await tx.product.update({
      where: { id: productId },
      data: { reserved: { increment: quantity } },
    });
  }

  //Turns a reservation into a real sale by deducting the reserved units
  //from the stock level. Must be called inside an open transaction.
  //CALL THIS WHEN A PAYMENT IS CONFIRMED!
  async confirm(
    tx: Prisma.TransactionClient,
    productId: string,
    quantity: number,
  ) {
    await tx.product.update({
      where: { id: productId },
      data: {
        stock: { decrement: quantity },
        reserved: { decrement: quantity },
      },
    });
  }
  // Gives a reservation back WITHOUT touching stock — call this when a
  // payment fails, is abandoned, or a reservation times out. stock was
  // never decremented by reserve(), so there's nothing to restore, only
  // the hold to release.
  async release(
    tx: Prisma.TransactionClient,
    productId: string,
    quantity: number,
  ) {
    await tx.product.update({
      where: { id: productId },
      data: { reserved: { decrement: quantity } },
    });
  }

  // Convenience for read paths (product listing, cart hydration) — the
  // number that should actually be shown/compared against, never raw
  // `stock`. See architecture/inventory-flow.md.
  static available(product: { stock: number; reserved: number }): number {
    return product.stock - product.reserved;
  }
}
