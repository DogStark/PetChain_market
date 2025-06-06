import { Injectable, Logger } from "@nestjs/common"
import type { Repository } from "typeorm"
import { Not, In } from "typeorm"
import type { VeterinarianAvailability } from "../entities/veterinarian-availability.entity"
import { type Appointment, AppointmentStatus } from "../entities/appointment.entity"
import type { Veterinarian } from "../entities/veterinarian.entity"
import type { AvailabilityQueryDto, AvailableVeterinariansDto } from "../dto/availability-query.dto"
import type { VeterinarianAvailabilityDto, AvailabilitySlotDto } from "../dto/appointment-response.dto"

@Injectable()
export class AvailabilityService {
  private readonly logger = new Logger(AvailabilityService.name)

  constructor(
    private readonly availabilityRepository: Repository<VeterinarianAvailability>,
    private readonly appointmentRepository: Repository<Appointment>,
    private readonly veterinarianRepository: Repository<Veterinarian>,
  ) {}

  async isVeterinarianAvailable(
    veterinarianId: string,
    date: string,
    startTime: string,
    durationMinutes: number,
  ): Promise<boolean> {
    const appointmentDate = new Date(date)
    const dayOfWeek = (appointmentDate.getDay() + 6) % 7 // Convert Sunday=0 to Monday=0

    // Check if veterinarian has availability schedule for this day
    const availability = await this.availabilityRepository.findOne({
      where: {
        veterinarian_id: veterinarianId,
        day_of_week: dayOfWeek,
        is_active: true,
      },
    })

    if (!availability) {
      return false
    }

    // Check if requested time falls within availability window
    const requestedStart = this.timeToMinutes(startTime)
    const requestedEnd = requestedStart + durationMinutes
    const availableStart = this.timeToMinutes(availability.start_time)
    const availableEnd = this.timeToMinutes(availability.end_time)

    if (requestedStart < availableStart || requestedEnd > availableEnd) {
      return false
    }

    // Check for existing appointments (conflicts)
    const endTime = this.minutesToTime(requestedEnd)
    const conflictingAppointment = await this.appointmentRepository
      .createQueryBuilder("appointment")
      .where("appointment.veterinarian_id = :veterinarianId", { veterinarianId })
      .andWhere("appointment.appointment_date = :date", { date })
      .andWhere("appointment.status NOT IN (:...excludedStatuses)", {
        excludedStatuses: [AppointmentStatus.CANCELLED, AppointmentStatus.RESCHEDULED],
      })
      .andWhere("(appointment.start_time < :endTime AND appointment.end_time > :startTime)", {
        startTime,
        endTime,
      })
      .getOne()

    return !conflictingAppointment
  }

  async getVeterinarianAvailability(queryDto: AvailabilityQueryDto): Promise<VeterinarianAvailabilityDto> {
    const veterinarian = await this.veterinarianRepository.findOne({
      where: { id: queryDto.veterinarian_id, is_active: true },
    })

    if (!veterinarian) {
      throw new Error("Veterinarian not found or inactive")
    }

    const appointmentDate = new Date(queryDto.date)
    const dayOfWeek = (appointmentDate.getDay() + 6) % 7

    // Get availability schedule
    const availability = await this.availabilityRepository.findOne({
      where: {
        veterinarian_id: queryDto.veterinarian_id,
        day_of_week: dayOfWeek,
        is_active: true,
      },
    })

    if (!availability) {
      return {
        veterinarian_id: queryDto.veterinarian_id,
        veterinarian_name: veterinarian.full_name,
        date: queryDto.date,
        slots: [],
      }
    }

    // Get existing appointments for the day
    const existingAppointments = await this.appointmentRepository.find({
      where: {
        veterinarian_id: queryDto.veterinarian_id,
        appointment_date: appointmentDate,
        status: Not(In([AppointmentStatus.CANCELLED, AppointmentStatus.RESCHEDULED])),
      },
      order: { start_time: "ASC" },
    })

    // Generate time slots
    const slots = this.generateTimeSlots(
      availability.start_time,
      availability.end_time,
      availability.slot_duration_minutes,
      queryDto.duration_minutes,
      existingAppointments,
    )

    return {
      veterinarian_id: queryDto.veterinarian_id,
      veterinarian_name: veterinarian.full_name,
      date: queryDto.date,
      slots,
    }
  }

  async getAvailableVeterinarians(queryDto: AvailableVeterinariansDto): Promise<VeterinarianAvailabilityDto[]> {
    const appointmentDate = new Date(queryDto.date)
    const dayOfWeek = (appointmentDate.getDay() + 6) % 7

    // Get veterinarians with availability on this day
    const queryBuilder = this.veterinarianRepository
      .createQueryBuilder("vet")
      .innerJoin("vet.availability_schedules", "availability")
      .where("vet.is_active = true")
      .andWhere("availability.day_of_week = :dayOfWeek", { dayOfWeek })
      .andWhere("availability.is_active = true")

    if (queryDto.specialization) {
      queryBuilder.andWhere("vet.specialization = :specialization", {
        specialization: queryDto.specialization,
      })
    }

    if (queryDto.start_time) {
      const requestedStart = this.timeToMinutes(queryDto.start_time)
      const requestedEnd = requestedStart + queryDto.duration_minutes

      const availability = await this.availabilityRepository.findOne({
        where: {
          veterinarian_id: queryDto.veterinarian_id,
          day_of_week: dayOfWeek,
          is_active: true,
        },
      })

      if (availability) {
        queryBuilder
          .andWhere(":requestedStart >= :availableStart", {
            requestedStart: this.timeToMinutes(queryDto.start_time),
            availableStart: this.timeToMinutes(availability.start_time),
          })
          .andWhere(":requestedEnd <= :availableEnd", {
            requestedEnd: this.timeToMinutes(
              this.minutesToTime(this.timeToMinutes(queryDto.start_time) + queryDto.duration_minutes),
            ),
            availableEnd: this.timeToMinutes(availability.end_time),
          })
      }
    }

    const veterinarians = await queryBuilder.getMany()

    // Get availability for each veterinarian
    const availabilityPromises = veterinarians.map(async (vet) => {
      return this.getVeterinarianAvailability({
        veterinarian_id: vet.id,
        date: queryDto.date,
        duration_minutes: queryDto.duration_minutes,
      })
    })

    const availabilities = await Promise.all(availabilityPromises)

    // Filter out veterinarians with no available slots if specific time requested
    if (queryDto.start_time) {
      return availabilities.filter((availability) =>
        availability.slots.some((slot) => slot.is_available && slot.start_time === queryDto.start_time),
      )
    }

    return availabilities.filter((availability) => availability.slots.some((slot) => slot.is_available))
  }

  private generateTimeSlots(
    startTime: string,
    endTime: string,
    slotDuration: number,
    requestedDuration: number,
    existingAppointments: Appointment[],
  ): AvailabilitySlotDto[] {
    const slots: AvailabilitySlotDto[] = []
    const startMinutes = this.timeToMinutes(startTime)
    const endMinutes = this.timeToMinutes(endTime)

    for (
      let currentMinutes = startMinutes;
      currentMinutes + requestedDuration <= endMinutes;
      currentMinutes += slotDuration
    ) {
      const slotStart = this.minutesToTime(currentMinutes)
      const slotEnd = this.minutesToTime(currentMinutes + requestedDuration)

      // Check if this slot conflicts with existing appointments
      const hasConflict = existingAppointments.some((appointment) => {
        const appointmentStart = this.timeToMinutes(appointment.start_time)
        const appointmentEnd = this.timeToMinutes(appointment.end_time)
        return currentMinutes < appointmentEnd && currentMinutes + requestedDuration > appointmentStart
      })

      const conflictingAppointment = hasConflict
        ? existingAppointments.find((appointment) => {
            const appointmentStart = this.timeToMinutes(appointment.start_time)
            const appointmentEnd = this.timeToMinutes(appointment.end_time)
            return currentMinutes < appointmentEnd && currentMinutes + requestedDuration > appointmentStart
          })
        : undefined

      slots.push({
        start_time: slotStart,
        end_time: slotEnd,
        is_available: !hasConflict,
        appointment_id: conflictingAppointment?.id,
      })
    }

    return slots
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(":").map(Number)
    return hours * 60 + minutes
  }

  private minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`
  }
}
