import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';

// PartialType makes every field optional for PATCH, reusing all the
// same class-validator rules — don't hand-write a second DTO with
// duplicated validation.
export class UpdateProductDto extends PartialType(CreateProductDto) {}
