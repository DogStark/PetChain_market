import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { InsuranceProvider } from '../entities/insurance-provider.entity';
import { InsurancePolicy } from '../entities/insurance-policy.entity';

export interface ProviderVerificationRequest {
  policyNumber: string;
  petName: string;
  petDateOfBirth: Date;
  ownerName: string;
}

export interface ProviderVerificationResponse {
  isValid: boolean;
  policy?: {
    policyNumber: string;
    deductible: number;
    coveragePercentage: number;
    annualLimit: number;
    remainingBenefit: number;
    status: string;
  };
  error?: string;
}

@Injectable()
export class InsuranceProvidersService {
  private readonly logger = new Logger(InsuranceProvidersService.name);

  constructor(
    @InjectRepository(InsuranceProvider)
    private providerRepository: Repository<InsuranceProvider>,
    @InjectRepository(InsurancePolicy)
    private policyRepository: Repository<InsurancePolicy>,
    private httpService: HttpService,
  ) {}

  async getAllProviders(): Promise<InsuranceProvider[]> {
    return this.providerRepository.find({ where: { isActive: true } });
  }

  async getProviderById(id: number): Promise<InsuranceProvider> {
    const provider = await this.providerRepository.findOne({ where: { id } });
    if (!provider) {
      throw new BadRequestException(`Provider with ID ${id} not found`);
    }
    return provider;
  }

  async verifyInsurance(
    providerId: number,
    verificationData: ProviderVerificationRequest,
  ): Promise<ProviderVerificationResponse> {
    const provider = await this.getProviderById(providerId);

    try {
      switch (provider.code) {
        case 'PETPLAN':
          return await this.verifyPetPlanInsurance(provider, verificationData);
        case 'TRUPANION':
          return await this.verifyTrupanionInsurance(provider, verificationData);
        case 'NATIONWIDE':
          return await this.verifyNationwideInsurance(provider, verificationData);
        default:
          return await this.verifyGenericInsurance(provider, verificationData);
      }
    } catch (error) {
      this.logger.error(`Insurance verification failed for provider ${provider.name}:`, error);
      return {
        isValid: false,
        error: 'Verification service temporarily unavailable',
      };
    }
  }

  private async verifyPetPlanInsurance(
    provider: InsuranceProvider,
    data: ProviderVerificationRequest,
  ): Promise<ProviderVerificationResponse> {
    const requestPayload = {
      policy_number: data.policyNumber,
      pet_name: data.petName,
      pet_dob: data.petDateOfBirth.toISOString().split('T')[0],
      owner_name: data.ownerName,
    };

    const response = await firstValueFrom(
      this.httpService.post(
        `${provider.apiEndpoint}/verify`,
        requestPayload,
        {
          headers: {
            'Authorization': `Bearer ${provider.apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      ),
    );

    if (response.data.status === 'valid') {
      return {
        isValid: true,
        policy: {
          policyNumber: response.data.policy.number,
          deductible: response.data.policy.deductible,
          coveragePercentage: response.data.policy.coverage_percentage,
          annualLimit: response.data.policy.annual_limit,
          remainingBenefit: response.data.policy.remaining_benefit,
          status: response.data.policy.status,
        },
      };
    }

    return {
      isValid: false,
      error: response.data.message || 'Policy verification failed',
    };
  }

  private async verifyTrupanionInsurance(
    provider: InsuranceProvider,
    data: ProviderVerificationRequest,
  ): Promise<ProviderVerificationResponse> {
    const requestPayload = {
      policyId: data.policyNumber,
      petDetails: {
        name: data.petName,
        birthDate: data.petDateOfBirth,
      },
      ownerName: data.ownerName,
    };

    const response = await firstValueFrom(
      this.httpService.post(
        `${provider.apiEndpoint}/policy/verify`,
        requestPayload,
        {
          headers: {
            'X-API-Key': provider.apiKey,
            'Content-Type': 'application/json',
          },
        },
      ),
    );

    if (response.data.verified) {
      return {
        isValid: true,
        policy: {
          policyNumber: response.data.policyDetails.id,
          deductible: response.data.policyDetails.deductible,
          coveragePercentage: response.data.policyDetails.reimbursementRate,
          annualLimit: response.data.policyDetails.coverageLimit,
          remainingBenefit: response.data.policyDetails.availableBenefit,
          status: response.data.policyDetails.status,
        },
      };
    }

    return {
      isValid: false,
      error: response.data.reason || 'Policy verification failed',
    };
  }

  private async verifyNationwideInsurance(
    provider: InsuranceProvider,
    data: ProviderVerificationRequest,
  ): Promise<ProviderVerificationResponse> {
    const response = await firstValueFrom(
      this.httpService.get(
        `${provider.apiEndpoint}/policies/${data.policyNumber}/verify`,
        {
          headers: {
            'Authorization': `ApiKey ${provider.apiKey}`,
          },
          params: {
            pet_name: data.petName,
            pet_dob: data.petDateOfBirth.toISOString().split('T')[0],
            owner_name: data.ownerName,
          },
        },
      ),
    );

    if (response.data.isActive) {
      return {
        isValid: true,
        policy: {
          policyNumber: response.data.policy.policyNumber,
          deductible: response.data.policy.deductible,
          coveragePercentage: response.data.policy.coinsurance,
          annualLimit: response.data.policy.annualMaximum,
          remainingBenefit: response.data.policy.remainingBenefit,
          status: response.data.policy.status,
        },
      };
    }

    return {
      isValid: false,
      error: response.data.message || 'Policy not found or inactive',
    };
  }

  private async verifyGenericInsurance(
    provider: InsuranceProvider,
    data: ProviderVerificationRequest,
  ): Promise<ProviderVerificationResponse> {
    const requestPayload = {
      policy_number: data.policyNumber,
      pet_info: {
        name: data.petName,
        date_of_birth: data.petDateOfBirth,
      },
      owner_name: data.ownerName,
    };

    const response = await firstValueFrom(
      this.httpService.post(
        `${provider.apiEndpoint}/verify-policy`,
        requestPayload,
        {
          headers: {
            'API-Key': provider.apiKey,
            'Content-Type': 'application/json',
          },
        },
      ),
    );

    return {
      isValid: response.data.valid,
      policy: response.data.valid ? {
        policyNumber: response.data.policy.number,
        deductible: response.data.policy.deductible,
        coveragePercentage: response.data.policy.coverage,
        annualLimit: response.data.policy.limit,
        remainingBenefit: response.data.policy.remaining,
        status: response.data.policy.status,
      } : undefined,
      error: response.data.valid ? undefined : response.data.error,
    };
  }

  async syncPolicyData(policyId: number): Promise<InsurancePolicy> {
    const policy = await this.policyRepository.findOne({
      where: { id: policyId },
      relations: ['provider', 'pet'],
    });

    if (!policy) {
      throw new BadRequestException(`Policy with ID ${policyId} not found`);
    }

    const verificationData: ProviderVerificationRequest = {
      policyNumber: policy.policyNumber,
      petName: policy.pet.name,
      petDateOfBirth: policy.pet.dateOfBirth,
      ownerName: policy.holderName,
    };

    const verificationResult = await this.verifyInsurance(
      policy.providerId,
      verificationData,
    );

    if (verificationResult.isValid && verificationResult.policy) {
      policy.deductible = verificationResult.policy.deductible;
      policy.coveragePercentage = verificationResult.policy.coveragePercentage;
      policy.annualLimit = verificationResult.policy.annualLimit;
      policy.status = verificationResult.policy.status === 'active' ? 'active' : 'suspended';

      return await this.policyRepository.save(policy);
    }

    throw new BadRequestException('Unable to sync policy data: verification failed');
  }
}