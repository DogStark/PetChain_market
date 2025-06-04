import { IsString, IsNumber, IsDateString, IsOptional, Min, IsEnum } from 'class-validator';

export class CreatePreAuthDto {
  @IsNumber()
  policyId: number | undefined;

  @IsString()
  treatmentType: string | undefined;

  @IsString()
  treatmentDescription: string | undefined;

  @IsNumber()
  @Min(0)
  estimatedCost: number | undefined;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdatePreAuthDto {
  @IsOptional()
  @IsEnum(['pending', 'approved', 'denied', 'expired'])
  status?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  authorizedAmount?: number;

  @IsOptional()
  @IsDateString()
  expirationDate?: Date;

  @IsOptional()
  @IsString()
  notes?: string;
}
