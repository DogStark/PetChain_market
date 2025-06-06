import { Injectable, Logger, BadRequestException, ConflictException, NotFoundException } from "@nestjs/common"
import type { Repository } from "typeorm"
import { type Appointment, AppointmentStatus } from "../entities/appointment.entity"
import type { Veterinarian } from "../entities/veterinarian.entity"
import type { Client } from "../entities/client.entity"
import type { Pet } from "../entities/pet.entity"
import { type AppointmentReminder, ReminderType, ReminderStatus } from "../entities/appointment-reminder.entity"
import type { CreateAppointmentDto } from "../dto/create-appointment.dto"
import type { UpdateAppointmentDto } from "../dto/update-appointment.dto"
import type { RescheduleAppointmentDto } from "../dto/reschedule-appointment.dto"
import type { AppointmentResponseDto } from "../dto/appointment-response.dto"
import type { AvailabilityService } from "./availability.service"
import type { ReminderService } from "./reminder.service"

@Injectable()
export class AppointmentService {
  private readonly logger = new Logger(AppointmentService.name)

  constructor(
    private readonly appointmentRepository: Repository<Appointment>,
    private readonly veterinarianRepository: Repository<Veterinarian>,
    private readonly clientRepository: Repository<Client>,
    private readonly petRepository: Repository<Pet>,
    private readonly reminderRepository: Repository<AppointmentReminder>,
    private readonly availabilityService: AvailabilityService,
    private readonly reminderService: ReminderService,
  ) {}

  async createAppointment(createDto: CreateAppointmentDto): Promise<AppointmentResponseDto> {
    const startTime = Date.now()

    try {
      // Validate entities exist
      await this.validateEntities(createDto.veterinarian_id, createDto.client_id, createDto.pet_id)

      // Calculate end time
      const endTime = this.calculateEndTime(createDto.start_time, createDto.duration_minutes)

      // Check veterinarian availability
      const isAvailable = await this.availabilityService.isVeterinarianAvailable(
        createDto.veterinarian_id,
        createDto.appointment_date,
        createDto.start_time,
        createDto.duration_minutes,
      )

      if (!isAvailable) {
        throw new ConflictException("Veterinarian is not available at the requested time")
      }

      // Check for conflicts (double booking prevention)
      await this.checkForConflicts(createDto.veterinarian_id, createDto.appointment_date, createDto.start_time, endTime)

      // Create appointment
      const appointment = this.appointmentRepository.create({
        ...createDto,
        end_time: endTime,
        status: createDto.is_emergency ? AppointmentStatus.CONFIRMED : AppointmentStatus.SCHEDULED,
      })

      const savedAppointment = await this.appointmentRepository.save(appointment)

      // Schedule reminders
      await this.scheduleReminders(savedAppointment)

      // Load related entities for response
      const appointmentWithRelations = await this.findAppointmentWithRelations(savedAppointment.id)

      const duration = Date.now() - startTime
      this.logger.log(`Appointment created successfully in ${duration}ms. ID: ${savedAppointment.id}`)

      return this.mapToResponseDto(appointmentWithRelations)
    } catch (error) {
      this.logger.error("Failed to create appointment", error.stack)
      throw error
    }
  }

  async updateAppointment(id: string, updateDto: UpdateAppointmentDto): Promise<AppointmentResponseDto> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id },
      relations: ["veterinarian", "client", "pet"],
    })

    if (!appointment) {
      throw new NotFoundException("Appointment not found")
    }

    // If updating time/date, check availability and conflicts
    if (updateDto.appointment_date || updateDto.start_time || updateDto.duration_minutes) {
      const newDate = updateDto.appointment_date || appointment.appointment_date.toISOString().split("T")[0]
      const newStartTime = updateDto.start_time || appointment.start_time
      const newDuration = updateDto.duration_minutes || appointment.duration_minutes
      const newEndTime = this.calculateEndTime(newStartTime, newDuration)

      const isAvailable = await this.availabilityService.isVeterinarianAvailable(
        appointment.veterinarian_id,
        newDate,
        newStartTime,
        newDuration,
      )

      if (!isAvailable) {
        throw new ConflictException("Veterinarian is not available at the requested time")
      }

      await this.checkForConflicts(appointment.veterinarian_id, newDate, newStartTime, newEndTime, id)

      updateDto.end_time = newEndTime
    }

    // Handle status changes
    if (updateDto.status) {
      await this.handleStatusChange(appointment, updateDto.status, updateDto.cancellation_reason)
    }

    // Update appointment
    Object.assign(appointment, updateDto)
    const updatedAppointment = await this.appointmentRepository.save(appointment)

    // Update reminders if time changed
    if (updateDto.appointment_date || updateDto.start_time) {
      await this.updateReminders(updatedAppointment)
    }

    this.logger.log(`Appointment updated successfully. ID: ${id}`)

    return this.mapToResponseDto(updatedAppointment)
  }

  async rescheduleAppointment(rescheduleDto: RescheduleAppointmentDto): Promise<AppointmentResponseDto> {
    const originalAppointment = await this.appointmentRepository.findOne({
      where: { id: rescheduleDto.appointment_id },
      relations: ["veterinarian", "client", "pet"],
    })

    if (!originalAppointment) {
      throw new NotFoundException("Appointment not found")
    }

    if (originalAppointment.status === AppointmentStatus.COMPLETED) {
      throw new BadRequestException("Cannot reschedule completed appointment")
    }

    // Calculate new end time
    const newEndTime = this.calculateEndTime(rescheduleDto.new_start_time, originalAppointment.duration_minutes)

    // Check availability for new time
    const isAvailable = await this.availabilityService.isVeterinarianAvailable(
      originalAppointment.veterinarian_id,
      rescheduleDto.new_appointment_date,
      rescheduleDto.new_start_time,
      originalAppointment.duration_minutes,
    )

    if (!isAvailable) {
      throw new ConflictException("Veterinarian is not available at the requested time")
    }

    // Check for conflicts
    await this.checkForConflicts(
      originalAppointment.veterinarian_id,
      rescheduleDto.new_appointment_date,
      rescheduleDto.new_start_time,
      newEndTime,
    )

    // Create new appointment
    const newAppointment = this.appointmentRepository.create({
      ...originalAppointment,
      id: undefined, // Let TypeORM generate new ID
      appointment_date: new Date(rescheduleDto.new_appointment_date),
      start_time: rescheduleDto.new_start_time,
      end_time: newEndTime,
      status: AppointmentStatus.SCHEDULED,
      rescheduled_from_id: originalAppointment.id,
      notes: rescheduleDto.reason
        ? `${originalAppointment.notes || ""}\n\nRescheduled: ${rescheduleDto.reason}`.trim()
        : originalAppointment.notes,
    })

    const savedNewAppointment = await this.appointmentRepository.save(newAppointment)

    // Update original appointment
    originalAppointment.status = AppointmentStatus.RESCHEDULED
    originalAppointment.rescheduled_to_id = savedNewAppointment.id
    originalAppointment.cancellation_reason = rescheduleDto.reason || "Rescheduled by request"
    await this.appointmentRepository.save(originalAppointment)

    // Cancel old reminders and schedule new ones
    await this.cancelReminders(originalAppointment.id)
    await this.scheduleReminders(savedNewAppointment)

    this.logger.log(
      `Appointment rescheduled successfully. Original: ${originalAppointment.id}, New: ${savedNewAppointment.id}`,
    )

    return this.mapToResponseDto(savedNewAppointment)
  }

  async cancelAppointment(id: string, reason?: string): Promise<void> {
    const appointment = await this.appointmentRepository.findOne({ where: { id } })

    if (!appointment) {
      throw new NotFoundException("Appointment not found")
    }

    if (appointment.status === AppointmentStatus.COMPLETED) {
      throw new BadRequestException("Cannot cancel completed appointment")
    }

    appointment.status = AppointmentStatus.CANCELLED
    appointment.cancelled_at = new Date()
    appointment.cancellation_reason = reason

    await this.appointmentRepository.save(appointment)
    await this.cancelReminders(id)

    this.logger.log(`Appointment cancelled successfully. ID: ${id}`)
  }

  async confirmAppointment(id: string): Promise<AppointmentResponseDto> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id },
      relations: ["veterinarian", "client", "pet"],
    })

    if (!appointment) {
      throw new NotFoundException("Appointment not found")
    }

    if (appointment.status !== AppointmentStatus.SCHEDULED) {
      throw new BadRequestException("Only scheduled appointments can be confirmed")
    }

    appointment.status = AppointmentStatus.CONFIRMED
    appointment.confirmed_at = new Date()

    const updatedAppointment = await this.appointmentRepository.save(appointment)

    this.logger.log(`Appointment confirmed successfully. ID: ${id}`)

    return this.mapToResponseDto(updatedAppointment)
  }

  async getAppointmentById(id: string): Promise<AppointmentResponseDto> {
    const appointment = await this.findAppointmentWithRelations(id)

    if (!appointment) {
      throw new NotFoundException("Appointment not found")
    }

    return this.mapToResponseDto(appointment)
  }

  async getAppointmentsByVeterinarian(
    veterinarianId: string,
    date?: string,
    status?: AppointmentStatus,
  ): Promise<AppointmentResponseDto[]> {
    const queryBuilder = this.appointmentRepository
      .createQueryBuilder("appointment")
      .leftJoinAndSelect("appointment.veterinarian", "veterinarian")
      .leftJoinAndSelect("appointment.client", "client")
      .leftJoinAndSelect("appointment.pet", "pet")
      .where("appointment.veterinarian_id = :veterinarianId", { veterinarianId })

    if (date) {
      queryBuilder.andWhere("appointment.appointment_date = :date", { date })
    }

    if (status) {
      queryBuilder.andWhere("appointment.status = :status", { status })
    }

    queryBuilder.orderBy("appointment.appointment_date", "ASC").addOrderBy("appointment.start_time", "ASC")

    const appointments = await queryBuilder.getMany()

    return appointments.map((appointment) => this.mapToResponseDto(appointment))
  }

  async getAppointmentsByClient(clientId: string, includeCompleted = false): Promise<AppointmentResponseDto[]> {
    const queryBuilder = this.appointmentRepository
      .createQueryBuilder("appointment")
      .leftJoinAndSelect("appointment.veterinarian", "veterinarian")
      .leftJoinAndSelect("appointment.client", "client")
      .leftJoinAndSelect("appointment.pet", "pet")
      .where("appointment.client_id = :clientId", { clientId })

    if (!includeCompleted) {
      queryBuilder.andWhere("appointment.status != :completedStatus", {
        completedStatus: AppointmentStatus.COMPLETED,
      })
    }

    queryBuilder.orderBy("appointment.appointment_date", "DESC").addOrderBy("appointment.start_time", "DESC")

    const appointments = await queryBuilder.getMany()

    return appointments.map((appointment) => this.mapToResponseDto(appointment))
  }

  private async validateEntities(veterinarianId: string, clientId: string, petId: string): Promise<void> {
    const [veterinarian, client, pet] = await Promise.all([
      this.veterinarianRepository.findOne({ where: { id: veterinarianId, is_active: true } }),
      this.clientRepository.findOne({ where: { id: clientId, is_active: true } }),
      this.petRepository.findOne({ where: { id: petId, is_active: true } }),
    ])

    if (!veterinarian) {
      throw new NotFoundException("Veterinarian not found or inactive")
    }

    if (!client) {
      throw new NotFoundException("Client not found or inactive")
    }

    if (!pet) {
      throw new NotFoundException("Pet not found or inactive")
    }

    // Verify pet belongs to client
    if (pet.owner_id !== clientId) {
      throw new BadRequestException("Pet does not belong to the specified client")
    }
  }

  private calculateEndTime(startTime: string, durationMinutes: number): string {
    const [hours, minutes] = startTime.split(":").map(Number)
    const startDate = new Date()
    startDate.setHours(hours, minutes, 0, 0)

    const endDate = new Date(startDate.getTime() + durationMinutes * 60000)
    return `${endDate.getHours().toString().padStart(2, "0")}:${endDate.getMinutes().toString().padStart(2, "0")}`
  }

  private async checkForConflicts(
    veterinarianId: string,
    appointmentDate: string,
    startTime: string,
    endTime: string,
    excludeAppointmentId?: string,
  ): Promise<void> {
    const queryBuilder = this.appointmentRepository
      .createQueryBuilder("appointment")
      .where("appointment.veterinarian_id = :veterinarianId", { veterinarianId })
      .andWhere("appointment.appointment_date = :appointmentDate", { appointmentDate })
      .andWhere("appointment.status NOT IN (:...excludedStatuses)", {
        excludedStatuses: [AppointmentStatus.CANCELLED, AppointmentStatus.RESCHEDULED],
      })
      .andWhere("(appointment.start_time < :endTime AND appointment.end_time > :startTime)", { startTime, endTime })

    if (excludeAppointmentId) {
      queryBuilder.andWhere("appointment.id != :excludeId", { excludeId: excludeAppointmentId })
    }

    const conflictingAppointment = await queryBuilder.getOne()

    if (conflictingAppointment) {
      throw new ConflictException("Time slot conflicts with existing appointment")
    }
  }

  private async handleStatusChange(
    appointment: Appointment,
    newStatus: AppointmentStatus,
    cancellationReason?: string,
  ): Promise<void> {
    switch (newStatus) {
      case AppointmentStatus.CONFIRMED:
        appointment.confirmed_at = new Date()
        break
      case AppointmentStatus.CANCELLED:
        appointment.cancelled_at = new Date()
        appointment.cancellation_reason = cancellationReason
        await this.cancelReminders(appointment.id)
        break
      case AppointmentStatus.COMPLETED:
        // Update veterinarian stats
        await this.updateVeterinarianStats(appointment.veterinarian_id)
        break
    }
  }

  private async updateVeterinarianStats(veterinarianId: string): Promise<void> {
    const veterinarian = await this.veterinarianRepository.findOne({ where: { id: veterinarianId } })
    if (veterinarian) {
      veterinarian.total_appointments += 1
      await this.veterinarianRepository.save(veterinarian)
    }
  }

  private async scheduleReminders(appointment: Appointment): Promise<void> {
    const appointmentDateTime = appointment.appointment_datetime

    // Schedule email reminder 24 hours before
    const emailReminderTime = new Date(appointmentDateTime.getTime() - 24 * 60 * 60 * 1000)
    if (emailReminderTime > new Date()) {
      await this.createReminder(appointment.id, ReminderType.EMAIL, emailReminderTime)
    }

    // Schedule SMS reminder 2 hours before
    const smsReminderTime = new Date(appointmentDateTime.getTime() - 2 * 60 * 60 * 1000)
    if (smsReminderTime > new Date()) {
      await this.createReminder(appointment.id, ReminderType.SMS, smsReminderTime)
    }
  }

  private async createReminder(appointmentId: string, type: ReminderType, scheduledFor: Date): Promise<void> {
    const reminder = this.reminderRepository.create({
      appointment_id: appointmentId,
      reminder_type: type,
      scheduled_for: scheduledFor,
      status: ReminderStatus.PENDING,
    })

    await this.reminderRepository.save(reminder)
  }

  private async updateReminders(appointment: Appointment): Promise<void> {
    // Cancel existing reminders
    await this.cancelReminders(appointment.id)
    // Schedule new reminders
    await this.scheduleReminders(appointment)
  }

  private async cancelReminders(appointmentId: string): Promise<void> {
    await this.reminderRepository.update(
      { appointment_id: appointmentId, status: ReminderStatus.PENDING },
      { status: ReminderStatus.CANCELLED },
    )
  }

  private async findAppointmentWithRelations(id: string): Promise<Appointment | null> {
    return this.appointmentRepository.findOne({
      where: { id },
      relations: ["veterinarian", "client", "pet"],
    })
  }

  private mapToResponseDto(appointment: Appointment): AppointmentResponseDto {
    return {
      id: appointment.id,
      veterinarian_id: appointment.veterinarian_id,
      client_id: appointment.client_id,
      pet_id: appointment.pet_id,
      appointment_date: appointment.appointment_date.toISOString().split("T")[0],
      start_time: appointment.start_time,
      end_time: appointment.end_time,
      duration_minutes: appointment.duration_minutes,
      appointment_type: appointment.appointment_type,
      status: appointment.status,
      reason: appointment.reason,
      notes: appointment.notes,
      veterinarian_notes: appointment.veterinarian_notes,
      estimated_cost: appointment.estimated_cost,
      actual_cost: appointment.actual_cost,
      is_emergency: appointment.is_emergency,
      booking_source: appointment.booking_source,
      confirmed_at: appointment.confirmed_at,
      cancelled_at: appointment.cancelled_at,
      cancellation_reason: appointment.cancellation_reason,
      created_at: appointment.created_at,
      updated_at: appointment.updated_at,
      veterinarian: appointment.veterinarian
        ? {
            id: appointment.veterinarian.id,
            full_name: appointment.veterinarian.full_name,
            specialization: appointment.veterinarian.specialization,
            email: appointment.veterinarian.email,
            phone: appointment.veterinarian.phone,
          }
        : undefined,
      client: appointment.client
        ? {
            id: appointment.client.id,
            full_name: appointment.client.full_name,
            email: appointment.client.email,
            phone: appointment.client.phone,
          }
        : undefined,
      pet: appointment.pet
        ? {
            id: appointment.pet.id,
            name: appointment.pet.name,
            species: appointment.pet.species,
            breed: appointment.pet.breed,
          }
        : undefined,
    }
  }
}
