import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { SchedulingService } from '../services/scheduling.service';
import { TimeSlot } from '../entities/time-slot.entity';
import { ScheduleException } from '../entities/schedule-exception.entity';

@ApiTags('scheduling')
@Controller('scheduling')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SchedulingController {
  constructor(private readonly schedulingService: SchedulingService) {}

  @Post('generate-slots/:veterinarianId')
  @Roles('admin', 'veterinarian', 'staff')
  @ApiOperation({ summary: 'Generate time slots for a veterinarian' })
  @ApiResponse({ status: 201, description: 'Time slots have been successfully generated.', type: [TimeSlot] })
  @ApiResponse({ status: 400, description: 'Invalid input data or no availability schedules found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  generateTimeSlots(
    @Param('veterinarianId') veterinarianId: string,
    @Body('startDate') startDate: string,
    @Body('endDate') endDate: string,
  ): Promise<TimeSlot[]> {
    return this.schedulingService.generateTimeSlots(
      +veterinarianId,
      new Date(startDate),
      new Date(endDate)
    );
  }

  @Get('availability/:veterinarianId')
  @Roles('admin', 'veterinarian', 'staff', 'client')
  @ApiOperation({ summary: 'Check availability for a veterinarian' })
  @ApiResponse({ status: 200, description: 'Return availability information.', type: Object })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  checkAvailability(
    @Param('veterinarianId') veterinarianId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<{ available: boolean; availableSlots: TimeSlot[] }> {
    return this.schedulingService.checkAvailability(
      +veterinarianId,
      new Date(startDate),
      new Date(endDate)
    );
  }

  @Post('block-slots/:veterinarianId')
  @Roles('admin', 'veterinarian', 'staff')
  @ApiOperation({ summary: 'Block time slots for a veterinarian' })
  @ApiResponse({ status: 201, description: 'Time slots have been successfully blocked.', type: [TimeSlot] })
  @ApiResponse({ status: 400, description: 'No available time slots found in the specified time range.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  blockTimeSlots(
    @Param('veterinarianId') veterinarianId: string,
    @Body('startTime') startTime: string,
    @Body('endTime') endTime: string,
    @Body('reason') reason: string,
  ): Promise<TimeSlot[]> {
    return this.schedulingService.blockTimeSlots(
      +veterinarianId,
      new Date(startTime),
      new Date(endTime),
      reason
    );
  }

  @Post('break/:veterinarianId')
  @Roles('admin', 'veterinarian', 'staff')
  @ApiOperation({ summary: 'Add break time for a veterinarian' })
  @ApiResponse({ status: 201, description: 'Break time has been successfully added.', type: ScheduleException })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 409, description: 'Break time overlaps with existing exceptions.' })
  addBreakTime(
    @Param('veterinarianId') veterinarianId: string,
    @Body() breakData: {
      startTime: string;
      endTime: string;
      title: string;
      description?: string;
      isRecurring?: boolean;
      recurrenceRule?: any;
    },
  ): Promise<ScheduleException> {
    return this.schedulingService.addBreakTime(
      +veterinarianId,
      new Date(breakData.startTime),
      new Date(breakData.endTime),
      breakData.title,
      breakData.description,
      breakData.isRecurring,
      breakData.recurrenceRule
    );
  }

  @Post('holiday/:veterinarianId')
  @Roles('admin', 'veterinarian', 'staff')
  @ApiOperation({ summary: 'Add holiday for a veterinarian' })
  @ApiResponse({ status: 201, description: 'Holiday has been successfully added.', type: ScheduleException })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 409, description: 'Holiday overlaps with existing exceptions.' })
  addHoliday(
    @Param('veterinarianId') veterinarianId: string,
    @Body() holidayData: {
      startTime: string;
      endTime: string;
      title: string;
      description?: string;
      isRecurring?: boolean;
      recurrenceRule?: any;
    },
  ): Promise<ScheduleException> {
    return this.schedulingService.addHoliday(
      +veterinarianId,
      new Date(holidayData.startTime),
      new Date(holidayData.endTime),
      holidayData.title,
      holidayData.description,
      holidayData.isRecurring,
      holidayData.recurrenceRule
    );
  }

  @Post('resolve-conflicts/:veterinarianId')
  @Roles('admin', 'veterinarian', 'staff')
  @ApiOperation({ summary: 'Resolve scheduling conflicts for a veterinarian' })
  @ApiResponse({ status: 200, description: 'Conflicts have been resolved.', type: Object })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  resolveConflicts(
    @Param('veterinarianId') veterinarianId: string,
    @Body('startDate') startDate: string,
    @Body('endDate') endDate: string,
  ): Promise<{ resolved: number; errors: string[] }> {
    return this.schedulingService.resolveConflicts(
      +veterinarianId,
      new Date(startDate),
      new Date(endDate)
    );
  }
}
