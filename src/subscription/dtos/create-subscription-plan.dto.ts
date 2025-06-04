import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsEnum,
  IsArray,
  IsOptional,
  IsObject,
} from 'class-validator';
import { BillingCycle } from '../../shared/common/enums/billing-cycle.enum';

export class CreateSubscriptionPlanDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsEnum(BillingCycle)
  @IsNotEmpty()
  billingCycle: BillingCycle;

  @IsString()
  @IsNotEmpty()
  deliveryFrequency: string;

  @IsArray()
  @IsNotEmpty()
  productIds: string[];

  @IsObject()
  @IsOptional()
  features?: Record<string, any>;
}
