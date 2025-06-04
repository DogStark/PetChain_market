import { IsOptional, IsNumber, IsBoolean, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class TimeRangeDto {
  @IsOptional()
  @ApiProperty({ required: false, description: 'Start time in HH:MM format' })
  start: string;

  @IsOptional()
  @ApiProperty({ required: false, description: 'End time in HH:MM format' })
  end: string;
}

class DailyScheduleDto {
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => TimeRangeDto)
  @ApiProperty({ required: false, type: [TimeRangeDto], description: 'Array of time ranges' })
  monday?: TimeRangeDto[];

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => TimeRangeDto)
  @ApiProperty({ required: false, type: [TimeRangeDto], description: 'Array of time ranges' })
  tuesday?: TimeRangeDto[];

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => TimeRangeDto)
  @ApiProperty({ required: false, type: [TimeRangeDto], description: 'Array of time ranges' })
  wednesday?: TimeRangeDto[];

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => TimeRangeDto)
  @ApiProperty({ required: false, type: [TimeRangeDto], description: 'Array of time ranges' })
  thursday?: TimeRangeDto[];

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => TimeRangeDto)
  @ApiProperty({ required: false, type: [TimeRangeDto], description: 'Array of time ranges' })
  friday?: TimeRangeDto[];

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => TimeRangeDto)
  @ApiProperty({ required: false, type: [TimeRangeDto], description: 'Array of time ranges' })
  saturday?: TimeRangeDto[];

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => TimeRangeDto)
  @ApiProperty({ required: false, type: [TimeRangeDto], description: 'Array of time ranges' })
  sunday?: TimeRangeDto[];
}

export class CreateSchedulingConfigDto {
  @IsNumber()
  @IsOptional()
  @ApiProperty({ required: false, default: 30, description: 'Default duration of appointment slots in minutes' })
  defaultSlotDurationMinutes?: number;

  @IsNumber()
  @IsOptional()
  @ApiProperty({ required: false, default: 0, description: 'Buffer time between appointments in minutes' })
  bufferTimeMinutes?: number;

  @IsNumber()
  @IsOptional()
  @ApiProperty({ required: false, default: 7, description: 'Maximum number of days in advance for booking' })
  maxDaysInAdvance?: number;

  @IsNumber()
  @IsOptional()
  @ApiProperty({ required: false, default: 1, description: 'Minimum hours before an appointment can be booked' })
  minHoursBeforeBooking?: number;

  @IsNumber()
  @IsOptional()
  @ApiProperty({ required: false, default: 24, description: 'Hours before appointment for cancellation policy' })
  cancellationPolicyHours?: number;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({ required: false, default: true, description: 'Whether recurring appointments are allowed' })
  allowRecurringAppointments?: boolean;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({ required: false, default: false, description: 'Whether overlapping appointments are allowed' })
  allowOverlappingAppointments?: boolean;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({ required: false, default: true, description: 'Whether appointments are auto-confirmed' })
  autoConfirmAppointments?: boolean;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => DailyScheduleDto)
  @ApiProperty({ required: false, type: DailyScheduleDto, description: 'Working hours configuration' })
  workingHours?: DailyScheduleDto;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => DailyScheduleDto)
  @ApiProperty({ required: false, type: DailyScheduleDto, description: 'Break times configuration' })
  breakTimes?: DailyScheduleDto;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({ required: false, default: true, description: 'Whether the configuration is active' })
  isActive?: boolean;

  @IsNumber()
  @IsOptional()
  @ApiProperty({ required: false, description: 'ID of the veterinarian this config belongs to (null for global)' })
  veterinarianId?: number;
}
