import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { LoyaltyService } from './loyalty.service';

@Controller('loyalty')
export class LoyaltyController {
  constructor(private readonly loyaltyService: LoyaltyService) {}

  // Get total points for a customer
  @Get('points/:customerId')
  async getTotalPoints(@Param('customerId', ParseIntPipe) customerId: number) {
    return {
      totalPoints: await this.loyaltyService.getCustomerTotalPoints(customerId),
    };
  }

  // Earn points (generic)
  @Post('earn')
  async earnPoints(
    @Body()
    body: { customerId: number; points: number; description?: string },
  ) {
    const { customerId, points, description } = body;
    if (points <= 0) throw new BadRequestException('Points must be positive');
    return this.loyaltyService.earnPoints(customerId, points, description);
  }

  // Earn points from purchase
  @Post('earn/purchase')
  async earnPointsFromPurchase(
    @Body() body: { customerId: number; amountSpent: number },
  ) {
    const { customerId, amountSpent } = body;
    if (amountSpent <= 0) throw new BadRequestException('Amount must be positive');
    return this.loyaltyService.earnPointsFromPurchase(customerId, amountSpent);
  }

  // Redeem points
  @Post('redeem')
  async redeemPoints(
    @Body() body: { customerId: number; pointsToRedeem: number; description?: string },
  ) {
    const { customerId, pointsToRedeem, description } = body;
    if (pointsToRedeem <= 0) throw new BadRequestException('Points must be positive');
    return this.loyaltyService.redeemPoints(customerId, pointsToRedeem, description);
  }

  // Get loyalty tier for customer
  @Get('tier/:customerId')
  async getTier(@Param('customerId', ParseIntPipe) customerId: number) {
    const tier = await this.loyaltyService.getCustomerTier(customerId);
    return tier || { message: 'No tier found' };
  }

  // Grant birthday rewards (ideally protected or scheduled)
  @Post('grant/birthday')
  async grantBirthdayRewards() {
    await this.loyaltyService.grantBirthdayRewards();
    return { message: 'Birthday rewards granted' };
  }

  // Grant anniversary rewards (ideally protected or scheduled)
  @Post('grant/anniversary')
  async grantAnniversaryRewards() {
    await this.loyaltyService.grantAnniversaryRewards();
    return { message: 'Anniversary rewards granted' };
  }

  // Add referral
  @Post('referral')
  async addReferral(
    @Body() body: { referrerId: number; referredCustomerId: number },
  ) {
    return this.loyaltyService.addReferral(body.referrerId, body.referredCustomerId);
  }

  // Grant referral bonus
  @Post('referral/bonus')
  async grantReferralBonus(@Body() body: { referralId: number }) {
    return this.loyaltyService.grantReferralBonus(body.referralId);
  }
}
