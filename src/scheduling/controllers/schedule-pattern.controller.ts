import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { SchedulePatternService } from '../services/schedule-pattern.service';
import { CreateSchedulePatternDto } from '../dto/create-schedule-pattern.dto';
import { UpdateSchedulePatternDto } from '../dto/update-schedule-pattern.dto';
import { SchedulePattern } from '../entities/schedule-pattern.entity';

@ApiTags('schedule-patterns')
@Controller('schedule-patterns')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SchedulePatternController {
  constructor(private readonly schedulePatternService: SchedulePatternService) {}

  @Post()
  @Roles('admin', 'veterinarian', 'staff')
  @ApiOperation({ summary: 'Create a new schedule pattern' })
  @ApiResponse({ status: 201, description: 'The schedule pattern has been successfully created.', type: SchedulePattern })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  create(@Body() createSchedulePatternDto: CreateSchedulePatternDto): Promise<SchedulePattern> {
    return this.schedulePatternService.create(createSchedulePatternDto);
  }

  @Get()
  @Roles('admin', 'veterinarian', 'staff')
  @ApiOperation({ summary: 'Get all schedule patterns' })
  @ApiResponse({ status: 200, description: 'Return all schedule patterns.', type: [SchedulePattern] })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  findAll(): Promise<SchedulePattern[]> {
    return this.schedulePatternService.findAll();
  }

  @Get(':id')
  @Roles('admin', 'veterinarian', 'staff')
  @ApiOperation({ summary: 'Get a schedule pattern by ID' })
  @ApiResponse({ status: 200, description: 'Return the schedule pattern.', type: SchedulePattern })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Schedule pattern not found.' })
  findOne(@Param('id') id: string): Promise<SchedulePattern> {
    return this.schedulePatternService.findOne(id);
  }

  @Get('availability-schedule/:id')
  @Roles('admin', 'veterinarian', 'staff')
  @ApiOperation({ summary: 'Get schedule patterns by availability schedule ID' })
  @ApiResponse({ status: 200, description: 'Return schedule patterns for the given availability schedule.', type: [SchedulePattern] })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  findByAvailabilitySchedule(@Param('id') id: string): Promise<SchedulePattern[]> {
    return this.schedulePatternService.findByAvailabilitySchedule(+id);
  }

  @Get(':id/occurrences')
  @Roles('admin', 'veterinarian', 'staff')
  @ApiOperation({ summary: 'Get occurrence dates for a schedule pattern' })
  @ApiResponse({ status: 200, description: 'Return occurrence dates.', type: [Date] })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Schedule pattern not found.' })
  getOccurrenceDates(
    @Param('id') id: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<Date[]> {
    return this.schedulePatternService.getOccurrenceDates(
      id,
      new Date(startDate),
      new Date(endDate)
    );
  }

  @Patch(':id')
  @Roles('admin', 'veterinarian', 'staff')
  @ApiOperation({ summary: 'Update a schedule pattern' })
  @ApiResponse({ status: 200, description: 'The schedule pattern has been successfully updated.', type: SchedulePattern })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Schedule pattern not found.' })
  update(
    @Param('id') id: string,
    @Body() updateSchedulePatternDto: UpdateSchedulePatternDto,
  ): Promise<SchedulePattern> {
    return this.schedulePatternService.update(id, updateSchedulePatternDto);
  }

  @Delete(':id')
  @Roles('admin', 'veterinarian', 'staff')
  @ApiOperation({ summary: 'Delete a schedule pattern' })
  @ApiResponse({ status: 200, description: 'The schedule pattern has been successfully deleted.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Schedule pattern not found.' })
  remove(@Param('id') id: string): Promise<void> {
    return this.schedulePatternService.remove(id);
  }

  @Patch(':id/deactivate')
  @Roles('admin', 'veterinarian', 'staff')
  @ApiOperation({ summary: 'Deactivate a schedule pattern' })
  @ApiResponse({ status: 200, description: 'The schedule pattern has been successfully deactivated.', type: SchedulePattern })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Schedule pattern not found.' })
  deactivate(@Param('id') id: string): Promise<SchedulePattern> {
    return this.schedulePatternService.deactivate(id);
  }
}
