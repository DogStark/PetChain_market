
import { IsNotEmpty, IsUUID, IsNumber, IsString, IsOptional, IsObject } from 'class-validator';

export class PaymentDto {
  @IsUUID()
  @IsNotEmpty()
  customerId: string;

  @IsUUID()
  @IsOptional()
  orderId?: string;

  @IsUUID()
  @IsOptional()
  subscriptionId?: string;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsNotEmpty()
  currency: string;

  @IsString()
  @IsNotEmpty()
  paymentMethod: string;

  @IsObject()
  @IsOptional()
  paymentDetails?: Record<string, any>;
}