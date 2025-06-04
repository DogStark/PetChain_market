import { IsEnum, IsString, IsOptional, IsBoolean, IsDateString, IsNumber } from 'class-validator';
import { DayOfWeek } from '../entities/availability-schedule.entity';

export class CreateAvailabilityScheduleDto {
  @IsEnum(DayOfWeek)
  dayOfWeek: DayOfWeek;

  @IsString()
  startTime: string;

  @IsString()
  endTime: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsDateString()
  effectiveFrom?: string;

  @IsOptional()
  @IsDateString()
  effectiveTo?: string;

  @IsNumber()
  veterinarianId: number;
}