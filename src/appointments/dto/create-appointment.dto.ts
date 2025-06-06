import {
  IsUUID,
  IsDateString,
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  IsBoolean,
  Min,
  Max,
  Length,
} from "class-validator"
import { Transform } from "class-transformer"
import { AppointmentType } from "../entities/appointment.entity"

export class CreateAppointmentDto {
  @IsUUID()
  veterinarian_id: string

  @IsUUID()
  client_id: string

  @IsUUID()
  pet_id: string

  @IsDateString()
  appointment_date: string

  @IsString()
  @Transform(({ value }) => value?.trim())
  start_time: string // Format: "HH:MM"

  @IsOptional()
  @IsNumber()
  @Min(15)
  @Max(240)
  duration_minutes?: number = 30

  @IsEnum(AppointmentType)
  appointment_type: AppointmentType

  @IsOptional()
  @IsString()
  @Length(0, 500)
  reason?: string

  @IsOptional()
  @IsString()
  @Length(0, 1000)
  notes?: string

  @IsOptional()
  @IsNumber()
  @Min(0)
  estimated_cost?: number

  @IsOptional()
  @IsBoolean()
  is_emergency?: boolean = false

  @IsOptional()
  @IsString()
  booking_source?: string = "online"
}
