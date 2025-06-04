import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription } from '../entities/subscription.entity';
import { PaymentService } from '../../payment/services/payment.service';
import { Payment } from '../../payment/entities/payment.entity';
import { SubscriptionEvent } from '../entities/subscription-event.entity';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(SubscriptionEvent)
    private eventRepository: Repository<SubscriptionEvent>,
    private paymentService: PaymentService,
  ) {}

  async processPayment(params: {
    customerId: string;
    amount: number;
    description: string;
    subscriptionId: string;
  }): Promise<Payment> {
    try {
      const payment = await this.paymentService.createPayment({
        customerId: params.customerId,
        amount: params.amount,
        currency: 'USD',
        paymentMethod: 'card',
        description: params.description,
        subscriptionId: params.subscriptionId,
      });

      await this.eventRepository.save({
        subscription: { id: params.subscriptionId },
        eventType: 'payment.processed',
        payload: {
          paymentId: payment.id,
          amount: payment.amount,
          status: payment.status,
        },
      });

      return payment;
    } catch (error) {
      this.logger.error(
        `Payment failed for subscription ${params.subscriptionId}: ${error.message}`,
      );

      await this.eventRepository.save({
        subscription: { id: params.subscriptionId },
        eventType: 'payment.failed',
        payload: {
          error: error.message,
          amount: params.amount,
        },
      });

      throw error;
    }
  }

  async getBillingHistory(subscriptionId: string): Promise<Payment[]> {
    return this.paymentRepository.find({
      where: { subscription: { id: subscriptionId } },
      order: { createdAt: 'DESC' },
    });
  }
}
