import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subscription } from './entities/subscription.entity';
import { SubscriptionPlan } from './entities/subscription-plan.entity';
import { SubscriptionEvent } from './entities/subscription-event.entity';
import { SubscriptionService } from './services/subscription.service';
import { SubscriptionPlanService } from './services/subscription-plan.service';
import { BillingService } from './services/billing.service';
import { SubscriptionAnalyticsService } from './services/subscription-analytics.service';
import { SubscriptionEventsService } from './services/subscription-events.service';
import { SubscriptionController } from './controllers/subscription.controller';
import { SubscriptionPlanController } from './controllers/subscription-plan.controller';
import { SubscriptionAnalyticsController } from './controllers/subscription-analytics.controller';
import { CustomerModule } from '../../customer/customer.module';
import { PaymentModule } from '../../payment/payment.module';
import { OrderModule } from '../../order/order.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Subscription,
      SubscriptionPlan,
      SubscriptionEvent,
    ]),
    CustomerModule,
    PaymentModule,
    OrderModule,
    HttpModule,
  ],
  providers: [
    SubscriptionService,
    SubscriptionPlanService,
    BillingService,
    SubscriptionAnalyticsService,
    SubscriptionEventsService,
  ],
  controllers: [
    SubscriptionController,
    SubscriptionPlanController,
    SubscriptionAnalyticsController,
  ],
  exports: [SubscriptionService, SubscriptionPlanService],
})
export class SubscriptionModule {}
