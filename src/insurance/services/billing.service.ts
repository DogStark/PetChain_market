import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InsuranceClaim } from '../entities/insurance-claim.entity';
import { InsurancePolicy } from '../entities/insurance-policy.entity';

export interface BillingCalculation {
  totalAmount: number;
  deductibleAmount: number;
  insuranceCovered: number;
  patientResponsible: number;
  deductibleRemaining: number;
  benefitRemaining: number;
}

export interface PaymentCoordination {
  claimId: number;
  insurancePayment: number;
  patientPayment: number;
  paymentMethod: 'direct_pay' | 'reimbursement';
  estimatedPaymentDate: Date;
}

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(
    @InjectRepository(InsuranceClaim)
    private claimRepository: Repository<InsuranceClaim>,
    @InjectRepository(InsurancePolicy)
    private policyRepository: Repository<InsurancePolicy>,
  ) {}

  async calculateBilling(claimId: number): Promise<BillingCalculation> {
    const claim = await this.claimRepository.findOne({
      where: { id: claimId },
      relations: ['policy'],
    });

    if (!claim) {
      throw new BadRequestException(`Claim with ID ${claimId} not found`);
    }

    const policy = claim.policy;
    const totalAmount = claim.totalAmount;

    const yearlyUsage = await this.getYearlyUsage(policy.id);
    
    const deductibleRemaining = Math.max(0, policy.deductible - yearlyUsage.deductibleMet);
    const deductibleAmount = Math.min(totalAmount, deductibleRemaining);
    
    const amountAfterDeductible = totalAmount - deductibleAmount;
    
    const insuranceCovered = amountAfterDeductible * (policy.coveragePercentage / 100);
    
    const benefitRemaining = Math.max(0, policy.annualLimit - yearlyUsage.benefitsUsed);
    const finalInsuranceCovered = Math.min(insuranceCovered, benefitRemaining);
    
    const patientResponsible = totalAmount - finalInsuranceCovered;

    return {
      totalAmount,
      deductibleAmount,
      insuranceCovered: finalInsuranceCovered,
      patientResponsible,
      deductibleRemaining: deductibleRemaining - deductibleAmount,
      benefitRemaining: benefitRemaining - finalInsuranceCovered,
    };
  }

  async coordinatePayment(claimId: number): Promise<PaymentCoordination> {
    const claim = await this.claimRepository.findOne({
      where: { id: claimId },
      relations: ['policy', 'policy.provider'],
    });

    if (!claim) {
      throw new BadRequestException(`Claim with ID ${claimId} not found`);
    }

    if (claim.status !== 'approved') {
      throw new BadRequestException('Cannot coordinate payment for non-approved claim');
    }

    const billing = await this.calculateBilling(claimId);
    const provider = claim.policy.provider;

    const paymentMethod = this.determinePaymentMethod(provider.code);
    const estimatedPaymentDate = this.calculatePaymentDate(provider.code, paymentMethod);

    claim.approvedAmount = billing.insuranceCovered;
    await this.claimRepository.save(claim);

    const coordination: PaymentCoordination = {
      claimId,
      insurancePayment: billing.insuranceCovered,
      patientPayment: billing.patientResponsible,
      paymentMethod,
      estimatedPaymentDate,
    };

    this.logger.log(`Payment coordinated for claim ${claim.claimNumber}: Insurance: $${billing.insuranceCovered}, Patient: $${billing.patientResponsible}`);

    return coordination;
  }

  async processDirectPayment(claimId: number): Promise<boolean> {
    const claim = await this.claimRepository.findOne({
      where: { id: claimId },
      relations: ['policy', 'policy.provider'],
    });

    if (!claim) {
      throw new BadRequestException(`Claim with ID ${claimId} not found`);
    }

    const provider = claim.policy.provider;
    
    if (!this.supportsDirectPayment(provider.code)) {
      throw new BadRequestException('Provider does not support direct payment');
    }

    try {
      const paymentResult = await this.initiateDirectPayment(claim);
      
      if (paymentResult.success) {
        claim.status = 'paid';
        claim.paidAmount = claim.approvedAmount;
        claim.providerResponse = { ...claim.providerResponse, payment: paymentResult };
        await this.claimRepository.save(claim);
        
        this.logger.log(`Direct payment processed for claim ${claim.claimNumber}: $${claim.paidAmount}`);
        return true;
      }
      
      return false;
    } catch (error) {
      this.logger.error(`Direct payment failed for claim ${claim.claimNumber}:`, error);
      return false;
    }
  }

  async generateReimbursementInstructions(claimId: number): Promise<any> {
    const claim = await this.claimRepository.findOne({
      where: { id: claimId },
      relations: ['policy'],
    });

    if (!claim) {
      throw new BadRequestException(`Claim with ID ${claimId} not found`);
    }

    const billing = await this.calculateBilling(claimId);

    return {
      claimNumber: claim.claimNumber,
      policyNumber: claim.policy.policyNumber,
      patientName: claim.policy.holderName,
      reimbursementAmount: billing.insuranceCovered,
      paymentMethod: 'check', 
      estimatedProcessingDays: 7-10,
      instructions: [
        'Submit original receipts to insurance provider',
        'Include claim form with veterinarian signature',
        'Ensure all required documentation is complete',
        'Payment will be issued directly to policy holder',
      ],
    };
  }

  private async getYearlyUsage(policyId: number): Promise<{ deductibleMet: number; benefitsUsed: number }> {
    const currentYear = new Date().getFullYear();
    const yearStart = new Date(currentYear, 0, 1);
    const yearEnd = new Date(currentYear, 11, 31);

    const result = await this.claimRepository
      .createQueryBuilder('claim')
      .select('SUM(CASE WHEN claim.status IN (\'approved\', \'paid\') THEN claim.approvedAmount ELSE 0 END)', 'benefitsUsed')
      .addSelect('SUM(CASE WHEN claim.status IN (\'approved\', \'paid\') THEN LEAST(claim.totalAmount, :deductible - COALESCE(prev_deductible.amount, 0)) ELSE 0 END)', 'deductibleMet')
      .where('claim.policyId = :policyId', { policyId })
      .andWhere('claim.createdAt BETWEEN :yearStart AND :yearEnd', { yearStart, yearEnd })
      .setParameter('deductible', 500) 
      .getRawOne();

    return {
      deductibleMet: parseFloat(result.deductibleMet) || 0,
      benefitsUsed: parseFloat(result.benefitsUsed) || 0,
    };
  }

  private determinePaymentMethod(providerCode: string): 'direct_pay' | 'reimbursement' {
    const directPayProviders = ['TRUPANION', 'PETPLAN'];
    return directPayProviders.includes(providerCode) ? 'direct_pay' : 'reimbursement';
  }

  private calculatePaymentDate(providerCode: string, paymentMethod: string): Date {
    const now = new Date();
    let daysToAdd = 10; // Default

    if (paymentMethod === 'direct_pay') {
      daysToAdd = providerCode === 'TRUPANION' ? 1 : 3; 
    } else {
      daysToAdd = 7; 
    }

    return new Date(now.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
  }

  private supportsDirectPayment(providerCode: string): boolean {
    const directPayProviders = ['TRUPANION', 'PETPLAN'];
    return directPayProviders.includes(providerCode);
  }

  private async initiateDirectPayment(claim: InsuranceClaim): Promise<any> {
    return {
      success: true,
      transactionId: `PAY_${Date.now()}`,
      amount: claim.approvedAmount,
      processedAt: new Date(),
    };
  }

  async getBillingHistory(policyId: number): Promise<any[]> {
    const claims = await this.claimRepository.find({
      where: { policyId },
      order: { createdAt: 'DESC' },
    });

    const billingHistory = [];
    
    for (const claim of claims) {
      if (claim.status === 'approved' || claim.status === 'paid') {
        const billing = await this.calculateBilling(claim.id);
        billingHistory.push({
          claimNumber: claim.claimNumber,
          treatmentDate: claim.treatmentDate,
          totalAmount: billing.totalAmount,
          insurancePaid: billing.insuranceCovered,
          patientPaid: billing.patientResponsible,
          status: claim.status,
          paidDate: claim.processedAt,
        });
      }
    }

    return billingHistory;
  }

  async validateBillingEligibility(policyId: number, treatmentAmount: number): Promise<{
    isEligible: boolean;
    reason?: string;
    estimatedCoverage: number;
    patientResponsibility: number;
  }> {
    const policy = await this.policyRepository.findOne({ where: { id: policyId } });
    
    if (!policy) {
      return {
        isEligible: false,
        reason: 'Policy not found',
        estimatedCoverage: 0,
        patientResponsibility: treatmentAmount,
      };
    }

    if (policy.status !== 'active') {
      return {
        isEligible: false,
        reason: 'Policy is not active',
        estimatedCoverage: 0,
        patientResponsibility: treatmentAmount,
      };
    }

    const yearlyUsage = await this.getYearlyUsage(policyId);
    
    if (yearlyUsage.benefitsUsed >= policy.annualLimit) {
      return {
        isEligible: false,
        reason: 'Annual benefit limit exceeded',
        estimatedCoverage: 0,
        patientResponsibility: treatmentAmount,
      };
    }

    const deductibleRemaining = Math.max(0, policy.deductible - yearlyUsage.deductibleMet);
    const deductibleAmount = Math.min(treatmentAmount, deductibleRemaining);
    const amountAfterDeductible = treatmentAmount - deductibleAmount;
    const insuranceCovered = amountAfterDeductible * (policy.coveragePercentage / 100);
    const benefitRemaining = policy.annualLimit - yearlyUsage.benefitsUsed;
    const finalCoverage = Math.min(insuranceCovered, benefitRemaining);

    return {
      isEligible: true,
      estimatedCoverage: finalCoverage,
      patientResponsibility: treatmentAmount - finalCoverage,
    };
  }
}