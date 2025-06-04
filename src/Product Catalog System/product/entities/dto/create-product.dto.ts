import { IsString, IsNumber, IsOptional, IsArray, ValidateNested, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductVariantDto {
  @IsString()
  size: string;

  @IsString()
  color: string;

  @IsString()
  sku: string;

  @IsOptional()
  @IsNumber()
  priceAdjustment?: number;

  @IsNumber()
  stockQuantity: number;
}

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsNumber()
  price: number;

  @IsString()
  sku: string;

  @IsNumber()
  categoryId: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductVariantDto)
  variants?: CreateProductVariantDto[];

  @IsOptional()
  @IsNumber()
  initialStock?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}