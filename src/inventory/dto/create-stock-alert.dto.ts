import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum, IsBoolean } from 'class-validator';
import { AlertType } from '../entities/stock-alert.entity';

export class CreateStockAlertDto {
  @IsString()
  @IsNotEmpty()
  inventoryItemId: string;

  @IsEnum(AlertType)
  alertType: AlertType;

  @IsNumber()
  @IsOptional()
  thresholdValue?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;
}