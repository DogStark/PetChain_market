import { Injectable, Logger } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { Cron, CronExpression } from "@nestjs/schedule"
import { AppointmentReminder, ReminderStatus, ReminderType } from "../entities/appointment-reminder.entity"
import { LessThanOrEqual } from "typeorm"

@Injectable()
export class ReminderService {
  private readonly logger = new Logger(ReminderService.name);

  constructor(
    @InjectRepository(AppointmentReminder)
    private readonly reminderRepository: Repository<AppointmentReminder>,
  ) { }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async processPendingReminders(): Promise<void> {
    const now = new Date()
    const pendingReminders = await this.reminderRepository.find({
      where: {
        status: ReminderStatus.PENDING,
        scheduled_for: LessThanOrEqual(now),
      },
      relations: ["appointment", "appointment.client", "appointment.veterinarian", "appointment.pet"],
      take: 50, // Process in batches
    })

    if (pendingReminders.length === 0) {
      return
    }

    this.logger.log(`Processing ${pendingReminders.length} pending reminders`)

    for (const reminder of pendingReminders) {
      try {
        await this.sendReminder(reminder)
        reminder.status = ReminderStatus.SENT
        reminder.sent_at = new Date()
      } catch (error) {
        this.logger.error(`Failed to send reminder ${reminder.id}`, error.stack)
        reminder.retry_count += 1
        reminder.error_message = error.message

        if (reminder.retry_count >= reminder.max_retries) {
          reminder.status = ReminderStatus.FAILED
        } else {
          // Reschedule for retry (5 minutes later)
          reminder.scheduled_for = new Date(Date.now() + 5 * 60 * 1000)
        }
      }

      await this.reminderRepository.save(reminder)
    }

    this.logger.log(`Completed processing reminders`)
  }

  private async sendReminder(reminder: AppointmentReminder): Promise<void> {
    const { appointment } = reminder

    if (!appointment) {
      throw new Error("Appointment not found for reminder")
    }

    const message = this.generateReminderMessage(reminder)
    reminder.message = message

    switch (reminder.reminder_type) {
      case ReminderType.EMAIL:
        await this.sendEmailReminder(appointment.client.email, message, appointment)
        break
      case ReminderType.SMS:
        await this.sendSmsReminder(appointment.client.phone, message, appointment)
        break
      case ReminderType.PUSH:
        await this.sendPushNotification(appointment.client.id, message, appointment)
        break
      default:
        throw new Error(`Unsupported reminder type: ${reminder.reminder_type}`)
    }

    this.logger.log(
      `${reminder.reminder_type} reminder sent for appointment ${appointment.id} to ${appointment.client.full_name}`,
    )
  }

  private generateReminderMessage(reminder: AppointmentReminder): string {
    const { appointment } = reminder
    const appointmentDate = new Date(appointment.appointment_date).toLocaleDateString()
    const appointmentTime = appointment.start_time

    switch (reminder.reminder_type) {
      case ReminderType.EMAIL:
        return `
Dear ${appointment.client.full_name},

This is a reminder that you have an appointment scheduled for ${appointment.pet.name}.

Appointment Details:
- Date: ${appointmentDate}
- Time: ${appointmentTime}
- Veterinarian: Dr. ${appointment.veterinarian.full_name}
- Pet: ${appointment.pet.name} (${appointment.pet.species})
- Type: ${appointment.appointment_type}
${appointment.reason ? `- Reason: ${appointment.reason}` : ""}

Please arrive 15 minutes early for check-in.

If you need to reschedule or cancel, please contact us as soon as possible.

Best regards,
Veterinary Clinic
        `.trim()

      case ReminderType.SMS:
        return `Reminder: ${appointment.pet.name}'s appointment with Dr. ${appointment.veterinarian.full_name} on ${appointmentDate} at ${appointmentTime}. Please arrive 15 min early.`

      case ReminderType.PUSH:
        return `Appointment reminder for ${appointment.pet.name} tomorrow at ${appointmentTime}`

      default:
        return `Appointment reminder for ${appointment.pet.name} on ${appointmentDate} at ${appointmentTime}`
    }
  }

  private async sendEmailReminder(email: string, message: string, appointment: any): Promise<void> {
    // Implement email sending logic here
    // This could use services like SendGrid, AWS SES, etc.
    this.logger.log(`Sending email reminder to ${email}`)

    // Simulate email sending
    await new Promise((resolve) => setTimeout(resolve, 100))

    // In a real implementation, you would:
    // 1. Use an email service provider
    // 2. Handle email templates
    // 3. Track delivery status
    // 4. Handle bounces and failures
  }

  private async sendSmsReminder(phone: string, message: string, appointment: any): Promise<void> {
    // Implement SMS sending logic here
    // This could use services like Twilio, AWS SNS, etc.
    this.logger.log(`Sending SMS reminder to ${phone}`)

    // Simulate SMS sending
    await new Promise((resolve) => setTimeout(resolve, 100))

    // In a real implementation, you would:
    // 1. Use an SMS service provider
    // 2. Handle phone number formatting
    // 3. Track delivery status
    // 4. Handle failures and retries
  }

  private async sendPushNotification(userId: string, message: string, appointment: any): Promise<void> {
    // Implement push notification logic here
    // This could use services like Firebase Cloud Messaging, AWS SNS, etc.
    this.logger.log(`Sending push notification to user ${userId}`)

    // Simulate push notification sending
    await new Promise((resolve) => setTimeout(resolve, 100))

    // In a real implementation, you would:
    // 1. Use a push notification service
    // 2. Handle device tokens
    // 3. Track delivery status
    // 4. Handle failures and retries
  }

  async createCustomReminder(
    appointmentId: string,
    reminderType: ReminderType,
    scheduledFor: Date,
    customMessage?: string,
  ): Promise<void> {
    const reminder = this.reminderRepository.create({
      appointment_id: appointmentId,
      reminder_type: reminderType,
      scheduled_for: scheduledFor,
      status: ReminderStatus.PENDING,
      message: customMessage,
    })

    await this.reminderRepository.save(reminder)
    this.logger.log(`Custom reminder created for appointment ${appointmentId}`)
  }

  async cancelRemindersForAppointment(appointmentId: string): Promise<void> {
    await this.reminderRepository.update(
      { appointment_id: appointmentId, status: ReminderStatus.PENDING },
      { status: ReminderStatus.CANCELLED },
    )

    this.logger.log(`Cancelled reminders for appointment ${appointmentId}`)
  }
}
