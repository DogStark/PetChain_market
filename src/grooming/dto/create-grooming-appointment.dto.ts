import { AppointmentStatus } from '@/common/enums/emergency.enum';
import { IsNotEmpty, IsString, IsEnum, IsDateString } from 'class-validator';

export class CreateGroomingAppointmentDto {
  @IsNotEmpty()
  @IsString()
  userId!: string;

  @IsNotEmpty()
  @IsString()
  petId!: string;

  @IsNotEmpty()
  @IsString()
  packageId!: string;

  @IsNotEmpty()
  @IsDateString()
  appointmentTime!: string;

  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;

  notes?: string;
}
