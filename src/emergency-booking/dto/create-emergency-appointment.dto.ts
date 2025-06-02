import {
  IsString,
  IsEmail,
  IsPhoneNumber,
  IsNumber,
  IsOptional,
  IsEnum,
  MinLength,
} from 'class-validator';
import { EmergencyPriority } from '../../common/enums/emergency.enum';

export class CreateEmergencyAppointmentDto {
  @IsString()
  @MinLength(1)
  petName: string;

  @IsString()
  petSpecies: string;

  @IsNumber()
  petAge: number;

  @IsString()
  @MinLength(1)
  ownerName: string;

  @IsPhoneNumber()
  ownerPhone: string;

  @IsEmail()
  ownerEmail: string;

  @IsPhoneNumber()
  emergencyContactPhone: string;

  @IsString()
  @MinLength(10)
  symptoms: string;

  @IsOptional()
  @IsString()
  additionalNotes?: string;

  @IsOptional()
  @IsEnum(EmergencyPriority)
  priority?: EmergencyPriority;
}
