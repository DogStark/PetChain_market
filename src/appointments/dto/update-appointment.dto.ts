import { IsOptional, IsDateString, IsString, IsEnum, IsNumber, Min, Max, Length } from "class-validator"
import { Transform } from "class-transformer"
import { AppointmentType, AppointmentStatus } from "../entities/appointment.entity"

export class UpdateAppointmentDto {
  @IsOptional()
  @IsDateString()
  appointment_date?: string

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  start_time?: string

  @IsOptional()
  @IsNumber()
  @Min(15)
  @Max(240)
  duration_minutes?: number

  @IsOptional()
  @IsEnum(AppointmentType)
  appointment_type?: AppointmentType

  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus

  @IsOptional()
  @IsString()
  @Length(0, 500)
  reason?: string

  @IsOptional()
  @IsString()
  @Length(0, 1000)
  notes?: string

  @IsOptional()
  @IsString()
  @Length(0, 1000)
  veterinarian_notes?: string

  @IsOptional()
  @IsNumber()
  @Min(0)
  estimated_cost?: number

  @IsOptional()
  @IsNumber()
  @Min(0)
  actual_cost?: number

  @IsOptional()
  @IsString()
  @Length(0, 500)
  cancellation_reason?: string
}
