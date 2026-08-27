export const CART_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days, refreshed on every write

export function cartKeyForUser(userId: string) {
  return `cart:${userId}`;
}
export function cartKeyForGuest(guestId: string) {
  return `cart:guest:${guestId}`;
}

export interface CartItemRecord {
  productId: string;
  quantity: number;
}
export interface CartRecord {
  items: CartItemRecord[];
  updatedAt: string;
}
