import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { VaccinationService } from './vaccination.service';
import { VaccinationReminderDto } from '../dto/vaccination-reminder.dto';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class VaccinationReminderService {
  private readonly logger = new Logger(VaccinationReminderService.name);

  constructor(
    private vaccinationService: VaccinationService,
    private mailerService: MailerService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async sendDailyVaccinationReminders(): Promise<void> {
    this.logger.log('Starting daily vaccination reminder process');

    try {
      const upcomingVaccinations = await this.vaccinationService.getUpcomingVaccinations(7);
      
      const overdueVaccinations = await this.vaccinationService.getOverdueVaccinations();

      for (const vaccination of upcomingVaccinations) {
        const daysUntilDue = this.calculateDaysUntil(vaccination.scheduledDate);
        
        if ([7, 3, 1].includes(daysUntilDue) && !vaccination.reminderSent) {
          await this.sendVaccinationReminder({
            petName: vaccination.pet.name,
            petId: vaccination.petId,
            ownerEmail: 'owner@example.com', 
            vaccineName: vaccination.vaccineName,
            scheduledDate: vaccination.scheduledDate,
            daysUntilDue,
          });

          vaccination.reminderSent = true;
          vaccination.reminderSentAt = new Date();
        }
      }

      for (const vaccination of overdueVaccinations) {
        await this.sendOverdueVaccinationAlert({
          petName: vaccination.pet.name,
          petId: vaccination.petId,
          ownerEmail: 'owner@example.com',
          vaccineName: vaccination.vaccineName,
          scheduledDate: vaccination.scheduledDate,
          daysUntilDue: this.calculateDaysUntil(vaccination.scheduledDate),
        });
      }

      this.logger.log(`Processed ${upcomingVaccinations.length + overdueVaccinations.length} vaccination reminders`);
    } catch (error) {
      this.logger.error('Error processing vaccination reminders', error);
    }
  }

  private async sendVaccinationReminder(reminder: VaccinationReminderDto): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: reminder.ownerEmail,
        subject: `Vaccination Reminder for ${reminder.petName}`,
        template: 'vaccination-reminder',
        context: {
          petName: reminder.petName,
          vaccineName: reminder.vaccineName,
          scheduledDate: reminder.scheduledDate.toLocaleDateString(),
          daysUntilDue: reminder.daysUntilDue,
        },
      });

      this.logger.log(`Vaccination reminder sent for pet ${reminder.petName}`);
    } catch (error) {
      this.logger.error(`Failed to send vaccination reminder for pet ${reminder.petName}`, error);
    }
  }

  private async sendOverdueVaccinationAlert(reminder: VaccinationReminderDto): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: reminder.ownerEmail,
        subject: `OVERDUE: Vaccination Alert for ${reminder.petName}`,
        template: 'vaccination-overdue',
        context: {
          petName: reminder.petName,
          vaccineName: reminder.vaccineName,
          scheduledDate: reminder.scheduledDate.toLocaleDateString(),
          daysOverdue: Math.abs(reminder.daysUntilDue),
        },
      });

      this.logger.log(`Overdue vaccination alert sent for pet ${reminder.petName}`);
    } catch (error) {
      this.logger.error(`Failed to send overdue vaccination alert for pet ${reminder.petName}`, error);
    }
  }

  private calculateDaysUntil(date: Date): number {
    const today = new Date();
    const timeDiff = date.getTime() - today.getTime();
    return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  }
}
