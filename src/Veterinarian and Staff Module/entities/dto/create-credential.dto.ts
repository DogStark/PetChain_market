import { IsString, IsEnum, IsDateString, IsOptional, IsBoolean, IsNumber } from 'class-validator';
import { CredentialType } from '../entities/credential.entity';

export class CreateCredentialDto {
  @IsString()
  name: string;

  @IsEnum(CredentialType)
  type: CredentialType;

  @IsString()
  issuingAuthority: string;

  @IsString()
  licenseNumber: string;

  @IsDateString()
  issueDate: string;

  @IsDateString()
  expirationDate: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsNumber()
  veterinarianId: number;
}