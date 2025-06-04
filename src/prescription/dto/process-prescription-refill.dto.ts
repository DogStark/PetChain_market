import {
  IsString,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RefillStatus } from '../enums/refill-status.enum';

export class ProcessPrescriptionRefillDto {
  @ApiProperty({ description: 'Status of the refill', enum: RefillStatus })
  @IsEnum(RefillStatus)
  status: RefillStatus;

  @ApiProperty({ description: 'Notes about the refill processing', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
