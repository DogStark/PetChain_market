import { IsUUID, IsDateString, IsString, IsOptional, Length } from "class-validator"
import { Transform } from "class-transformer"

export class RescheduleAppointmentDto {
  @IsUUID()
  appointment_id: string

  @IsDateString()
  new_appointment_date: string

  @IsString()
  @Transform(({ value }) => value?.trim())
  new_start_time: string

  @IsOptional()
  @IsString()
  @Length(0, 500)
  reason?: string
}
