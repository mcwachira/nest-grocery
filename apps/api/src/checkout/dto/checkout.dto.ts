import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaymentProvider } from '@prisma/client';

export class CheckoutDto {
  @IsString()
  shippingLine1: string;
  @IsOptional()
  @IsString()
  shippingLine2?: string;
  @IsString()
  shippingCity: string;
  @IsString()
  shippingRegion: string;
  @IsOptional()
  @IsString()
  shippingPostalCode?: string;
  @IsString()
  shippingCountry: string;

  @IsEnum(PaymentProvider)
  paymentMethod: PaymentProvider; // CARD | MPESA

  // Required only when paymentMethod is MPESA — validated in the service,
  // not the DTO (a conditionally-required field, same cross-field
  // limitation as CouponsService hit).
  @IsOptional()
  @IsString()
  mpesaPhoneNumber?: string;

  @IsOptional()
  @IsString()
  couponCode?: string;
}
