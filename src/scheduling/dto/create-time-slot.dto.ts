import { IsEnum, IsOptional, IsDateString, IsBoolean, IsString, IsObject, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TimeSlotStatus } from '../entities/time-slot.entity';

export class CreateTimeSlotDto {
  @IsDateString()
  @ApiProperty({ description: 'Start time of the slot' })
  startTime: string;

  @IsDateString()
  @ApiProperty({ description: 'End time of the slot' })
  endTime: string;

  @IsEnum(TimeSlotStatus)
  @IsOptional()
  @ApiProperty({ 
    enum: TimeSlotStatus, 
    default: TimeSlotStatus.AVAILABLE, 
    description: 'Status of the time slot' 
  })
  status?: TimeSlotStatus;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({ required: false, default: true, description: 'Whether the time slot is active' })
  isActive?: boolean;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false, description: 'ID of an appointment associated with this slot' })
  appointmentId?: string;

  @IsNumber()
  @ApiProperty({ description: 'ID of the availability schedule this slot belongs to' })
  availabilityScheduleId: number;

  @IsObject()
  @IsOptional()
  @ApiProperty({ required: false, description: 'Additional metadata for the time slot' })
  metadata?: Record<string, any>;
}
