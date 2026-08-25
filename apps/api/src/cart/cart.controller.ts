import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { IsInt, IsUUID, Min } from 'class-validator';
import { CartService } from './cart.service';
import { CartId, CartIdentity } from './decorators/cart-identity.decorator';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

class AddItemDto {
  @IsUUID() productId: string;
  @IsInt() @Min(1) quantity: number;
}
class SetQuantityDto {
  @IsInt() @Min(0) quantity: number;
}

// OptionalJwtAuthGuard runs on every route here so req.user is populated
// WHEN a valid token is present, without ever rejecting an anonymous
// request.
@UseGuards(OptionalJwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private readonly cart: CartService) {}

  @Get()
  get(@CartId() identity: CartIdentity) {
    return this.cart.getCart(identity.key);
  }

  @Post('items')
  add(@CartId() identity: CartIdentity, @Body() dto: AddItemDto) {
    return this.cart.addItem(identity.key, dto.productId, dto.quantity);
  }

  @Patch('items/:productId')
  setQuantity(
    @CartId() identity: CartIdentity,
    @Param('productId') productId: string,
    @Body() dto: SetQuantityDto,
  ) {
    return this.cart.setItemQuantity(identity.key, productId, dto.quantity);
  }

  @Delete('items/:productId')
  remove(
    @CartId() identity: CartIdentity,
    @Param('productId') productId: string,
  ) {
    return this.cart.removeItem(identity.key, productId);
  }

  @Delete()
  clear(@CartId() identity: CartIdentity) {
    return this.cart.clear(identity.key);
  }

  // Requires a REAL logged-in user, unlike every other route above —
  // merging only makes sense right after a successful login.
  @UseGuards(JwtAuthGuard)
  @Post('merge')
  merge(@CartId() identity: CartIdentity, @Req() req: Request) {
    const guestId = req.cookies?.['guest_cart_id'];
    if (!guestId) return this.cart.getCart(identity.key); // nothing to merge
    return this.cart.merge(`cart:guest:${guestId}`, identity.key);
  }
}
