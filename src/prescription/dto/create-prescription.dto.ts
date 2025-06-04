import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsUUID,
  IsNumber,
  Min,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PrescriptionStatus } from '../enums/prescription-status.enum';

export class CreatePrescriptionDto {
  @ApiProperty({ description: 'Name of the medication' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Instructions for administering the medication' })
  @IsString()
  @IsNotEmpty()
  instructions: string;

  @ApiProperty({ description: 'Dosage information' })
  @IsString()
  @IsNotEmpty()
  dosage: string;

  @ApiProperty({ description: 'Frequency of administration' })
  @IsString()
  @IsNotEmpty()
  frequency: string;

  @ApiProperty({ description: 'Start date of the prescription' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ description: 'End date of the prescription', required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ description: 'Duration of the prescription in days' })
  @IsNumber()
  @Min(1)
  duration: number;

  @ApiProperty({ description: 'Number of refills allowed', default: 0 })
  @IsNumber()
  @Min(0)
  refillsAllowed: number;

  @ApiProperty({ description: 'Status of the prescription', enum: PrescriptionStatus, default: PrescriptionStatus.PENDING })
  @IsOptional()
  @IsEnum(PrescriptionStatus)
  status?: PrescriptionStatus;

  @ApiProperty({ description: 'Additional notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'External reference ID', required: false })
  @IsOptional()
  @IsString()
  externalReferenceId?: string;

  @ApiProperty({ description: 'ID of the pet' })
  @IsUUID()
  petId: string;
}
