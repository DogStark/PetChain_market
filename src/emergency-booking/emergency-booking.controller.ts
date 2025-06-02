import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { EmergencyBookingService } from './emergency-booking.service';
import { CreateEmergencyAppointmentDto } from './dto/create-emergency-appointment.dto';
import { AppointmentStatus } from '../common/enums/emergency.enum';

@Controller('emergency-booking')
export class EmergencyBookingController {
  constructor(
    private readonly emergencyBookingService: EmergencyBookingService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createEmergencyAppointment(
    @Body() createDto: CreateEmergencyAppointmentDto,
  ) {
    return this.emergencyBookingService.createEmergencyAppointment(createDto);
  }

  @Get('queue')
  async getAppointmentQueue() {
    return this.emergencyBookingService.getAppointmentsByPriority();
  }

  @Get(':id')
  async getAppointment(@Param('id') id: string) {
    return this.emergencyBookingService.getAppointmentById(id);
  }

  @Patch(':id/status')
  async updateAppointmentStatus(
    @Param('id') id: string,
    @Body('status') status: AppointmentStatus,
  ) {
    return this.emergencyBookingService.updateAppointmentStatus(id, status);
  }
}
