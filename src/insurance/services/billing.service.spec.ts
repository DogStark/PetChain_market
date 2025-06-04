import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BillingService } from './billing.service';
import { InsuranceClaim } from '../entities/insurance-claim.entity';
import { InsurancePolicy } from '../entities/insurance-policy.entity';

describe('BillingService', () => {
  let service: BillingService;
  let claimRepository: Repository<InsuranceClaim>;

  const mockPolicy = {
    id: 1,
    deductible: 500,
    coveragePercentage: 80,
    annualLimit: 10000,
  };

  const mockClaim = {
    id: 1,
    totalAmount: 1000,
    policy: mockPolicy,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BillingService,
        {
          provide: getRepositoryToken(InsuranceClaim),
          useValue: {
            findOne: jest.fn(),
            createQueryBuilder: jest.fn(() => ({
              select: jest.fn().mockReturnThis(),
              addSelect: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              setParameter: jest.fn().mockReturnThis(),
              getRawOne: jest.fn().mockResolvedValue({
                deductibleMet: '0',
                benefitsUsed: '0',
              }),
            })),
          },
        },
        {
          provide: getRepositoryToken(InsurancePolicy),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<BillingService>(BillingService);
    claimRepository = module.get<Repository<InsuranceClaim>>(
      getRepositoryToken(InsuranceClaim),
    );
  });

  describe('calculateBilling', () => {
    it('should calculate billing correctly with deductible', async () => {
      jest.spyOn(claimRepository, 'findOne').mockResolvedValue(mockClaim as any);

      const result = await service.calculateBilling(1);

      expect(result.totalAmount).toBe(1000);
      expect(result.deductibleAmount).toBe(500); 
      expect(result.insuranceCovered).toBe(400); 
      expect(result.patientResponsible).toBe(600); 
    });

    it('should calculate billing when deductible is already met', async () => {
      jest.spyOn(claimRepository, 'findOne').mockResolvedValue(mockClaim as any);
      claimRepository.createQueryBuilder = jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        setParameter: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({
          deductibleMet: '500',
          benefitsUsed: '2000',
        }),
      })) as any;

      const result = await service.calculateBilling(1);

      expect(result.deductibleAmount).toBe(0); 
      expect(result.insuranceCovered).toBe(800); 
      expect(result.patientResponsible).toBe(200); 
    });
  });

  describe('validateBillingEligibility', () => {
    it('should validate eligibility for active policy', async () => {
      const mockPolicyRepo = module.get<Repository<InsurancePolicy>>(
        getRepositoryToken(InsurancePolicy),
      );
      jest.spyOn(mockPolicyRepo, 'findOne').mockResolvedValue({
        ...mockPolicy,
        status: 'active',
      } as any);

      const result = await service.validateBillingEligibility(1, 1000);

      expect(result.isEligible).toBe(true);
      expect(result.estimatedCoverage).toBeGreaterThan(0);
    });

    it('should reject eligibility for inactive policy', async () => {
      const mockPolicyRepo = module.get<Repository<InsurancePolicy>>(
        getRepositoryToken(InsurancePolicy),
      );
      jest.spyOn(mockPolicyRepo, 'findOne').mockResolvedValue({
        ...mockPolicy,
        status: 'cancelled',
      } as any);

      const result = await service.validateBillingEligibility(1, 1000);

      expect(result.isEligible).toBe(false);
      expect(result.reason).toBe('Policy is not active');
    });
  });
});

