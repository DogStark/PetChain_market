import { IsEnum, IsOptional, IsDateString, IsBoolean, IsString, IsObject, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ExceptionType } from '../entities/schedule-exception.entity';

class RecurrenceRuleDto {
  @IsOptional()
  @IsString()
  @ApiProperty({ required: false, description: 'Frequency of recurrence (daily, weekly, monthly, yearly)' })
  frequency?: string;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ required: false, description: 'Interval for recurrence' })
  interval?: number;

  @IsOptional()
  @ApiProperty({ required: false, description: 'Days of week (0-6, where 0 is Sunday)' })
  daysOfWeek?: number[];

  @IsOptional()
  @IsDateString()
  @ApiProperty({ required: false, description: 'Date until which the recurrence is valid' })
  until?: string;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ required: false, description: 'Number of occurrences' })
  count?: number;
}

export class CreateScheduleExceptionDto {
  @IsEnum(ExceptionType)
  @ApiProperty({ enum: ExceptionType, description: 'Type of schedule exception' })
  type: ExceptionType;

  @IsString()
  @ApiProperty({ description: 'Title of the exception' })
  title: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false, description: 'Description of the exception' })
  description?: string;

  @IsDateString()
  @ApiProperty({ description: 'Start time of the exception' })
  startTime: string;

  @IsDateString()
  @ApiProperty({ description: 'End time of the exception' })
  endTime: string;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({ required: false, default: false, description: 'Whether the exception is recurring' })
  isRecurring?: boolean;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => RecurrenceRuleDto)
  @ApiProperty({ required: false, type: RecurrenceRuleDto, description: 'Rules for recurring exceptions' })
  recurrenceRule?: RecurrenceRuleDto;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({ required: false, default: true, description: 'Whether the exception is active' })
  isActive?: boolean;

  @IsNumber()
  @ApiProperty({ description: 'ID of the veterinarian this exception belongs to' })
  veterinarianId: number;
}
