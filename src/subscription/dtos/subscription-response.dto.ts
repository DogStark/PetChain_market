import { SubscriptionStatus } from '../../shared/common/enums/subscription-status.enum';
import { BillingCycle } from '../../shared/common/enums/billing-cycle.enum';

export class SubscriptionResponseDto {
  id: string;
  customerId: string;
  planId: string;
  planName: string;
  planPrice: number;
  billingCycle: BillingCycle;
  status: SubscriptionStatus;
  startDate: Date;
  endDate: Date | null;
  nextBillingDate: Date | null;
  lastPaymentDate: Date | null;
  billingDay: number;
  customizations: Record<string, any> | null;
  createdAt: Date;
  updatedAt: Date;
}