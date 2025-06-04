import { Controller, Post, Get, Param, Body, Put, Delete } from '@nestjs/common';
import { CreateGroomingAppointmentDto, UpdateGroomingAppointmentDto } from './dto';
import { GroomingAppointmentService } from '../services/grooming-appointment.service';

@Controller('grooming-appointments')
export class GroomingAppointmentController {
  constructor(private readonly service: GroomingAppointmentService) {}

  @Post()
  create(@Body() dto: CreateGroomingAppointmentDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateGroomingAppointmentDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
