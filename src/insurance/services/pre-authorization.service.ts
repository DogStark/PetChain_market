import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { PreAuthorization } from '../entities/pre-authorization.entity';
import { InsurancePolicy } from '../entities/insurance-policy.entity';
import { CreatePreAuthDto, UpdatePreAuthDto } from '../dto/pre-authorization.dto';

export interface PreAuthRequest {
  authorizationNumber: string;
  policyNumber: string;
  treatmentType: string;
  treatmentDescription: string;
  estimatedCost: number;
  veterinarian: {
    name: string;
    license: string;
    clinic: string;
  };
  urgency: 'routine' | 'urgent' | 'emergency';
}

export interface PreAuthResponse {
  success: boolean;
  authorizationNumber?: string;
  status: 'approved' | 'denied' | 'pending';
  authorizedAmount?: number;
  expirationDate?: Date;
  denialReason?: string;
  conditions?: string[];
}

@Injectable()
export class PreAuthorizationService {
  private readonly logger = new Logger(PreAuthorizationService.name);

  constructor(
    @InjectRepository(PreAuthorization)
    private preAuthRepository: Repository<PreAuthorization>,
    @InjectRepository(InsurancePolicy)
    private policyRepository: Repository<InsurancePolicy>,
    private httpService: HttpService,
  ) {}

  async createPreAuthorization(createDto: CreatePreAuthDto): Promise<PreAuthorization> {
    const policy = await this.policyRepository.findOne({
      where: { id: createDto.policyId },
      relations: ['provider'],
    });

    if (!policy) {
      throw new NotFoundException(`Policy with ID ${createDto.policyId} not found`);
    }

    if (policy.status !== 'active') {
      throw new BadRequestException('Cannot create pre-authorization for inactive policy');
    }

    const authorizationNumber = await this.generateAuthorizationNumber();

    const preAuth = this.preAuthRepository.create({
      ...createDto,
      authorizationNumber,
      status: 'pending',
      expirationDate: this.calculateExpirationDate(),
    });

    const savedPreAuth = await this.preAuthRepository.save(preAuth);

    await this.submitPreAuthorizationRequest(savedPreAuth);

    return savedPreAuth;
  }

  async submitPreAuthorizationRequest(preAuth: PreAuthorization): Promise<void> {
    const policy = await this.policyRepository.findOne({
      where: { id: preAuth.policyId },
      relations: ['provider'],
    });

    if (!policy) {
      throw new NotFoundException('Associated policy not found');
    }

    try {
      const request: PreAuthRequest = {
        authorizationNumber: preAuth.authorizationNumber,
        policyNumber: policy.policyNumber,
        treatmentType: preAuth.treatmentType,
        treatmentDescription: preAuth.treatmentDescription,
        estimatedCost: preAuth.estimatedCost,
        veterinarian: {
          name: 'Dr. Example', 
          license: 'VET123456',
          clinic: 'Example Veterinary Clinic',
        },
        urgency: 'routine',
      };

      const response = await this.submitToProvider(policy.provider.code, request);

      preAuth.status = response.status;
      preAuth.authorizedAmount = response.authorizedAmount;
      preAuth.notes = response.denialReason || response.conditions?.join('; ');
      preAuth.providerResponse = response;

      if (response.expirationDate) {
        preAuth.expirationDate = response.expirationDate;
      }

      await this.preAuthRepository.save(preAuth);

    } catch (error) {
      this.logger.error(`Failed to submit pre-authorization ${preAuth.authorizationNumber}:`, error);
      preAuth.status = 'denied';
      preAuth.notes = 'Submission failed - please try again later';
      await this.preAuthRepository.save(preAuth);
    }
  }

  private async submitToProvider(providerCode: string, request: PreAuthRequest): Promise<PreAuthResponse> {
    switch (providerCode) {
      case 'PETPLAN':
        return await this.submitToPetPlanPreAuth(request);
      case 'TRUPANION':
        return await this.submitToTrupanionPreAuth(request);
      case 'NATIONWIDE':
        return await this.submitToNationwidePreAuth(request);
      default:
        return await this.submitToGenericPreAuth(request);
    }
  }

  private async submitToPetPlanPreAuth(request: PreAuthRequest): Promise<PreAuthResponse> {
    const provider = await this.getProviderByCode('PETPLAN');
    
    const response = await firstValueFrom(
      this.httpService.post(
        `${provider.apiEndpoint}/pre-authorization/submit`,
        {
          authorization_number: request.authorizationNumber,
          policy_number: request.policyNumber,
          treatment_type: request.treatmentType,
          treatment_description: request.treatmentDescription,
          estimated_cost: request.estimatedCost,
          veterinarian: request.veterinarian,
          urgency_level: request.urgency,
        },
        {
          headers: {
            'Authorization': `Bearer ${provider.apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      ),
    );

    return {
      success: response.data.status !== 'denied',
      authorizationNumber: response.data.authorization_number,
      status: response.data.status,
      authorizedAmount: response.data.authorized_amount,
      expirationDate: response.data.expiration_date ? new Date(response.data.expiration_date) : undefined,
      denialReason: response.data.denial_reason,
      conditions: response.data.conditions,
    };
  }

  private async submitToTrupanionPreAuth(request: PreAuthRequest): Promise<PreAuthResponse> {
    const provider = await this.getProviderByCode('TRUPANION');
    
    const response = await firstValueFrom(
      this.httpService.post(
        `${provider.apiEndpoint}/pre-authorizations`,
        {
          preAuthReference: request.authorizationNumber,
          policyId: request.policyNumber,
          proposedTreatment: {
            type: request.treatmentType,
            description: request.treatmentDescription,
            estimatedCost: request.estimatedCost,
          },
          veterinaryProvider: request.veterinarian,
          priority: request.urgency,
        },
        {
          headers: {
            'X-API-Key': provider.apiKey,
            'Content-Type': 'application/json',
          },
        },
      ),
    );

    return {
      success: response.data.approved || response.data.status === 'pending',
      authorizationNumber: response.data.authorizationId,
      status: response.data.approved ? 'approved' : (response.data.status === 'pending' ? 'pending' : 'denied'),
      authorizedAmount: response.data.approvedAmount,
      expirationDate: response.data.validUntil ? new Date(response.data.validUntil) : undefined,
      denialReason: response.data.reason,
      conditions: response.data.terms,
    };
  }

  private async submitToNationwidePreAuth(request: PreAuthRequest): Promise<PreAuthResponse> {
    const provider = await this.getProviderByCode('NATIONWIDE');
    
    const response = await firstValueFrom(
      this.httpService.post(
        `${provider.apiEndpoint}/preauthorization`,
        {
          authNumber: request.authorizationNumber,
          policyNumber: request.policyNumber,
          treatmentDetails: {
            category: request.treatmentType,
            description: request.treatmentDescription,
            estimatedCharges: request.estimatedCost,
          },
          providerInfo: request.veterinarian,
          urgencyFlag: request.urgency,
        },
        {
          headers: {
            'Authorization': `ApiKey ${provider.apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      ),
    );

    return {
      success: response.data.decision !== 'DENIED',
      authorizationNumber: response.data.authorizationNumber,
      status: response.data.decision.toLowerCase(),
      authorizedAmount: response.data.authorizedAmount,
      expirationDate: response.data.expirationDate ? new Date(response.data.expirationDate) : undefined,
      denialReason: response.data.denialReason,
      conditions: response.data.specialConditions,
    };
  }

  private async submitToGenericPreAuth(request: PreAuthRequest): Promise<PreAuthResponse> {
    return {
      success: true,
      authorizationNumber: request.authorizationNumber,
      status: 'approved',
      authorizedAmount: request.estimatedCost * 0.8, 
      expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 
    };
  }

  async checkPreAuthStatus(preAuthId: number): Promise<PreAuthorization> {
    const preAuth = await this.preAuthRepository.findOne({
      where: { id: preAuthId },
      relations: ['policy', 'policy.provider'],
    });

    if (!preAuth) {
      throw new NotFoundException(`Pre-authorization with ID ${preAuthId} not found`);
    }

    if (preAuth.expirationDate < new Date() && preAuth.status === 'approved') {
      preAuth.status = 'expired';
      await this.preAuthRepository.save(preAuth);
    }

    return preAuth;
  }

  async updatePreAuthorization(preAuthId: number, updateDto: UpdatePreAuthDto): Promise<PreAuthorization> {
    const preAuth = await this.preAuthRepository.findOne({ where: { id: preAuthId } });
    
    if (!preAuth) {
      throw new NotFoundException(`Pre-authorization with ID ${preAuthId} not found`);
    }

    Object.assign(preAuth, updateDto);
    return await this.preAuthRepository.save(preAuth);
  }

  async getPreAuthsByPolicy(policyId: number): Promise<PreAuthorization[]> {
    return await this.preAuthRepository.find({
      where: { policyId },
      order: { createdAt: 'DESC' },
    });
  }

  async getActivePreAuths(policyId: number): Promise<PreAuthorization[]> {
    return await this.preAuthRepository.find({
      where: { 
        policyId,
        status: 'approved',
        expirationDate: MoreThan(new Date()),
      },
      order: { expirationDate: 'ASC' },
    });
  }

  private async generateAuthorizationNumber(): Promise<string> {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `AUTH-${timestamp}-${random}`;
  }

  private calculateExpirationDate(): Date {
    return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }

  private async getProviderByCode(code: string): Promise<any> {
    const providers = {
      'PETPLAN': { apiEndpoint: 'https://api.petplan.com', apiKey: process.env.PETPLAN_API_KEY },
      'TRUPANION': { apiEndpoint: 'https://api.trupanion.com', apiKey: process.env.TRUPANION_API_KEY },
      'NATIONWIDE': { apiEndpoint: 'https://api.nationwide.com', apiKey: process.env.NATIONWIDE_API_KEY },
    };
    return providers[code];
  }
}

import { MoreThan } from 'typeorm';