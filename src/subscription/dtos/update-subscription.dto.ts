import { IsOptional, IsObject, IsNumber, IsEnum } from 'class-validator';
import { SubscriptionStatus } from '../../shared/common/enums/subscription-status.enum';

export class UpdateSubscriptionDto {
  @IsOptional()
  @IsNumber()
  billingDay?: number;

  @IsOptional()
  @IsObject()
  customizations?: Record<string, any>;

  @IsOptional()
  @IsEnum(SubscriptionStatus)
  status?: SubscriptionStatus;
}
