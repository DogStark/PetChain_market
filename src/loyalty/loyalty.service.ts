import { Customer } from "@/customer-pet/entities/customer-pet.entity";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { LoyaltyPoint } from "./entities/loyalty.entity";
import { LoyaltyTier } from "./entities/loyalty-tier.entity";
import { Referral } from "./entities/referral.entity";

@Injectable()
export class LoyaltyService {
  constructor(
    @InjectRepository(Customer) private customerRepo: Repository<Customer>,
    @InjectRepository(LoyaltyPoint) private loyaltyPointRepo: Repository<LoyaltyPoint>,
    @InjectRepository(LoyaltyTier) private loyaltyTierRepo: Repository<LoyaltyTier>,
    @InjectRepository(Referral) private referralRepo: Repository<Referral>,
  ) {}

  // --- Points Calculation ---

  async getCustomerTotalPoints(customerId: number): Promise<number> {
    const earned = await this.loyaltyPointRepo
      .createQueryBuilder("lp")
      .select("SUM(lp.points)", "sum")
      .where("lp.customerId = :customerId", { customerId })
      .andWhere("lp.type = :type", { type: "earn" })
      .getRawOne();

    const redeemed = await this.loyaltyPointRepo
      .createQueryBuilder("lp")
      .select("SUM(lp.points)", "sum")
      .where("lp.customerId = :customerId", { customerId })
      .andWhere("lp.type = :type", { type: "redeem" })
      .getRawOne();

    return (parseInt(earned.sum) || 0) - (parseInt(redeemed.sum) || 0);
  }

  // --- Earning Points ---

  async earnPoints(
    customerId: number,
    points: number,
    description?: string,
  ): Promise<LoyaltyPoint> {
    const loyaltyPoint = this.loyaltyPointRepo.create({
      customer: { id: customerId }, // nested relation object with id
      points,
      type: "earn",
      description,
    });

    return this.loyaltyPointRepo.save(loyaltyPoint);
  }

  // Example: earn points based on purchase amount
  async earnPointsFromPurchase(customerId: number, amountSpent: number) {
    const points = Math.floor(amountSpent); // 1 point per $1 spent
    return this.earnPoints(customerId, points, "Points from purchase");
  }

  // --- Redeeming Points ---

  async redeemPoints(
    customerId: number,
    pointsToRedeem: number,
    description?: string,
  ): Promise<LoyaltyPoint> {
    const totalPoints = await this.getCustomerTotalPoints(customerId);
    if (totalPoints < pointsToRedeem) {
      throw new Error("Insufficient points");
    }

    const redemption = this.loyaltyPointRepo.create({
      customer: { id: customerId }, // nested relation object with id
      points: pointsToRedeem,
      type: "redeem",
      description,
    });

    return this.loyaltyPointRepo.save(redemption);
  }

  // --- Loyalty Tier Management ---

  async getCustomerTier(customerId: number): Promise<LoyaltyTier | null> {
    const totalPoints = await this.getCustomerTotalPoints(customerId);

    const tier = await this.loyaltyTierRepo
      .createQueryBuilder("tier")
      .where("tier.minPoints <= :points", { points: totalPoints })
      .orderBy("tier.minPoints", "DESC")
      .getOne();

    return tier || null;
  }

  // --- Birthday and Anniversary Rewards ---

  // Call daily to grant birthday rewards
  async grantBirthdayRewards(bonusPoints: number = 100) {
    const today = new Date().toISOString().slice(5, 10); // MM-DD

    const customers = await this.customerRepo
      .createQueryBuilder("customer")
      .where(`to_char(customer.birthday, 'MM-DD') = :today`, { today })
      .getMany();

    for (const customer of customers) {
      await this.earnPoints(customer.id, bonusPoints, "Birthday bonus");
    }
  }

  // Call daily to grant anniversary rewards
  async grantAnniversaryRewards(bonusPoints: number = 100) {
    const today = new Date().toISOString().slice(5, 10); // MM-DD

    const customers = await this.customerRepo
      .createQueryBuilder("customer")
      .where(`to_char(customer.anniversary, 'MM-DD') = :today`, { today })
      .getMany();

    for (const customer of customers) {
      await this.earnPoints(customer.id, bonusPoints, "Anniversary bonus");
    }
  }

  // --- Referral Bonuses ---

  // Add referral record when a customer refers another
  async addReferral(referrerId: number, referredCustomerId: number) {
    const referral = this.referralRepo.create({
      referrer: { id: referrerId },
      referredCustomer: { id: referredCustomerId },
      bonusGiven: false,
    });

    return this.referralRepo.save(referral);
  }

  // Grant referral bonus when conditions are met (e.g., first purchase)
  async grantReferralBonus(referralId: number, bonusPoints: number = 200) {
    const referral = await this.referralRepo.findOne({
      where: { id: referralId },
      relations: ["referrer"],
    });

    if (!referral) throw new Error("Referral not found");
    if (referral.bonusGiven) throw new Error("Bonus already granted");

    await this.earnPoints(referral.referrer.id, bonusPoints, "Referral bonus");
    referral.bonusGiven = true;
    await this.referralRepo.save(referral);
  }
}
