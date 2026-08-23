import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  slug: string;
  @IsString()
  description: string;

  // Client sends price in whole currency units for readability
  // (e.g. 150.00); the service layer converts to cents before hitting
  // the DB — see ProductsService.create below. Keep the conversion in
  // ONE place, not scattered across controller/service/frontend.

  @IsInt()
  @Min(0)
  priceCents: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  compareAtPriceCents?: number;

  @IsString()
  unit: string;

  @IsInt()
  @Min(0)
  stock: number;

  @IsOptional()
  @IsBoolean()
  isOrganic?: boolean;

  @IsUUID()
  categoryId: string;
}
