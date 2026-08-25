export const CART_TTL_SECONDS = 60 * 60 * 24 * 30; //30 DAYS REFRESH

export function cartKey(userId: string) {
  return `cart:${userId}`;
}

export interface CartItemRecord {
  productId: string;
  quantity: number;
}

export interface CartRecord {
  items: CartItemRecord[];
  updatedAt: string;
}
