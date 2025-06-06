import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { TimeSlotService } from '../services/time-slot.service';
import { CreateTimeSlotDto } from '../dto/create-time-slot.dto';
import { UpdateTimeSlotDto } from '../dto/update-time-slot.dto';
import { TimeSlot } from '../entities/time-slot.entity';

@ApiTags('time-slots')
@Controller('time-slots')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class TimeSlotController {
  constructor(private readonly timeSlotService: TimeSlotService) {}

  @Post()
  @Roles('admin', 'veterinarian', 'staff')
  @ApiOperation({ summary: 'Create a new time slot' })
  @ApiResponse({ status: 201, description: 'The time slot has been successfully created.', type: TimeSlot })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 409, description: 'Time slot overlaps with existing slots.' })
  create(@Body() createTimeSlotDto: CreateTimeSlotDto): Promise<TimeSlot> {
    return this.timeSlotService.create(createTimeSlotDto);
  }

  @Post('batch')
  @Roles('admin', 'veterinarian', 'staff')
  @ApiOperation({ summary: 'Create multiple time slots in a batch' })
  @ApiResponse({ status: 201, description: 'The time slots have been successfully created.', type: [TimeSlot] })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 409, description: 'Time slots overlap with existing slots.' })
  createBatch(@Body() createTimeSlotDtos: CreateTimeSlotDto[]): Promise<TimeSlot[]> {
    return this.timeSlotService.createBatch(createTimeSlotDtos);
  }

  @Get()
  @Roles('admin', 'veterinarian', 'staff')
  @ApiOperation({ summary: 'Get all time slots' })
  @ApiResponse({ status: 200, description: 'Return all time slots.', type: [TimeSlot] })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  findAll(): Promise<TimeSlot[]> {
    return this.timeSlotService.findAll();
  }

  @Get('date-range')
  @Roles('admin', 'veterinarian', 'staff', 'client')
  @ApiOperation({ summary: 'Get time slots by date range' })
  @ApiResponse({ status: 200, description: 'Return time slots in the date range.', type: [TimeSlot] })
  @ApiResponse({ status: 400, description: 'Invalid date range.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  findByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<TimeSlot[]> {
    return this.timeSlotService.findByDateRange(
      new Date(startDate),
      new Date(endDate)
    );
  }

  @Get('available')
  @Roles('admin', 'veterinarian', 'staff', 'client')
  @ApiOperation({ summary: 'Get available time slots by date range' })
  @ApiResponse({ status: 200, description: 'Return available time slots in the date range.', type: [TimeSlot] })
  @ApiResponse({ status: 400, description: 'Invalid date range.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  findAvailableByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<TimeSlot[]> {
    return this.timeSlotService.findAvailableByDateRange(
      new Date(startDate),
      new Date(endDate)
    );
  }

  @Get('veterinarian/:id')
  @Roles('admin', 'veterinarian', 'staff', 'client')
  @ApiOperation({ summary: 'Get time slots by veterinarian and date range' })
  @ApiResponse({ status: 200, description: 'Return time slots for the veterinarian in the date range.', type: [TimeSlot] })
  @ApiResponse({ status: 400, description: 'Invalid date range.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  findByVeterinarianAndDateRange(
    @Param('id') id: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<TimeSlot[]> {
    return this.timeSlotService.findByVeterinarianAndDateRange(
      +id,
      new Date(startDate),
      new Date(endDate)
    );
  }

  @Get('availability-schedule/:id')
  @Roles('admin', 'veterinarian', 'staff')
  @ApiOperation({ summary: 'Get time slots by availability schedule ID' })
  @ApiResponse({ status: 200, description: 'Return time slots for the given availability schedule.', type: [TimeSlot] })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  findByAvailabilitySchedule(@Param('id') id: string): Promise<TimeSlot[]> {
    return this.timeSlotService.findByAvailabilitySchedule(+id);
  }

  @Get(':id')
  @Roles('admin', 'veterinarian', 'staff', 'client')
  @ApiOperation({ summary: 'Get a time slot by ID' })
  @ApiResponse({ status: 200, description: 'Return the time slot.', type: TimeSlot })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Time slot not found.' })
  findOne(@Param('id') id: string): Promise<TimeSlot> {
    return this.timeSlotService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin', 'veterinarian', 'staff')
  @ApiOperation({ summary: 'Update a time slot' })
  @ApiResponse({ status: 200, description: 'The time slot has been successfully updated.', type: TimeSlot })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Time slot not found.' })
  @ApiResponse({ status: 409, description: 'Time slot would overlap with existing slots.' })
  update(
    @Param('id') id: string,
    @Body() updateTimeSlotDto: UpdateTimeSlotDto,
  ): Promise<TimeSlot> {
    return this.timeSlotService.update(id, updateTimeSlotDto);
  }

  @Delete(':id')
  @Roles('admin', 'veterinarian', 'staff')
  @ApiOperation({ summary: 'Delete a time slot' })
  @ApiResponse({ status: 200, description: 'The time slot has been successfully deleted.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Time slot not found.' })
  remove(@Param('id') id: string): Promise<void> {
    return this.timeSlotService.remove(id);
  }

  @Patch(':id/deactivate')
  @Roles('admin', 'veterinarian', 'staff')
  @ApiOperation({ summary: 'Deactivate a time slot' })
  @ApiResponse({ status: 200, description: 'The time slot has been successfully deactivated.', type: TimeSlot })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Time slot not found.' })
  deactivate(@Param('id') id: string): Promise<TimeSlot> {
    return this.timeSlotService.deactivate(id);
  }

  @Patch(':id/book')
  @Roles('admin', 'veterinarian', 'staff')
  @ApiOperation({ summary: 'Book a time slot' })
  @ApiResponse({ status: 200, description: 'The time slot has been successfully booked.', type: TimeSlot })
  @ApiResponse({ status: 400, description: 'Time slot is not available.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Time slot not found.' })
  book(
    @Param('id') id: string,
    @Body('appointmentId') appointmentId: string,
  ): Promise<TimeSlot> {
    return this.timeSlotService.bookSlot(id, appointmentId);
  }

  @Patch(':id/block')
  @Roles('admin', 'veterinarian', 'staff')
  @ApiOperation({ summary: 'Block a time slot' })
  @ApiResponse({ status: 200, description: 'The time slot has been successfully blocked.', type: TimeSlot })
  @ApiResponse({ status: 400, description: 'Time slot is not available.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Time slot not found.' })
  block(
    @Param('id') id: string,
    @Body('reason') reason?: string,
  ): Promise<TimeSlot> {
    return this.timeSlotService.blockSlot(id, reason);
  }

  @Patch(':id/break')
  @Roles('admin', 'veterinarian', 'staff')
  @ApiOperation({ summary: 'Mark a time slot as break' })
  @ApiResponse({ status: 200, description: 'The time slot has been successfully marked as break.', type: TimeSlot })
  @ApiResponse({ status: 400, description: 'Time slot is not available.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Time slot not found.' })
  markAsBreak(@Param('id') id: string): Promise<TimeSlot> {
    return this.timeSlotService.markAsBreak(id);
  }

  @Patch(':id/holiday')
  @Roles('admin', 'veterinarian', 'staff')
  @ApiOperation({ summary: 'Mark a time slot as holiday' })
  @ApiResponse({ status: 200, description: 'The time slot has been successfully marked as holiday.', type: TimeSlot })
  @ApiResponse({ status: 400, description: 'Time slot is not available.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Time slot not found.' })
  markAsHoliday(@Param('id') id: string): Promise<TimeSlot> {
    return this.timeSlotService.markAsHoliday(id);
  }

  @Patch(':id/release')
  @Roles('admin', 'veterinarian', 'staff')
  @ApiOperation({ summary: 'Release a time slot (make it available again)' })
  @ApiResponse({ status: 200, description: 'The time slot has been successfully released.', type: TimeSlot })
  @ApiResponse({ status: 400, description: 'Time slot is already available.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Time slot not found.' })
  release(@Param('id') id: string): Promise<TimeSlot> {
    return this.timeSlotService.releaseSlot(id);
  }
}
