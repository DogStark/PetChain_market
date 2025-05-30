import { IsString, IsNotEmpty, IsOptional, IsNumber, IsPositive, MaxLength, Min } from 'class-validator';

export class CreateInventoryItemDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  sku: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  categoryId?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  unitOfMeasure?: string = 'piece';

  @IsNumber()
  @IsOptional()
  @Min(0)
  currentStock?: number = 0;

  @IsNumber()
  @IsOptional()
  @Min(0)
  reorderPoint?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  maxStockLevel?: number;

  @IsNumber()
  @IsOptional()
  @IsPositive()
  unitCost?: number;

  @IsNumber()
  @IsOptional()
  @IsPositive()
  sellingPrice?: number;

  @IsString()
  @IsOptional()
  supplierId?: string;
}