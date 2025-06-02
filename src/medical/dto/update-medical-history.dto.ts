import { PartialType } from '@nestjs/mapped-types';
import { CreateMedicalHistoryDto } from './create-medical-history.dto';
import { OmitType } from '@nestjs/swagger';

export class UpdateMedicalHistoryDto extends PartialType(
  OmitType(CreateMedicalHistoryDto, ['petId'] as const),
) {}
