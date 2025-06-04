import { IsEnum, IsOptional, IsDateString, IsNumber, IsBoolean, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { RecurrenceType } from '../entities/schedule-pattern.entity';

class RecurrenceRuleDto {
  @IsOptional()
  @IsNumber()
  @ApiProperty({ required: false, description: 'Interval for recurrence pattern' })
  interval?: number;

  @IsOptional()
  @ApiProperty({ required: false, description: 'Days of week (0-6, where 0 is Sunday)' })
  daysOfWeek?: number[];

  @IsOptional()
  @ApiProperty({ required: false, description: 'Days of month (1-31)' })
  daysOfMonth?: number[];

  @IsOptional()
  @ApiProperty({ required: false, description: 'Months of year (0-11, where 0 is January)' })
  monthsOfYear?: number[];

  @IsOptional()
  @ApiProperty({ required: false, description: 'Positions for complex recurrence rules' })
  positions?: number[];
}

export class CreateSchedulePatternDto {
  @IsEnum(RecurrenceType)
  @ApiProperty({ enum: RecurrenceType, default: RecurrenceType.WEEKLY, description: 'Type of recurrence pattern' })
  recurrenceType: RecurrenceType;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => RecurrenceRuleDto)
  @ApiProperty({ required: false, type: RecurrenceRuleDto, description: 'Rules for the recurrence pattern' })
  recurrenceRule?: RecurrenceRuleDto;

  @IsDateString()
  @ApiProperty({ description: 'Start date for the pattern' })
  startDate: string;

  @IsOptional()
  @IsDateString()
  @ApiProperty({ required: false, description: 'End date for the pattern' })
  endDate?: string;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ required: false, default: -1, description: 'Number of occurrences (-1 for infinite)' })
  occurrences?: number;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ required: false, default: true, description: 'Whether the pattern is active' })
  isActive?: boolean;

  @IsNumber()
  @ApiProperty({ description: 'ID of the availability schedule this pattern belongs to' })
  availabilityScheduleId: number;

  @IsOptional()
  @IsObject()
  @ApiProperty({ required: false, description: 'Additional metadata for the pattern' })
  metadata?: Record<string, any>;
}
