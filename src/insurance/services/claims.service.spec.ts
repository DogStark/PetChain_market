import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { ClaimsService } from './claims.service';
import { InsuranceClaim } from '../entities/insurance-claim.entity';
import { InsurancePolicy } from '../entities/insurance-policy.entity';
import { ClaimDocument } from '../entities/claim-document.entity';
import { PreAuthorization } from '../entities/pre-authorization.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { of } from 'rxjs';

describe('ClaimsService', () => {
  let service: ClaimsService;
  let claimRepository: Repository<InsuranceClaim>;
  let policyRepository: Repository<InsurancePolicy>;
  let httpService: HttpService;

  const mockPolicy = {
    id: 1,
    policyNumber: 'POL123456',
    status: 'active',
    provider: {
      id: 1,
      code: 'PETPLAN',
      apiEndpoint: 'https://api.petplan.com',
      apiKey: 'test-key',
    },
  };

  const mockClaim = {
    id: 1,
    claimNumber: 'CLM-123456',
    status: 'draft',
    totalAmount: 1000,
    policy: mockPolicy,
    documents: [
      { documentType: 'invoice' },
      { documentType: 'medical_record' },
    ],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClaimsService,
        {
          provide: getRepositoryToken(InsuranceClaim),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(InsurancePolicy),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ClaimDocument),
          useValue: {},
        },
        {
          provide: getRepositoryToken(PreAuthorization),
          useValue: {},
        },
        {
          provide: HttpService,
          useValue: {
            post: jest.fn(),
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ClaimsService>(ClaimsService);
    claimRepository = module.get<Repository<InsuranceClaim>>(
      getRepositoryToken(InsuranceClaim),
    );
    policyRepository = module.get<Repository<InsurancePolicy>>(
      getRepositoryToken(InsurancePolicy),
    );
    httpService = module.get<HttpService>(HttpService);
  });

  describe('createClaim', () => {
    it('should create a claim successfully', async () => {
      const createClaimDto = {
        policyId: 1,
        treatmentDate: new Date(),
        diagnosis: 'Test diagnosis',
        treatmentDescription: 'Test treatment',
        totalAmount: 1000,
        veterinarianName: 'Dr. Test',
        veterinarianLicense: 'VET123',
        clinicName: 'Test Clinic',
        clinicAddress: 'Test Address',
      };

      jest.spyOn(policyRepository, 'findOne').mockResolvedValue(mockPolicy as any);
      jest.spyOn(claimRepository, 'create').mockReturnValue(mockClaim as any);
      jest.spyOn(claimRepository, 'save').mockResolvedValue(mockClaim as any);

      const result = await service.createClaim(createClaimDto);

      expect(policyRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['provider'],
      });
      expect(result).toEqual(mockClaim);
    });

    it('should throw NotFoundException when policy not found', async () => {
      const createClaimDto = {
        policyId: 999,
        treatmentDate: new Date(),
        diagnosis: 'Test',
        treatmentDescription: 'Test',
        totalAmount: 1000,
        veterinarianName: 'Dr. Test',
        veterinarianLicense: 'VET123',
        clinicName: 'Test Clinic',
        clinicAddress: 'Test Address',
      };

      jest.spyOn(policyRepository, 'findOne').mockResolvedValue(null);

      await expect(service.createClaim(createClaimDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for inactive policy', async () => {
      const inactivePolicy = { ...mockPolicy, status: 'cancelled' };
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

      jest.spyOn(policyRepository, 'findOne').mockResolvedValue(inactivePolicy as any);

      await expect(service.createClaim(createClaimDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('submitClaim', () => {
    it('should submit claim successfully', async () => {
      const claimWithDocs = {
        ...mockClaim,
        documents: [
          { documentType: 'invoice' },
          { documentType: 'medical_record' },
        ],
      };

      jest.spyOn(claimRepository, 'findOne').mockResolvedValue(claimWithDocs as any);
      jest.spyOn(httpService, 'post').mockReturnValue(
        of({
          data: {
            status: 'accepted',
            claim_id: 'EXT123',
            tracking_number: 'TRK123',
            estimated_processing_days: 5,
          },
        }) as any,
      );
      jest.spyOn(claimRepository, 'save').mockResolvedValue(claimWithDocs as any);

      const result = await service.submitClaim(1);

      expect(result.success).toBe(true);
      expect(result.claimId).toBe('EXT123');
    });

    it('should throw BadRequestException for missing documents', async () => {
      const claimWithoutDocs = {
        ...mockClaim,
        documents: [{ documentType: 'invoice' }], 
      };

      jest.spyOn(claimRepository, 'findOne').mockResolvedValue(claimWithoutDocs as any);

      await expect(service.submitClaim(1)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for non-draft claims', async () => {
      const submittedClaim = { ...mockClaim, status: 'submitted' };

      jest.spyOn(claimRepository, 'findOne').mockResolvedValue(submittedClaim as any);

      await expect(service.submitClaim(1)).rejects.toThrow(BadRequestException);
    });
  });

  describe('trackClaimStatus', () => {
    it('should track and update claim status', async () => {
      jest.spyOn(claimRepository, 'findOne').mockResolvedValue(mockClaim as any);
      jest.spyOn(httpService, 'get').mockReturnValue(
        of({
          data: {
            status: 'approved',
            approved_amount: 800,
            processed_at: '2024-01-15T10:00:00Z',
          },
        }) as any,
      );
      jest.spyOn(claimRepository, 'save').mockResolvedValue({
        ...mockClaim,
        status: 'approved',
        approvedAmount: 800,
      } as any);

      const result = await service.trackClaimStatus(1);

      expect(result.status).toBe('approved');
      expect(result.approvedAmount).toBe(800);
    });
  });
});
