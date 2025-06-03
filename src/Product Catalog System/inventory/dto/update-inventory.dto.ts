import { IsNumber, IsOptional } from 'class-validator';

export class UpdateInventoryDto {
  @IsOptional()
  @IsNumber()
  stockQuantity?: number;

  @IsOptional()
  @IsNumber()
  reservedQuantity?: number;

  @IsOptional()
  @IsNumber()
  reorderLevel?: number;

  @IsOptional()
  @IsNumber()
  maxStockLevel?: number;
}