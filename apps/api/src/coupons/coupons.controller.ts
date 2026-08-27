import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CouponsService } from './coupons.service';
import { ValidateCouponDto } from './dto/validate-coupon.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateCouponDto } from './dto/create-coupon.dto';

@Controller('coupons')
export class CouponsController {
  constructor(private readonly coupons: CouponsService) {}

  //Lets the storefront show "Discount applied: KES X" before the customer commits to check out, without actually redeeming anything

  @UseGuards(JwtAuthGuard)
  @Post('validate')
  async validate(
    @Req() req: Request & { user: { userId: string } },
    @Body() dto: ValidateCouponDto,
  ) {
    const { discountCents } = await this.coupons.validate(
      dto.code,
      req.user.userId,
      dto.cartTotalCents,
    );
    return { valid: true, discountCents };
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get()
  findAll() {
    return this.coupons.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post()
  create(@Body() dto: CreateCouponDto) {
    return this.coupons.create(dto);
  }
}
