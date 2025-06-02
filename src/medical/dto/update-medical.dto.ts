import { PartialType } from '@nestjs/mapped-types';
import { CreateMedicalDto } from './create-medical.dto';

export class UpdateMedicalDto extends PartialType(CreateMedicalDto) {}
