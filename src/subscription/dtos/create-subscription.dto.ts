import { IsNotEmpty, IsUUID, IsDateString, IsNumber, IsOptional, IsObject } from 'class-validator';
import { BillingCycle } from '../../shared/common/enums/billing-cycle.enum';

export class CreateSubscriptionDto {
  @IsUUID()
  @IsNotEmpty()
  customerId: string;

  @IsUUID()
  @IsNotEmpty()
  planId: string;

  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @IsNumber()
  @IsNotEmpty()
  billingDay: number;

  @IsObject()
  @IsOptional()
  customizations?: Record<string, any>;
}