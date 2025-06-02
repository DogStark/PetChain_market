import { Injectable } from '@nestjs/common';
import { EmergencyPriority, TriageLevel } from '../common/enums/emergency.enum';

@Injectable()
export class PricingService {
  private readonly basePrices = {
    consultation: 150,
    emergency_fee: 100,
  };

  private readonly priorityMultipliers = {
    [EmergencyPriority.CRITICAL]: 2.5,
    [EmergencyPriority.HIGH]: 2.0,
    [EmergencyPriority.MEDIUM]: 1.5,
    [EmergencyPriority.LOW]: 1.2,
  };

  private readonly triageMultipliers = {
    [TriageLevel.IMMEDIATE]: 3.0,
    [TriageLevel.URGENT]: 2.0,
    [TriageLevel.LESS_URGENT]: 1.5,
    [TriageLevel.NON_URGENT]: 1.0,
  };

  calculateEmergencyPrice(
    priority: EmergencyPriority,
    triageLevel: TriageLevel,
    isAfterHours: boolean = false,
  ): number {
    let totalCost =
      this.basePrices.consultation + this.basePrices.emergency_fee;

    // Apply priority multiplier
    totalCost *= this.priorityMultipliers[priority];

    // Apply triage multiplier
    totalCost *= this.triageMultipliers[triageLevel];

    // After-hours surcharge (50% extra)
    if (isAfterHours) {
      totalCost *= 1.5;
    }

    return Math.round(totalCost * 100) / 100; // Round to 2 decimal places
  }

  private isAfterHours(): boolean {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();

    // After hours: weekends or weekdays before 8 AM or after 6 PM
    return day === 0 || day === 6 || hour < 8 || hour >= 18;
  }

  getEstimatedCost(
    priority: EmergencyPriority,
    triageLevel: TriageLevel,
  ): number {
    return this.calculateEmergencyPrice(
      priority,
      triageLevel,
      this.isAfterHours(),
    );
  }
}
