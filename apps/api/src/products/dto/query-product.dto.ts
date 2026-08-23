import { Type } from 'class-transformer';
import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';

export class QueryProductDto {
  @IsOptional()
  @IsString()
  category?: string; // category slug

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  organic?: boolean;

  @IsOptional()
  @IsUUID()
  exclude?: string; // used by the "related products" query

  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  limit?: number = 20;
}
