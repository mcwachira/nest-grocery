import { IsInt, IsString, Min } from 'class-validator';

export class ValidateCouponDto {
  @IsString()
  code: string;

  @IsInt()
  @Min(0)
  cartTotalCents: number;
}
