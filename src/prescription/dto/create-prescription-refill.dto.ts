import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePrescriptionRefillDto {
  @ApiProperty({ description: 'ID of the prescription to refill' })
  @IsUUID()
  prescriptionId: string;

  @ApiProperty({ description: 'Additional notes for the refill request', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
