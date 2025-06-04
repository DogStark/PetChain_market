import { Test, TestingModule } from '@nestjs/testing';
import { InsuranceController } from './insurance.controller';
import { InsuranceProvidersService } from '../services/insurance-providers.service';
import { ClaimsService } from '../services/claims.service';
import { PreAuthorizationService } from '../services/pre-authorization.service';
import { BillingService } from '../services/billing.service';

describe('InsuranceController', () => {
  let controller: InsuranceController;
  let claimsService: ClaimsService;
  let billingService: BillingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InsuranceController],
      providers: [
        {
          provide: InsuranceProvidersService,
          useValue: {
            getAllProviders: jest.fn(),
            verifyInsurance: jest.fn(),
          },
        },
        {
          provide: ClaimsService,
          useValue: {
            createClaim: jest.fn(),
            submitClaim: jest.fn(),
            getClaimById: jest.fn(),
            trackClaimStatus: jest.fn(),
          },
        },
        {
          provide: PreAuthorizationService,
          useValue: {
            createPreAuthorization: jest.fn(),
            checkPreAuthStatus: jest.fn(),
          },
        },
        {
          provide: BillingService,
          useValue: {
            calculateBilling: jest.fn(),
            coordinatePayment: jest.fn(),
            processDirectPayment: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<InsuranceController>(InsuranceController);
    claimsService = module.get<ClaimsService>(ClaimsService);
    billingService = module.get<BillingService>(BillingService);
  });

  describe('createClaim', () => {
    it('should create a claim successfully', async () => {
      const createClaimDto = {
        policyId: 1,
        treatmentDate: new Date(),
        diagnosis: 'Test',
        treatmentDescription: 'Test',
        totalAmount: 1000,
        veterinarianName: 'Dr. Test',
        veterinarianLicense: 'VET123',
        clinicName: 'Test Clinic',
        clinicAddress: 'Test Address',
      };

      const mockClaim = { id: 1, ...createClaimDto };
      jest.spyOn(claimsService, 'createClaim').mockResolvedValue(mockClaim as any);

      const result = await controller.createClaim(createClaimDto, { user: { id: 1 } });

      expect(claimsService.createClaim).toHaveBeenCalledWith(createClaimDto);
      expect(result.message).toBe('Claim created successfully');
      expect(result.claim).toEqual(mockClaim);
    });
  });

  describe('calculateBilling', () => {
    it('should calculate billing for a claim', async () => {
      const mockBilling = {
        totalAmount: 1000,
        deductibleAmount: 500,
        insuranceCovered: 400,
        patientResponsible: 600,
        deductibleRemaining: 0,
        benefitRemaining: 9600,
      };

      jest.spyOn(billingService, 'calculateBilling').mockResolvedValue(mockBilling);

      const result = await controller.calculateBilling(1);

      expect(billingService.calculateBilling).toHaveBeenCalledWith(1);
      expect(result.billing).toEqual(mockBilling);
    });
  });

  describe('processDirectPayment', () => {
    it('should process direct payment successfully', async () => {
      jest.spyOn(billingService, 'processDirectPayment').mockResolvedValue(true);

      const result = await controller.processDirectPayment(1);

      expect(billingService.processDirectPayment).toHaveBeenCalledWith(1);
      expect(result.success).toBe(true);
      expect(result.message).toBe('Direct payment processed successfully');
    });

    it('should handle failed direct payment', async () => {
      jest.spyOn(billingService, 'processDirectPayment').mockResolvedValue(false);

      const result = await controller.processDirectPayment(1);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Direct payment failed');
    });
  });
});