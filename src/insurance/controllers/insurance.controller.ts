import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { InsuranceProvidersService } from '../services/insurance-providers.service';
import { ClaimsService } from '../services/claims.service';
import { PreAuthorizationService } from '../services/pre-authorization.service';
import { BillingService } from '../services/billing.service';
import {
  CreateClaimDto,
  UpdateClaimStatusDto,
  ClaimDocumentDto,
} from '../dto/claims.dto';
import {
  CreatePreAuthDto,
  UpdatePreAuthDto,
} from '../dto/pre-authorization.dto';
import {
  VerifyInsuranceDto,
  CreatePolicyDto,
  UpdatePolicyDto,
} from '../dto/insurance-verification.dto';

@Controller('insurance')
@UseGuards(AuthGuard('jwt'))
export class InsuranceController {
  constructor(
    private readonly providersService: InsuranceProvidersService,
    private readonly claimsService: ClaimsService,
    private readonly preAuthService: PreAuthorizationService,
    private readonly billingService: BillingService,
  ) {}

  @Get('providers')
  async getProviders() {
    const providers = await this.providersService.getAllProviders();
    return { providers };
  }

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  async verifyInsurance(
    @Body() verifyDto: VerifyInsuranceDto,
    @Query('providerId', ParseIntPipe) providerId: number,
  ) {
    const result = await this.providersService.verifyInsurance(providerId, verifyDto);
    return {
      message: 'Insurance verification completed',
      verification: result,
    };
  }

  @Patch('policies/:id/sync')
  async syncPolicyData(@Param('id', ParseIntPipe) policyId: number) {
    const policy = await this.providersService.syncPolicyData(policyId);
    return {
      message: 'Policy data synchronized successfully',
      policy,
    };
  }

  @Post('claims')
  @HttpCode(HttpStatus.CREATED)
  async createClaim(@Body() createClaimDto: CreateClaimDto, @Request() req: any) {
    const claim = await this.claimsService.createClaim(createClaimDto);
    return {
      message: 'Claim created successfully',
      claim,
    };
  }

  @Post('claims/:id/submit')
  @HttpCode(HttpStatus.OK)
  async submitClaim(@Param('id', ParseIntPipe) claimId: number) {
    const result = await this.claimsService.submitClaim(claimId);
    return {
      message: 'Claim submitted successfully',
      submission: result,
    };
  }

  @Get('claims/:id')
  async getClaim(@Param('id', ParseIntPipe) claimId: number) {
    const claim = await this.claimsService.getClaimById(claimId);
    return { claim };
  }

  @Get('policies/:policyId/claims')
  async getClaimsByPolicy(@Param('policyId', ParseIntPipe) policyId: number) {
    const claims = await this.claimsService.getClaimsByPolicy(policyId);
    return { claims };
  }

  @Patch('claims/:id/status')
  async updateClaimStatus(
    @Param('id', ParseIntPipe) claimId: number,
    @Body() updateDto: UpdateClaimStatusDto,
  ) {
    const claim = await this.claimsService.updateClaimStatus(claimId, updateDto);
    return {
      message: 'Claim status updated successfully',
      claim,
    };
  }

  @Get('claims/:id/track')
  async trackClaimStatus(@Param('id', ParseIntPipe) claimId: number) {
    const claim = await this.claimsService.trackClaimStatus(claimId);
    return {
      message: 'Claim status retrieved successfully',
      claim,
    };
  }

  @Post('claims/:id/documents')
  @UseInterceptors(FilesInterceptor('documents', 10))
  async uploadClaimDocuments(
    @Param('id', ParseIntPipe) claimId: number,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() documentData: ClaimDocumentDto[],
  ) {
    return {
      message: 'Documents uploaded successfully',
      uploadedCount: files.length,
    };
  }

  @Post('pre-authorizations')
  @HttpCode(HttpStatus.CREATED)
  async createPreAuthorization(@Body() createDto: CreatePreAuthDto) {
    const preAuth = await this.preAuthService.createPreAuthorization(createDto);
    return {
      message: 'Pre-authorization request created successfully',
      preAuthorization: preAuth,
    };
  }

  @Get('pre-authorizations/:id')
  async getPreAuthorization(@Param('id', ParseIntPipe) preAuthId: number) {
    const preAuth = await this.preAuthService.checkPreAuthStatus(preAuthId);
    return { preAuthorization: preAuth };
  }

  @Get('policies/:policyId/pre-authorizations')
  async getPreAuthsByPolicy(@Param('policyId', ParseIntPipe) policyId: number) {
    const preAuths = await this.preAuthService.getPreAuthsByPolicy(policyId);
    return { preAuthorizations: preAuths };
  }

  @Get('policies/:policyId/pre-authorizations/active')
  async getActivePreAuths(@Param('policyId', ParseIntPipe) policyId: number) {
    const activePreAuths = await this.preAuthService.getActivePreAuths(policyId);
    return { activePreAuthorizations: activePreAuths };
  }

  @Patch('pre-authorizations/:id')
  async updatePreAuthorization(
    @Param('id', ParseIntPipe) preAuthId: number,
    @Body() updateDto: UpdatePreAuthDto,
  ) {
    const preAuth = await this.preAuthService.updatePreAuthorization(preAuthId, updateDto);
    return {
      message: 'Pre-authorization updated successfully',
      preAuthorization: preAuth,
    };
  }

  @Get('claims/:id/billing')
  async calculateBilling(@Param('id', ParseIntPipe) claimId: number) {
    const billing = await this.billingService.calculateBilling(claimId);
    return {
      message: 'Billing calculation completed',
      billing,
    };
  }

  @Post('claims/:id/coordinate-payment')
  @HttpCode(HttpStatus.OK)
  async coordinatePayment(@Param('id', ParseIntPipe) claimId: number) {
    const coordination = await this.billingService.coordinatePayment(claimId);
    return {
      message: 'Payment coordination completed',
      coordination,
    };
  }

  @Post('claims/:id/direct-payment')
  @HttpCode(HttpStatus.OK)
  async processDirectPayment(@Param('id', ParseIntPipe) claimId: number) {
    const success = await this.billingService.processDirectPayment(claimId);
    return {
      message: success ? 'Direct payment processed successfully' : 'Direct payment failed',
      success,
    };
  }

  @Get('claims/:id/reimbursement-instructions')
  async getReimbursementInstructions(@Param('id', ParseIntPipe) claimId: number) {
    const instructions = await this.billingService.generateReimbursementInstructions(claimId);
    return {
      message: 'Reimbursement instructions generated',
      instructions,
    };
  }

  @Get('policies/:policyId/billing-history')
  async getBillingHistory(@Param('policyId', ParseIntPipe) policyId: number) {
    const history = await this.billingService.getBillingHistory(policyId);
    return {
      message: 'Billing history retrieved successfully',
      history,
    };
  }

  @Post('policies/:policyId/validate-eligibility')
  @HttpCode(HttpStatus.OK)
  async validateBillingEligibility(
    @Param('policyId', ParseIntPipe) policyId: number,
    @Body('treatmentAmount') treatmentAmount: number,
  ) {
    const validation = await this.billingService.validateBillingEligibility(
      policyId,
      treatmentAmount,
    );
    return {
      message: 'Billing eligibility validated',
      validation,
    };
  }

  @Get('analytics/claims-summary')
  async getClaimsSummary(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('providerId') providerId?: number,
  ) {
    return {
      message: 'Claims summary retrieved',
      summary: {
        totalClaims: 0,
        approvedClaims: 0,
        deniedClaims: 0,
        pendingClaims: 0,
        totalPaidAmount: 0,
        averageProcessingTime: 0,
      },
    };
  }

  @Get('dashboard')
  async getDashboard(@Request() req: any) {
    return {
      message: 'Insurance dashboard data retrieved',
      dashboard: {
        activePolicies: 0,
        pendingClaims: 0,
        recentPayments: [],
        upcomingExpirations: [],
        utilizationRate: 0,
      },
    };
  }
}