import { PartialType } from '@nestjs/mapped-types';
import { CreateGroomingAppointmentDto } from './create-grooming-appointment.dto';

export class UpdateGroomingAppointmentDto extends PartialType(CreateGroomingAppointmentDto) {}
