import { IsOptional, IsString, IsEnum, IsDateString } from 'class-validator';
import { MovementType } from '../entities/stock-movement.entity';

export class StockMovementFilterDto {
  @IsOptional()
  @IsString()
  inventoryItemId?: string;

  @IsOptional()
  @IsEnum(MovementType)
  movementType?: MovementType;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  referenceNumber?: string;
}