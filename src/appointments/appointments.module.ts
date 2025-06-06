import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { ScheduleModule } from "@nestjs/schedule"
import { Appointment } from "./entities/appointment.entity"
import { Veterinarian } from "./entities/veterinarian.entity"
import { Client } from "./entities/client.entity"
import { Pet } from "./entities/pet.entity"
import { VeterinarianAvailability } from "./entities/veterinarian-availability.entity"
import { AppointmentReminder } from "./entities/appointment-reminder.entity"
import { AppointmentService } from "./services/appointment.service"
import { AvailabilityService } from "./services/availability.service"
import { ReminderService } from "./services/reminder.service"
import { AppointmentController } from "./controllers/appointment.controller"

@Module({
  imports: [
    TypeOrmModule.forFeature([Appointment, Veterinarian, Client, Pet, VeterinarianAvailability, AppointmentReminder]),
    ScheduleModule.forRoot(),
  ],
  controllers: [AppointmentController],
  providers: [AppointmentService, AvailabilityService, ReminderService],
  exports: [AppointmentService, AvailabilityService, ReminderService],
})
export class AppointmentsModule {}
