import {
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  IsBoolean,
  IsDateString,
} from 'class-validator';
import { CouponType } from '@prisma/client';

export class CreateCouponDto {
  @IsString()
  code: string; //normalized to uppercase in the service

  @IsEnum(CouponType)
  type: CouponType;

  @IsInt()
  @IsPositive()
  value: number; //percentage 1-100

  @IsOptional() @IsInt() minOrderCents?: number;
  @IsOptional() @IsInt() maxDiscountCents?: number;
  @IsOptional() @IsInt() usageLimit?: number;
  @IsOptional() @IsInt() usageLimitPerUser?: number;
  @IsOptional() @IsDateString() startsAt?: string;
  @IsOptional() @IsDateString() expiresAt?: string;
  @IsOptional() @IsBoolean() isActive?: boolean;
}
