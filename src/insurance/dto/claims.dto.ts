import { IsString, IsNumber, IsDateString, IsOptional, Min, IsEnum } from 'class-validator';

export class CreateClaimDto {
  @IsNumber()
  policyId: number | undefined;

  @IsDateString()
  treatmentDate: Date | undefined;

  @IsString()
  diagnosis: string | undefined;

  @IsString()
  treatmentDescription : string | undefined;

  @IsNumber()
  @Min(0)
  totalAmount: number | undefined;

  @IsString()
  veterinarianName: string | undefined;

  @IsString()
  veterinarianLicense: string | undefined;

  @IsString()
  clinicName: string | undefined;

  @IsString()
  clinicAddress: string | undefined;

  @IsOptional()
  @IsNumber()
  preAuthorizationId?: number | undefined;
}

export class UpdateClaimStatusDto {
  @IsOptional()
  @IsEnum(['draft', 'submitted', 'under_review', 'approved', 'denied', 'paid', 'partially_paid'])
  status?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  approvedAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  paidAmount?: number;

  @IsOptional()
  @IsString()
  denialReason?: string;
}

export class ClaimDocumentDto {
  @IsString()
  fileName: string | undefined;

  @IsString()
  originalName: string | undefined;

  @IsString()
  mimeType: string | undefined;

  @IsNumber()
  fileSize: number | undefined;

  @IsString()
  filePath: string | undefined;

  @IsEnum(['invoice', 'medical_record', 'prescription', 'lab_result', 'other'])
  documentType: string | undefined;
}
