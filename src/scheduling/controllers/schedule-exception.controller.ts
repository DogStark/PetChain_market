import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { ScheduleExceptionService } from '../services/schedule-exception.service';
import { CreateScheduleExceptionDto } from '../dto/create-schedule-exception.dto';
import { UpdateScheduleExceptionDto } from '../dto/update-schedule-exception.dto';
import { ScheduleException, ExceptionType } from '../entities/schedule-exception.entity';

@ApiTags('schedule-exceptions')
@Controller('schedule-exceptions')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ScheduleExceptionController {
  constructor(private readonly scheduleExceptionService: ScheduleExceptionService) {}

  @Post()
  @Roles('admin', 'veterinarian', 'staff')
  @ApiOperation({ summary: 'Create a new schedule exception' })
  @ApiResponse({ status: 201, description: 'The schedule exception has been successfully created.', type: ScheduleException })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 409, description: 'Exception overlaps with existing exceptions.' })
  create(@Body() createScheduleExceptionDto: CreateScheduleExceptionDto): Promise<ScheduleException> {
    return this.scheduleExceptionService.create(createScheduleExceptionDto);
  }

  @Get()
  @Roles('admin', 'veterinarian', 'staff')
  @ApiOperation({ summary: 'Get all schedule exceptions' })
  @ApiResponse({ status: 200, description: 'Return all schedule exceptions.', type: [ScheduleException] })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  findAll(): Promise<ScheduleException[]> {
    return this.scheduleExceptionService.findAll();
  }

  @Get('type/:type')
  @Roles('admin', 'veterinarian', 'staff')
  @ApiOperation({ summary: 'Get schedule exceptions by type' })
  @ApiResponse({ status: 200, description: 'Return schedule exceptions of the specified type.', type: [ScheduleException] })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  findByType(@Param('type') type: ExceptionType): Promise<ScheduleException[]> {
    return this.scheduleExceptionService.findByType(type);
  }

  @Get('date-range')
  @Roles('admin', 'veterinarian', 'staff')
  @ApiOperation({ summary: 'Get schedule exceptions by date range' })
  @ApiResponse({ status: 200, description: 'Return schedule exceptions in the date range.', type: [ScheduleException] })
  @ApiResponse({ status: 400, description: 'Invalid date range.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  findByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<ScheduleException[]> {
    return this.scheduleExceptionService.findByDateRange(
      new Date(startDate),
      new Date(endDate)
    );
  }

  @Get('veterinarian/:id')
  @Roles('admin', 'veterinarian', 'staff')
  @ApiOperation({ summary: 'Get schedule exceptions by veterinarian' })
  @ApiResponse({ status: 200, description: 'Return schedule exceptions for the veterinarian.', type: [ScheduleException] })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  findByVeterinarian(@Param('id') id: string): Promise<ScheduleException[]> {
    return this.scheduleExceptionService.findByVeterinarian(+id);
  }

  @Get('veterinarian/:id/date-range')
  @Roles('admin', 'veterinarian', 'staff')
  @ApiOperation({ summary: 'Get schedule exceptions by veterinarian and date range' })
  @ApiResponse({ status: 200, description: 'Return schedule exceptions for the veterinarian in the date range.', type: [ScheduleException] })
  @ApiResponse({ status: 400, description: 'Invalid date range.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  findByVeterinarianAndDateRange(
    @Param('id') id: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<ScheduleException[]> {
    return this.scheduleExceptionService.findByVeterinarianAndDateRange(
      +id,
      new Date(startDate),
      new Date(endDate)
    );
  }

  @Get('holidays/:year')
  @Roles('admin', 'veterinarian', 'staff', 'client')
  @ApiOperation({ summary: 'Get holidays for a specific year' })
  @ApiResponse({ status: 200, description: 'Return holidays for the year.', type: [ScheduleException] })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  getHolidays(@Param('year') year: string): Promise<ScheduleException[]> {
    return this.scheduleExceptionService.getHolidays(+year);
  }

  @Get('breaks/:veterinarianId')
  @Roles('admin', 'veterinarian', 'staff')
  @ApiOperation({ summary: 'Get break times for a veterinarian on a specific date' })
  @ApiResponse({ status: 200, description: 'Return break times for the veterinarian.', type: [ScheduleException] })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  getBreakTimes(
    @Param('veterinarianId') veterinarianId: string,
    @Query('date') date: string,
  ): Promise<ScheduleException[]> {
    return this.scheduleExceptionService.getBreakTimes(+veterinarianId, new Date(date));
  }

  @Get(':id')
  @Roles('admin', 'veterinarian', 'staff')
  @ApiOperation({ summary: 'Get a schedule exception by ID' })
  @ApiResponse({ status: 200, description: 'Return the schedule exception.', type: ScheduleException })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Schedule exception not found.' })
  findOne(@Param('id') id: string): Promise<ScheduleException> {
    return this.scheduleExceptionService.findOne(id);
  }

  @Get(':id/occurrences')
  @Roles('admin', 'veterinarian', 'staff')
  @ApiOperation({ summary: 'Get occurrence dates for a recurring schedule exception' })
  @ApiResponse({ status: 200, description: 'Return occurrence dates.', type: [Date] })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Schedule exception not found.' })
  getRecurringExceptionOccurrences(
    @Param('id') id: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<Date[]> {
    return this.scheduleExceptionService.getRecurringExceptionOccurrences(
      id,
      new Date(startDate),
      new Date(endDate)
    );
  }

  @Patch(':id')
  @Roles('admin', 'veterinarian', 'staff')
  @ApiOperation({ summary: 'Update a schedule exception' })
  @ApiResponse({ status: 200, description: 'The schedule exception has been successfully updated.', type: ScheduleException })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Schedule exception not found.' })
  @ApiResponse({ status: 409, description: 'Updated exception would overlap with existing exceptions.' })
  update(
    @Param('id') id: string,
    @Body() updateScheduleExceptionDto: UpdateScheduleExceptionDto,
  ): Promise<ScheduleException> {
    return this.scheduleExceptionService.update(id, updateScheduleExceptionDto);
  }

  @Delete(':id')
  @Roles('admin', 'veterinarian', 'staff')
  @ApiOperation({ summary: 'Delete a schedule exception' })
  @ApiResponse({ status: 200, description: 'The schedule exception has been successfully deleted.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Schedule exception not found.' })
  remove(@Param('id') id: string): Promise<void> {
    return this.scheduleExceptionService.remove(id);
  }

  @Patch(':id/deactivate')
  @Roles('admin', 'veterinarian', 'staff')
  @ApiOperation({ summary: 'Deactivate a schedule exception' })
  @ApiResponse({ status: 200, description: 'The schedule exception has been successfully deactivated.', type: ScheduleException })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Schedule exception not found.' })
  deactivate(@Param('id') id: string): Promise<ScheduleException> {
    return this.scheduleExceptionService.deactivate(id);
  }
}
