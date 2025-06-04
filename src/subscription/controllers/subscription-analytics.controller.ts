import { Controller, Get, Query } from '@nestjs/common';
import { SubscriptionAnalyticsService } from '../services/subscription-analytics.service';
import { SubscriptionAnalytics } from '../interfaces/subscription-analytics.interface';

@Controller('subscription-analytics')
export class SubscriptionAnalyticsController {
  constructor(
    private readonly analyticsService: SubscriptionAnalyticsService,
  ) {}

  @Get('summary')
  async getSummary(): Promise<SubscriptionAnalytics.Summary> {
    return this.analyticsService.getSummary();
  }

  @Get('mrr')
  async getMonthlyRecurringRevenue(): Promise<{ mrr: number }> {
    const mrr = await this.analyticsService.getMonthlyRecurringRevenue();
    return { mrr };
  }

  @Get('churn-rate')
  async getChurnRate(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<{ churnRate: number }> {
    const churnRate = await this.analyticsService.getChurnRate(
      new Date(startDate),
      new Date(endDate),
    );
    return { churnRate };
  }

  @Get('plan-distribution')
  async getPlanDistribution(): Promise<
    SubscriptionAnalytics.PlanDistribution[]
  > {
    return this.analyticsService.getPlanDistribution();
  }

  @Get('growth-metrics')
  async getGrowthMetrics(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<SubscriptionAnalytics.GrowthMetrics> {
    return this.analyticsService.getGrowthMetrics(
      new Date(startDate),
      new Date(endDate),
    );
  }
}
