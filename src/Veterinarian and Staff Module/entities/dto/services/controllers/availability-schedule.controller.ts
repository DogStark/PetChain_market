import { Controller, Get, Post, Body, Param, Put, Delete, ParseIntPipe } from '@nestjs/common';
import { AvailabilityScheduleService } from '../services/availability-schedule.service';
import { CreateAvailabilityScheduleDto } from '../dto/create-availability-schedule.dto';
import { DayOfWeek } from '../entities/availability-schedule.entity';

@Controller('availability-schedules')
export class AvailabilityScheduleController {
  constructor(private readonly scheduleService: AvailabilityScheduleService) {}

  @Post()
  create(@Body() createScheduleDto: CreateAvailabilityScheduleDto) {
    return this.scheduleService.create(createScheduleDto);
  }

  @Get('veterinarian/:veterinarianId')
  findByVeterinarian(@Param('veterinarianId', ParseIntPipe) veterinarianId: number) {
    return this.scheduleService.findByVeterinarian(veterinarianId);
  }

  @Get('day/:dayOfWeek')
  findByDay(@Param('dayOfWeek') dayOfWeek: DayOfWeek) {
    return this.scheduleService.findByDay(dayOfWeek);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateData: Partial<CreateAvailabilityScheduleDto>) {
    return this.scheduleService.update(id, updateData);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.scheduleService.remove(id);
  }
}