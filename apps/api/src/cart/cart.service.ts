import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { REDIS_CLIENT } from '../redis/redis.module';
import { ProductsService } from '../products/products.service';
import Redis from 'ioredis';
import { InventoryService } from '../inventory/inventory.service';
import { CART_TTL_SECONDS, CartRecord } from './cart.constants';

@Injectable()
export class CartService {
  constructor(
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    private readonly products: ProductsService,
  ) {}

  async getCart(key: string) {
    const record = await this.readRaw(key);
    return this.hydrate(record);
  }

  async addItem(key: string, productId: any, quantity: number) {
    const record = await this.readRaw(key);
    const existing = record.items.find((item) => item.productId === productId);

    // Re-validate stock server-side on every write — the frontend showing
    // "in stock" is not enough. The client can send any quantity it wants;
    // only the API's view of current stock counts. This is a UX check,
    // NOT the actual overselling guarantee — see modules/checkout.md.

    const product = await this.products.findByIdOrThrow(productId);
    const available = InventoryService.available(product);
    const newQuantity = (existing?.quantity ?? 0) + quantity;

    if (newQuantity > available) {
      throw new BadRequestException(`Only ${available} quantity is in stock`);
    }

    if (existing) {
      existing.quantity = newQuantity;
    } else {
      record.items.push({ productId, quantity });
    }

    await this.writeRaw(key, record);
    return this.hydrate(record);
  }

  async setItemQuantity(key: string, productId: string, quantity: number) {
    const record = await this.readRaw(key);

    if (quantity <= 0) {
      record.items = record.items.filter(
        (item) => item.productId !== productId,
      );
    } else {
      const product = await this.products.findByIdOrThrow(productId);
      const available = InventoryService.available(product);

      if (quantity > available) {
        throw new BadRequestException(`Only ${available} quantity is in stock`);
      }

      const existing = record.items.find(
        (item) => item.productId === productId,
      );
      if (existing) existing.quantity = quantity;
      else record.items.push({ productId, quantity });
    }

    await this.writeRaw(key, record);
    return this.hydrate(record);
  }

  async removeItem(key: string, productId: string) {
    return this.setItemQuantity(key, productId, 0);
  }

  async clear(key: string) {
    await this.redis.del(key);
  }

  async merge(guestKey: string, userKey: string) {
    const guestRecord = await this.readRaw(guestKey);
    if (guestRecord.items.length === 0) return this.getCart(userKey);

    const userRecord = await this.readRaw(userKey);
    for (const guestItem of guestRecord.items) {
      const existing = userRecord.items.find(
        (item) => item.productId === guestItem.productId,
      );

      if (existing)
        existing.quantity += guestItem.quantity; //Sum overlapping quantities
      else userRecord.items.push(guestItem);
    }

    await this.writeRaw(userKey, userRecord);
    await this.redis.del(guestKey); //guest cart is fully consumed
    return this.hydrate(userRecord);
  }

  // --- internals ---

  private async readRaw(key: string): Promise<CartRecord> {
    const raw = await this.redis.get(key);
    return raw
      ? JSON.parse(raw)
      : { items: [], updatedAt: new Date().toISOString() };
  }

  private async writeRaw(key: string, record: CartRecord) {
    record.updatedAt = new Date().toISOString();
    // EX refreshes the TTL on every write — an actively-used cart never
    // expires mid-session; an abandoned one cleans itself up after 30
    // days with zero cron job needed.
    await this.redis.set(key, JSON.stringify(record), 'EX', CART_TTL_SECONDS);
  }

  // Resolves current price/name/image/available stock from Product for
  // every item — the cart record itself only ever stores {productId,
  // quantity}. This is what guarantees cart totals never reflect a stale
  // price.
  private async hydrate(record: CartRecord) {
    const items = await Promise.all(
      record.items.map(async (item) => {
        const product = await this.products.findByIdOrThrow(item.productId);
        const available = InventoryService.available(product);
        return {
          productId: item.productId,
          quantity: item.quantity,
          name: product.name,
          priceCents: product.priceCents,
          image: product.images[0]?.url ?? null,
          subtotalCents: product.priceCents * item.quantity,
          inStock: available >= item.quantity,
        };
      }),
    );
    const totalCents = items.reduce((sum, i) => sum + i.subtotalCents, 0);
    return { items, totalCents, updatedAt: record.updatedAt };
  }
}
