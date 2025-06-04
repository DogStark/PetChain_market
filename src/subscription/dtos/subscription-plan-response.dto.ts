import { BillingCycle } from '../../shared/common/enums/billing-cycle.enum';

export class SubscriptionPlanResponseDto {
  id: string;
  name: string;
  description: string;
  price: number;
  billingCycle: BillingCycle;
  deliveryFrequency: string;
  isActive: boolean;
  productIds: string[];
  features: Record<string, any> | null;
  createdAt: Date;
}
