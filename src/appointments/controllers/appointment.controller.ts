import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ValidationPipe,
  UsePipes,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from "@nestjs/common"
import type { AppointmentService } from "../services/appointment.service"
import type { AvailabilityService } from "../services/availability.service"
import type { CreateAppointmentDto } from "../dto/create-appointment.dto"
import type { UpdateAppointmentDto } from "../dto/update-appointment.dto"
import type { RescheduleAppointmentDto } from "../dto/reschedule-appointment.dto"
import type { AvailabilityQueryDto, AvailableVeterinariansDto } from "../dto/availability-query.dto"
import type { AppointmentStatus } from "../entities/appointment.entity"

@Controller("appointments")
export class AppointmentController {
  constructor(
    private readonly appointmentService: AppointmentService,
    private readonly availabilityService: AvailabilityService,
  ) {}

  @Post()
  @UsePipes(new ValidationPipe())
  async createAppointment(@Body() createDto: CreateAppointmentDto) {
    return this.appointmentService.createAppointment(createDto);
  }

  @Get(":id")
  async getAppointment(@Param("id", ParseUUIDPipe) id: string) {
    return this.appointmentService.getAppointmentById(id)
  }

  @Put(":id")
  @UsePipes(new ValidationPipe())
  async updateAppointment(@Param("id", ParseUUIDPipe) id: string, @Body() updateDto: UpdateAppointmentDto) {
    return this.appointmentService.updateAppointment(id, updateDto)
  }

  @Post("reschedule")
  @UsePipes(new ValidationPipe())
  async rescheduleAppointment(@Body() rescheduleDto: RescheduleAppointmentDto) {
    return this.appointmentService.rescheduleAppointment(rescheduleDto)
  }

  @Put(":id/confirm")
  @HttpCode(HttpStatus.OK)
  async confirmAppointment(@Param("id", ParseUUIDPipe) id: string) {
    return this.appointmentService.confirmAppointment(id)
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async cancelAppointment(@Param("id", ParseUUIDPipe) id: string, @Body("reason") reason?: string) {
    await this.appointmentService.cancelAppointment(id, reason)
  }

  @Get("veterinarian/:veterinarianId")
  async getAppointmentsByVeterinarian(
    @Param("veterinarianId", ParseUUIDPipe) veterinarianId: string,
    @Query("date") date?: string,
    @Query("status") status?: AppointmentStatus,
  ) {
    return this.appointmentService.getAppointmentsByVeterinarian(veterinarianId, date, status)
  }

  @Get("client/:clientId")
  async getAppointmentsByClient(
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @Query("include_completed") includeCompleted?: boolean,
  ) {
    return this.appointmentService.getAppointmentsByClient(clientId, includeCompleted)
  }

  @Get("availability/veterinarian")
  @UsePipes(new ValidationPipe({ transform: true }))
  async getVeterinarianAvailability(@Query() queryDto: AvailabilityQueryDto) {
    return this.availabilityService.getVeterinarianAvailability(queryDto)
  }

  @Get("availability/search")
  @UsePipes(new ValidationPipe({ transform: true }))
  async getAvailableVeterinarians(@Query() queryDto: AvailableVeterinariansDto) {
    return this.availabilityService.getAvailableVeterinarians(queryDto)
  }

  @Get("availability/check")
  @UsePipes(new ValidationPipe({ transform: true }))
  async checkAvailability(@Query() queryDto: AvailabilityQueryDto) {
    const isAvailable = await this.availabilityService.isVeterinarianAvailable(
      queryDto.veterinarian_id,
      queryDto.date,
      queryDto.start_time,
      queryDto.duration_minutes,
    )
    return { is_available: isAvailable }
  }
}
