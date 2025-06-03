import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual } from 'typeorm';
import { Subscription } from '../entities/subscription.entity';
import { SubscriptionPlan } from '../entities/subscription-plan.entity';
import { SubscriptionAnalytics } from '../interfaces/subscription-analytics.interface';

@Injectable()
export class SubscriptionAnalyticsService {
  constructor(
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
    @InjectRepository(SubscriptionPlan)
    private planRepository: Repository<SubscriptionPlan>,
  ) {}

  async getSummary(): Promise<SubscriptionAnalytics.Summary> {
    const [totalActive, totalCancelled, totalPaused] = await Promise.all([
      this.subscriptionRepository.count({ where: { status: 'active' } }),
      this.subscriptionRepository.count({ where: { status: 'cancelled' } }),
      this.subscriptionRepository.count({ where: { status: 'paused' } }),
    ]);

    return {
      totalActive,
      totalCancelled,
      totalPaused,
      totalSubscriptions: totalActive + totalCancelled + totalPaused,
    };
  }

  async getMonthlyRecurringRevenue(): Promise<number> {
    const result = await this.subscriptionRepository
      .createQueryBuilder('s')
      .select('SUM(p.price)', 'mrr')
      .leftJoin('s.plan', 'p')
      .where('s.status = :status', { status: 'active' })
      .getRawOne();

    return parseFloat(result.mrr) || 0;
  }

  async getChurnRate(startDate: Date, endDate: Date): Promise<number> {
    const [cancelledCount, activeAtStart] = await Promise.all([
      this.subscriptionRepository.count({
        where: {
          status: 'cancelled',
          endDate: Between(startDate, endDate),
        },
      }),
      this.subscriptionRepository.count({
        where: {
          status: 'active',
          startDate: LessThanOrEqual(startDate),
        },
      }),
    ]);

    return activeAtStart > 0 ? (cancelledCount / activeAtStart) * 100 : 0;
  }

  async getPlanDistribution(): Promise<
    SubscriptionAnalytics.PlanDistribution[]
  > {
    return this.subscriptionRepository
      .createQueryBuilder('s')
      .select('p.name', 'planName')
      .addSelect('COUNT(s.id)', 'count')
      .addSelect('SUM(p.price)', 'revenue')
      .leftJoin('s.plan', 'p')
      .where('s.status = :status', { status: 'active' })
      .groupBy('p.name')
      .getRawMany();
  }

  async getGrowthMetrics(
    startDate: Date,
    endDate: Date,
  ): Promise<SubscriptionAnalytics.GrowthMetrics> {
    const [newSubs, cancelledSubs] = await Promise.all([
      this.subscriptionRepository.count({
        where: {
          status: 'active',
          startDate: Between(startDate, endDate),
        },
      }),
      this.subscriptionRepository.count({
        where: {
          status: 'cancelled',
          endDate: Between(startDate, endDate),
        },
      }),
    ]);

    return {
      newSubscriptions: newSubs,
      cancelledSubscriptions: cancelledSubs,
      netGrowth: newSubs - cancelledSubs,
    };
  }
}
