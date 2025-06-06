import { IsUUID, IsDateString, IsOptional, IsNumber, Min, Max } from "class-validator"
import { Transform, Type } from "class-transformer"

export class AvailabilityQueryDto {
  @IsUUID()
  veterinarian_id: string

  @IsDateString()
  date: string

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(15)
  @Max(240)
  duration_minutes?: number = 30
}

export class AvailableVeterinariansDto {
  @IsDateString()
  date: string

  @IsOptional()
  @Transform(({ value }) => value?.trim())
  start_time?: string

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(15)
  @Max(240)
  duration_minutes?: number = 30

  @IsOptional()
  specialization?: string
}
