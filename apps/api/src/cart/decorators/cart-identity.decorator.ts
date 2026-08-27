import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type { Request, Response } from 'express';

const GUEST_COOKIE = 'guest_cart_id';

export interface CartIdentity {
  key: string;
  isGuest: boolean;
  guestId?: string;
}

// A custom param decorator, not a guard — cart access is deliberately NOT
// all-or-nothing like JwtAuthGuard. An unauthenticated request is a valid
// guest cart request, not a 401.
export const CartId = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): CartIdentity => {
    const req = ctx.switchToHttp().getRequest<Request>();
    const res = ctx.switchToHttp().getResponse<Response>();

    const user = (req as any).user as { userId: string } | undefined;
    if (user) {
      return { key: `cart:${user.userId}`, isGuest: false };
    }

    let guestId = req.cookies?.[GUEST_COOKIE];
    if (!guestId) {
      guestId = randomUUID();
      // NOT httpOnly — the frontend needs to read this to pass it to
      // /cart/merge after login. This is a DIFFERENT trust boundary than
      // the auth refresh cookie (modules/auth.md), which IS httpOnly — don't
      // reuse cookie logic between the two.
      res.cookie(GUEST_COOKIE, guestId, {
        httpOnly: false,
        maxAge: 30 * 24 * 60 * 60 * 1000,
        sameSite: 'lax',
      });
    }
    return { key: `cart:guest:${guestId}`, isGuest: true, guestId };
  },
);
