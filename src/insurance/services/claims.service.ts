import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { InsuranceClaim } from '../entities/insurance-claim.entity';
import { InsurancePolicy } from '../entities/insurance-policy.entity';
import { ClaimDocument } from '../entities/claim-document.entity';
import { PreAuthorization } from '../entities/pre-authorization.entity';
import { CreateClaimDto, UpdateClaimStatusDto } from '../dto/claims.dto';

export interface ClaimSubmissionRequest {
  claimNumber: string;
  policyNumber: string;
  treatmentDate: string;
  diagnosis: string;
  treatmentDescription: string;
  totalAmount: number;
  veterinarian: {
    name: string;
    license: string;
    clinic: string;
    address: string;
  };
  documents: {
    type: string;
    fileName: string;
    base64Data: string;
  }[];
  preAuthorizationNumber?: string;
}

export interface ClaimSubmissionResponse {
  success: boolean;
  claimId?: string;
  trackingNumber?: string;
  estimatedProcessingDays?: number;
  error?: string;
}

@Injectable()
export class ClaimsService {
  private readonly logger = new Logger(ClaimsService.name);

  constructor(
    @InjectRepository(InsuranceClaim)
    private claimRepository: Repository<InsuranceClaim>,
    @InjectRepository(InsurancePolicy)
    private policyRepository: Repository<InsurancePolicy>,
    @InjectRepository(ClaimDocument)
    private documentRepository: Repository<ClaimDocument>,
    @InjectRepository(PreAuthorization)
    private preAuthRepository: Repository<PreAuthorization>,
    private httpService: HttpService,
  ) {}

  async createClaim(createClaimDto: CreateClaimDto): Promise<InsuranceClaim> {
    const policy = await this.policyRepository.findOne({
      where: { id: createClaimDto.policyId },
      relations: ['provider'],
    });

    if (!policy) {
      throw new NotFoundException(`Policy with ID ${createClaimDto.policyId} not found`);
    }

    if (policy.status !== 'active') {
      throw new BadRequestException('Cannot create claim for inactive policy');
    }

    const claimNumber = await this.generateClaimNumber();

    const claim = this.claimRepository.create({
      ...createClaimDto,
      claimNumber,
      status: 'draft',
    });

    return await this.claimRepository.save(claim);
  }

  async submitClaim(claimId: number): Promise<ClaimSubmissionResponse> {
    const claim = await this.claimRepository.findOne({
      where: { id: claimId },
      relations: ['policy', 'policy.provider', 'documents', 'preAuthorization'],
    });

    if (!claim) {
      throw new NotFoundException(`Claim with ID ${claimId} not found`);
    }

    if (claim.status !== 'draft') {
      throw new BadRequestException('Only draft claims can be submitted');
    }

    const requiredDocTypes = ['invoice', 'medical_record'];
    const hasRequiredDocs = requiredDocTypes.every(type =>
      claim.documents.some(doc => doc.documentType === type)
    );

    if (!hasRequiredDocs) {
      throw new BadRequestException('Missing required documents (invoice and medical record)');
    }

    try {
      const submissionRequest: ClaimSubmissionRequest = {
        claimNumber: claim.claimNumber,
        policyNumber: claim.policy.policyNumber,
        treatmentDate: claim.treatmentDate.toISOString().split('T')[0],
        diagnosis: claim.diagnosis,
        treatmentDescription: claim.treatmentDescription,
        totalAmount: claim.totalAmount,
        veterinarian: {
          name: claim.veterinarianName,
          license: claim.veterinarianLicense,
          clinic: claim.clinicName,
          address: claim.clinicAddress,
        },
        documents: await this.prepareDocumentsForSubmission(claim.documents),
        preAuthorizationNumber: claim.preAuthorization?.authorizationNumber,
      };

      const response = await this.submitToProvider(claim.policy.provider.code, submissionRequest);

      if (response.success) {
        claim.status = 'submitted';
        claim.submittedAt = new Date();
        claim.providerResponse = response;
        await this.claimRepository.save(claim);

        return response;
      } else {
        throw new BadRequestException(`Claim submission failed: ${response.error}`);
      }
    } catch (error) {
      this.logger.error(`Failed to submit claim ${claim.claimNumber}:`, error);
      throw new BadRequestException('Claim submission failed. Please try again later.');
    }
  }

  private async submitToProvider(
    providerCode: string,
    request: ClaimSubmissionRequest,
  ): Promise<ClaimSubmissionResponse> {
    switch (providerCode) {
      case 'PETPLAN':
        return await this.submitToPetPlan(request);
      case 'TRUPANION':
        return await this.submitToTrupanion(request);
      case 'NATIONWIDE':
        return await this.submitToNationwide(request);
      default:
        return await this.submitToGenericProvider(request);
    }
  }

  private async submitToPetPlan(request: ClaimSubmissionRequest): Promise<ClaimSubmissionResponse> {
    const provider = await this.getProviderByCode('PETPLAN');
    
    const response = await firstValueFrom(
      this.httpService.post(
        `${provider.apiEndpoint}/claims/submit`,
        {
          claim_number: request.claimNumber,
          policy_number: request.policyNumber,
          treatment_date: request.treatmentDate,
          diagnosis: request.diagnosis,
          treatment_description: request.treatmentDescription,
          total_amount: request.totalAmount,
          veterinarian: request.veterinarian,
          documents: request.documents,
          pre_authorization: request.preAuthorizationNumber,
        },
        {
          headers: {
            'Authorization': `Bearer ${provider.apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      ),
    ) as { data: any };

    return {
      success: response.data.status === 'accepted',
      claimId: response.data.claim_id,
      trackingNumber: response.data.tracking_number,
      estimatedProcessingDays: response.data.estimated_processing_days,
      error: response.data.status !== 'accepted' ? response.data.message : undefined,
    };
  }

  private async submitToTrupanion(request: ClaimSubmissionRequest): Promise<ClaimSubmissionResponse> {
    const provider = await this.getProviderByCode('TRUPANION');
    
    const response = await firstValueFrom(
      this.httpService.post(
        `${provider.apiEndpoint}/claims`,
        {
          claimReference: request.claimNumber,
          policyId: request.policyNumber,
          incidentDate: request.treatmentDate,
          condition: request.diagnosis,
          treatmentNotes: request.treatmentDescription,
          invoiceAmount: request.totalAmount,
          veterinaryDetails: request.veterinarian,
          attachments: request.documents,
          preApprovalReference: request.preAuthorizationNumber,
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
      success: response.data.submitted,
      claimId: response.data.claimId,
      trackingNumber: response.data.referenceNumber,
      estimatedProcessingDays: response.data.processingTimedays,
      error: !response.data.submitted ? response.data.reason : undefined,
    };
  }

  private async submitToNationwide(request: ClaimSubmissionRequest): Promise<ClaimSubmissionResponse> {
    const provider = await this.getProviderByCode('NATIONWIDE');
    
    const response = await firstValueFrom(
      this.httpService.post(
        `${provider.apiEndpoint}/submit-claim`,
        {
          claimNumber: request.claimNumber,
          policyNumber: request.policyNumber,
          serviceDate: request.treatmentDate,
          diagnosisCode: request.diagnosis,
          treatmentDetails: request.treatmentDescription,
          chargeAmount: request.totalAmount,
          providerInfo: request.veterinarian,
          supportingDocuments: request.documents,
          authorizationCode: request.preAuthorizationNumber,
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
      success: response.data.accepted,
      claimId: response.data.id,
      trackingNumber: response.data.confirmationNumber,
      estimatedProcessingDays: response.data.estimatedProcessingDays,
      error: !response.data.accepted ? response.data.error : undefined,
    };
  }

  private async submitToGenericProvider(request: ClaimSubmissionRequest): Promise<ClaimSubmissionResponse> {
    return {
      success: true,
      claimId: `GENERIC_${request.claimNumber}`,
      trackingNumber: `TRK_${Date.now()}`,
      estimatedProcessingDays: 10,
    };
  }

  async trackClaimStatus(claimId: number): Promise<InsuranceClaim> {
    const claim = await this.claimRepository.findOne({
      where: { id: claimId },
      relations: ['policy', 'policy.provider'],
    });

    if (!claim) {
      throw new NotFoundException(`Claim with ID ${claimId} not found`);
    }

    if (claim.status === 'draft') {
      return claim; 
    }

    try {
      const statusUpdate = await this.checkClaimStatusWithProvider(claim);
      
      if (statusUpdate) {
        claim.status = statusUpdate.status;
        claim.approvedAmount = statusUpdate.approvedAmount;
        claim.paidAmount = statusUpdate.paidAmount;
        claim.denialReason = statusUpdate.denialReason;
        claim.processedAt = statusUpdate.processedAt;
        claim.providerResponse = { ...claim.providerResponse, ...statusUpdate.providerData };

        await this.claimRepository.save(claim);
      }

      return claim;
    } catch (error) {
      this.logger.error(`Failed to track claim status for ${claim.claimNumber}:`, error);
      return claim; 
    }
  }

  private async checkClaimStatusWithProvider(claim: InsuranceClaim): Promise<any> {
    const providerCode = claim.policy.provider.code;
    
    switch (providerCode) {
      case 'PETPLAN':
        return await this.checkPetPlanStatus(claim);
      case 'TRUPANION':
        return await this.checkTrupanionStatus(claim);
      case 'NATIONWIDE':
        return await this.checkNationwideStatus(claim);
      default:
        return null;
    }
  }

  private async checkPetPlanStatus(claim: InsuranceClaim): Promise<any> {
    const provider = claim.policy.provider;
    
    const response = await firstValueFrom(
      this.httpService.get(
        `${provider.apiEndpoint}/claims/${claim.claimNumber}/status`,
        {
          headers: {
            'Authorization': `Bearer ${provider.apiKey}`,
          },
        },
      ),
    );

    return {
      status: this.mapPetPlanStatus(response.data.status),
      approvedAmount: response.data.approved_amount,
      paidAmount: response.data.paid_amount,
      denialReason: response.data.denial_reason,
      processedAt: response.data.processed_at ? new Date(response.data.processed_at) : null,
      providerData: response.data,
    };
  }

  private async checkTrupanionStatus(claim: InsuranceClaim): Promise<any> {
    const provider = claim.policy.provider;
    
    const response = await firstValueFrom(
      this.httpService.get(
        `${provider.apiEndpoint}/claims/${claim.claimNumber}`,
        {
          headers: {
            'X-API-Key': provider.apiKey,
          },
        },
      ),
    ) as { data: any };

    return {
      status: this.mapTrupanionStatus(response.data.claimStatus),
      approvedAmount: response.data.approvedAmount,
      paidAmount: response.data.paidAmount,
      denialReason: response.data.declineReason,
      processedAt: response.data.processedDate ? new Date(response.data.processedDate) : null,
      providerData: response.data,
    };
  }

  private async checkNationwideStatus(claim: InsuranceClaim): Promise<any> {
    const provider = claim.policy.provider;
    
    const response = await firstValueFrom(
      this.httpService.get(
        `${provider.apiEndpoint}/claims/${claim.claimNumber}`,
        {
          headers: {
            'Authorization': `ApiKey ${provider.apiKey}`,
          },
        },
      ),
    );

    return {
      status: this.mapNationwideStatus(response.data.status),
      approvedAmount: response.data.approvedAmount,
      paidAmount: response.data.paidAmount,
      denialReason: response.data.denialReason,
      processedAt: response.data.processedDate ? new Date(response.data.processedDate) : null,
      providerData: response.data,
    };
  }

  private mapPetPlanStatus(providerStatus: string): string {
    const statusMap = {
      'received': 'submitted',
      'in_review': 'under_review',
      'approved': 'approved',
      'denied': 'denied',
      'paid': 'paid',
      'partially_paid': 'partially_paid',
    };
    return statusMap[providerStatus] || 'under_review';
  }

  private mapTrupanionStatus(providerStatus: string): string {
    const statusMap = {
      'submitted': 'submitted',
      'reviewing': 'under_review',
      'approved': 'approved',
      'declined': 'denied',
      'payment_sent': 'paid',
      'partial_payment': 'partially_paid',
    };
    return statusMap[providerStatus] || 'under_review';
  }

  private mapNationwideStatus(providerStatus: string): string {
    const statusMap = {
      'received': 'submitted',
      'processing': 'under_review',
      'approved': 'approved',
      'denied': 'denied',
      'paid': 'paid',
      'partial': 'partially_paid',
    };
    return statusMap[providerStatus] || 'under_review';
  }

  async updateClaimStatus(claimId: number, updateDto: UpdateClaimStatusDto): Promise<InsuranceClaim> {
    const claim = await this.claimRepository.findOne({ where: { id: claimId } });
    
    if (!claim) {
      throw new NotFoundException(`Claim with ID ${claimId} not found`);
    }

    Object.assign(claim, updateDto);
    
    if (updateDto.status === 'approved' || updateDto.status === 'denied') {
      claim.processedAt = new Date();
    }

    return await this.claimRepository.save(claim);
  }

  async getClaimsByPolicy(policyId: number): Promise<InsuranceClaim[]> {
    return await this.claimRepository.find({
      where: { policyId },
      relations: ['documents', 'preAuthorization'],
      order: { createdAt: 'DESC' },
    });
  }

  async getClaimById(claimId: number): Promise<InsuranceClaim> {
    const claim = await this.claimRepository.findOne({
      where: { id: claimId },
      relations: ['policy', 'policy.provider', 'documents', 'preAuthorization'],
    });

    if (!claim) {
      throw new NotFoundException(`Claim with ID ${claimId} not found`);
    }

    return claim;
  }

  private async generateClaimNumber(): Promise<string> {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `CLM-${timestamp}-${random}`;
  }

  private async prepareDocumentsForSubmission(documents: ClaimDocument[]): Promise<any[]> {
    return documents.map(doc => ({
      type: doc.documentType,
      fileName: doc.originalName,
      base64Data: `data:${doc.mimeType};base64,${Buffer.from(doc.filePath).toString('base64')}`,
    }));
  }

  private async getProviderByCode(code: 'PETPLAN' | 'TRUPANION' | 'NATIONWIDE'): Promise<{ apiEndpoint: string; apiKey: string | undefined }> {
    const providers = {
      'PETPLAN': { apiEndpoint: 'https://api.petplan.com', apiKey: process.env.PETPLAN_API_KEY },
      'TRUPANION': { apiEndpoint: 'https://api.trupanion.com', apiKey: process.env.TRUPANION_API_KEY },
      'NATIONWIDE': { apiEndpoint: 'https://api.nationwide.com', apiKey: process.env.NATIONWIDE_API_KEY },
    };
    return providers[code];
  }
}