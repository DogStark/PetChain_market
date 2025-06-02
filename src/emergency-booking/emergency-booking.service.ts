import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmergencyAppointment } from './entities/emergency-appointment.entity';
import { CreateEmergencyAppointmentDto } from './dto/create-emergency-appointment.dto';
import { TriageService } from '../triage/triage.service';
import { PricingService } from '../pricing/pricing.service';
import { NotificationService } from '../notification/notification.service';
import { AppointmentStatus } from '../common/enums/emergency.enum';

@Injectable()
export class EmergencyBookingService {
  private readonly logger = new Logger(EmergencyBookingService.name);

  constructor(
    @InjectRepository(EmergencyAppointment)
    private appointmentRepository: Repository<EmergencyAppointment>,
    private triageService: TriageService,
    private pricingService: PricingService,
    private notificationService: NotificationService,
  ) {}

  async createEmergencyAppointment(
    createDto: CreateEmergencyAppointmentDto,
  ): Promise<EmergencyAppointment> {
    // Perform triage assessment
    const triageResult = this.triageService.assessTriage(createDto.symptoms);

    // Calculate estimated cost
    const estimatedCost = this.pricingService.getEstimatedCost(
      triageResult.priority,
      triageResult.level,
    );

    // Create appointment
    const appointment = this.appointmentRepository.create({
      ...createDto,
      priority: triageResult.priority,
      triageLevel: triageResult.level,
      estimatedCost,
      scheduledTime: this.calculateScheduledTime(triageResult.level),
    });

    const savedAppointment = await this.appointmentRepository.save(appointment);

    // Send notifications
    await this.sendInitialNotifications(savedAppointment);

    this.logger.log(
      `Emergency appointment created for ${appointment.petName} with priority ${appointment.priority}`,
    );

    return savedAppointment;
  }

  async getAppointmentsByPriority(): Promise<EmergencyAppointment[]> {
    const appointments = await this.appointmentRepository.find({
      where: { status: AppointmentStatus.PENDING },
      order: { createdAt: 'ASC' },
    });

    // Sort by priority score (highest first)
    return appointments.sort((a, b) => {
      const scoreB = this.triageService.calculatePriorityScore(b);
      const scoreA = this.triageService.calculatePriorityScore(a);
      return scoreB - scoreA;
    });
  }

  async updateAppointmentStatus(
    id: string,
    status: AppointmentStatus,
  ): Promise<EmergencyAppointment> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    appointment.status = status;

    if (status === AppointmentStatus.IN_PROGRESS) {
      appointment.arrivalTime = new Date();
    }

    const updatedAppointment =
      await this.appointmentRepository.save(appointment);

    // Send status update notification
    await this.notificationService.notifyOwner(updatedAppointment, 'update');

    if (status === AppointmentStatus.IN_PROGRESS) {
      await this.notificationService.notifyOwner(updatedAppointment, 'ready');
    }

    return updatedAppointment;
  }

  async getAppointmentById(id: string): Promise<EmergencyAppointment> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    return appointment;
  }

  private async sendInitialNotifications(
    appointment: EmergencyAppointment,
  ): Promise<void> {
    try {
      // Notify owner of confirmation
      await this.notificationService.notifyOwner(appointment, 'confirmation');

      // Notify emergency contact
      const contactNotified =
        await this.notificationService.notifyEmergencyContact(appointment);

      // Update the appointment with notification status
      appointment.emergencyContactNotified = contactNotified;
      await this.appointmentRepository.save(appointment);
    } catch (error) {
      this.logger.error(
        `Failed to send initial notifications: ${error.message}`,
      );
    }
  }

  private calculateScheduledTime(triageLevel: number): Date {
    const now = new Date();

    switch (triageLevel) {
      case 1: // Immediate
        return now;
      case 2: // Within 30 minutes
        return new Date(now.getTime() + 30 * 60 * 1000);
      case 3: // Within 2 hours
        return new Date(now.getTime() + 2 * 60 * 60 * 1000);
      case 4: // Within 24 hours
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() + 60 * 60 * 1000); // 1 hour default
    }
  }
}
