import { IsString, IsNumber, IsDateString, IsEmail, IsPhoneNumber, Min, Max } from 'class-validator';

export class CreatePolicyDto {
  @IsString()
  policyNumber: string;

  @IsString()
  holderName: string;

  @IsEmail()
  holderEmail: string;

  @IsPhoneNumber()
  holderPhone: string;

  @IsNumber()
  @Min(0)
  deductible: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  coveragePercentage: number;

  @IsNumber()
  @Min(0)
  annualLimit: number;

  @IsDateString()
  effectiveDate: Date;

  @IsDateString()
  expirationDate: Date;

  @IsNumber()
  providerId: number;

  @IsNumber()
  petId: number;
}

export class UpdatePolicyDto {
  @IsOptional()
  @IsString()
  holderName?: string;

  @IsOptional()
  @IsEmail()
  holderEmail?: string;

  @IsOptional()
  @IsPhoneNumber()
  holderPhone?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  deductible?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  coveragePercentage?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  annualLimit?: number;

  @IsOptional()
  @IsDateString()
  expirationDate?: Date;

  @IsOptional()
  @IsEnum(['active', 'suspended', 'cancelled', 'expired'])
  status?: string;
}