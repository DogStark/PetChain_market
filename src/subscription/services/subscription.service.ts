import { Injectable, NotFoundException, Logger, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual } from 'typeorm';
import { Subscription } from '../entities/subscription.entity';
import { SubscriptionPlan } from '../entities/subscription-plan.entity';
import { Customer } from '../../customer/entities/customer.entity';
import { CreateSubscriptionDto } from '../dtos/create-subscription.dto';
import { UpdateSubscriptionDto } from '../dtos/update-subscription.dto';
import { SubscriptionStatus } from '../../shared/common/enums/subscription-status.enum';
import { BillingService } from './billing.service';
import { OrderService } from '../../order/services/order.service';
import { SubscriptionResponseDto } from '../dtos/subscription-response.dto';
import { SubscriptionEvent } from '../entities/subscription-event.entity';
import { SubscriptionEventsService } from './subscription-events.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class SubscriptionService {
  private readonly logger = new Logger(SubscriptionService.name);

  constructor(
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
    @InjectRepository(SubscriptionPlan)
    private planRepository: Repository<SubscriptionPlan>,
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    @InjectRepository(SubscriptionEvent)
    private eventRepository: Repository<SubscriptionEvent>,
    private billingService: BillingService,
    private orderService: OrderService,
    private eventsService: SubscriptionEventsService,
  ) {}

  async create(
    createDto: CreateSubscriptionDto,
  ): Promise<SubscriptionResponseDto> {
    const [customer, plan] = await Promise.all([
      this.customerRepository.findOneBy({ id: createDto.customerId }),
      this.planRepository.findOneBy({ id: createDto.planId }),
    ]);

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    if (!plan) {
      throw new NotFoundException('Subscription plan not found');
    }

    const subscription = this.subscriptionRepository.create({
      customer,
      plan,
      startDate: new Date(createDto.startDate),
      billingDay: createDto.billingDay,
      customizations: createDto.customizations || null,
      status: SubscriptionStatus.ACTIVE,
      nextBillingDate: this.calculateNextBillingDate(
        new Date(createDto.startDate),
        plan,
      ),
    });

    const savedSubscription =
      await this.subscriptionRepository.save(subscription);

    await this.eventsService.emitEvent(
      savedSubscription.id,
      'subscription.created',
      { subscription: savedSubscription },
    );

    return this.mapToResponseDto(savedSubscription);
  }

  async findOne(id: string): Promise<SubscriptionResponseDto> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { id },
      relations: ['customer', 'plan'],
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    return this.mapToResponseDto(subscription);
  }

  async update(
    id: string,
    updateDto: UpdateSubscriptionDto,
  ): Promise<SubscriptionResponseDto> {
    const subscription = await this.subscriptionRepository.findOneBy({ id });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    const updates: Partial<Subscription> = {};

    if (updateDto.billingDay !== undefined) {
      updates.billingDay = updateDto.billingDay;
      updates.nextBillingDate = this.calculateNextBillingDate(
        subscription.nextBillingDate || subscription.startDate,
        subscription.plan,
        updateDto.billingDay,
      );
    }

    if (updateDto.customizations !== undefined) {
      updates.customizations = {
        ...(subscription.customizations || {}),
        ...updateDto.customizations,
      };
    }

    if (updateDto.status !== undefined) {
      updates.status = updateDto.status;

      if (updateDto.status === SubscriptionStatus.CANCELLED) {
        updates.endDate = new Date();
      }
    }

    await this.subscriptionRepository.update(id, updates);

    const updatedSubscription = await this.subscriptionRepository.findOne({
      where: { id },
      relations: ['customer', 'plan'],
    });

    await this.eventsService.emitEvent(id, 'subscription.updated', {
      updates,
      subscription: updatedSubscription,
    });

    return this.mapToResponseDto(updatedSubscription);
  }

  async cancel(id: string): Promise<SubscriptionResponseDto> {
    return this.update(id, { status: SubscriptionStatus.CANCELLED });
  }

  async pause(id: string): Promise<SubscriptionResponseDto> {
    return this.update(id, { status: SubscriptionStatus.PAUSED });
  }

  async resume(id: string): Promise<SubscriptionResponseDto> {
    const subscription = await this.subscriptionRepository.findOneBy({ id });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    if (subscription.status !== SubscriptionStatus.PAUSED) {
      throw new Error('Only paused subscriptions can be resumed');
    }

    const nextBillingDate = this.calculateNextBillingDate(
      new Date(),
      subscription.plan,
    );

    await this.subscriptionRepository.update(id, {
      status: SubscriptionStatus.ACTIVE,
      nextBillingDate,
    });

    const updatedSubscription = await this.subscriptionRepository.findOne({
      where: { id },
      relations: ['customer', 'plan'],
    });

    await this.eventsService.emitEvent(id, 'subscription.resumed', {
      subscription: updatedSubscription,
    });

    return this.mapToResponseDto(updatedSubscription);
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async processRecurringSubscriptions() {
    this.logger.log('Processing recurring subscriptions...');

    const today = new Date();
    const activeSubscriptions = await this.subscriptionRepository.find({
      where: { status: SubscriptionStatus.ACTIVE },
      relations: ['customer', 'plan'],
    });

    for (const subscription of activeSubscriptions) {
      try {
        if (this.isBillingDay(subscription, today)) {
          await this.processSubscriptionBilling(subscription);
        }
      } catch (error) {
        this.logger.error(
          `Failed to process subscription ${subscription.id}: ${error.message}`,
        );
        await this.handleBillingError(subscription, error);
      }
    }
  }

  private async processSubscriptionBilling(subscription: Subscription) {
    // Process payment
    const payment = await this.billingService.processPayment({
      customerId: subscription.customer.id,
      amount: subscription.plan.price,
      description: `Subscription payment for ${subscription.plan.name}`,
      subscriptionId: subscription.id,
    });

    // Create order
    const order = await this.orderService.createFromSubscription(subscription);

    // Update subscription
    await this.subscriptionRepository.update(subscription.id, {
      lastPaymentDate: new Date(),
      nextBillingDate: this.calculateNextBillingDate(
        subscription.nextBillingDate || subscription.startDate,
        subscription.plan,
      ),
      paymentFailureCount: 0,
      lastPaymentError: null,
    });

    await this.eventsService.emitEvent(subscription.id, 'subscription.billed', {
      payment,
      order,
    });

    return { payment, order };
  }

  private async handleBillingError(subscription: Subscription, error: Error) {
    const failureCount = (subscription.paymentFailureCount || 0) + 1;

    await this.subscriptionRepository.update(subscription.id, {
      paymentFailureCount: failureCount,
      lastPaymentError: error.message,
    });

    if (failureCount >= 3) {
      await this.subscriptionRepository.update(subscription.id, {
        status: SubscriptionStatus.CANCELLED,
        endDate: new Date(),
      });

      await this.eventsService.emitEvent(
        subscription.id,
        'subscription.failed',
        { error: error.message, failureCount },
      );
    }
  }

  private isBillingDay(subscription: Subscription, date: Date): boolean {
    return date.getDate() === subscription.billingDay;
  }

  private calculateNextBillingDate(
    fromDate: Date,
    plan: SubscriptionPlan,
    billingDay?: number,
  ): Date {
    const nextDate = new Date(fromDate);
    const day = billingDay || (subscription as any).billingDay; // Handle both plan and subscription cases

    switch (plan.billingCycle) {
      case 'weekly':
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      case 'quarterly':
        nextDate.setMonth(nextDate.getMonth() + 3);
        break;
      case 'yearly':
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        break;
    }

    // Ensure billing day is correct (e.g., don't set Feb 30)
    const daysInMonth = new Date(
      nextDate.getFullYear(),
      nextDate.getMonth() + 1,
      0,
    ).getDate();
    nextDate.setDate(Math.min(day, daysInMonth));

    return nextDate;
  }

  private mapToResponseDto(
    subscription: Subscription,
  ): SubscriptionResponseDto {
    return {
      id: subscription.id,
      customerId: subscription.customer.id,
      planId: subscription.plan.id,
      planName: subscription.plan.name,
      planPrice: subscription.plan.price,
      billingCycle: subscription.plan.billingCycle,
      status: subscription.status,
      startDate: subscription.startDate,
      endDate: subscription.endDate,
      nextBillingDate: subscription.nextBillingDate,
      lastPaymentDate: subscription.lastPaymentDate,
      billingDay: subscription.billingDay,
      customizations: subscription.customizations,
      createdAt: subscription.createdAt,
      updatedAt: subscription.updatedAt,
    };
  }
}
