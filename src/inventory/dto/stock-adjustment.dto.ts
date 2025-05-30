import { IsString, IsNotEmpty, IsNumber, IsEnum, IsOptional, MaxLength } from 'class-validator';
import { MovementType } from '../entities/stock-movement.entity';

export class StockAdjustmentDto {
  @IsString()
  @IsNotEmpty()
  inventoryItemId: string;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @IsEnum(MovementType)
  movementType: MovementType;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  referenceNumber?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
