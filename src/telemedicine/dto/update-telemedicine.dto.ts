import { PartialType } from '@nestjs/mapped-types';
import { CreateTelemedicineDto } from './create-telemedicine.dto';

export class UpdateTelemedicineDto extends PartialType(CreateTelemedicineDto) {}
