import { Injectable, Logger } from '@nestjs/common';
import { EmergencyAppointment } from '../emergency-booking/entities/emergency-appointment.entity';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  async notifyEmergencyContact(
    appointment: EmergencyAppointment,
  ): Promise<boolean> {
    try {
      // In a real implementation, you would integrate with SMS/email services
      // like Twilio, SendGrid, AWS SES, etc.

      const message = `EMERGENCY: ${appointment.petName} (${appointment.petSpecies}) has been brought to the emergency vet. 
      Owner: ${appointment.ownerName}. 
      Priority: ${appointment.priority}. 
      Please contact ${appointment.ownerPhone} for more information.`;

      // Simulate SMS sending with delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      this.logger.log(
        `Sending emergency SMS to ${appointment.emergencyContactPhone}: ${message}`,
      );

      // Simulate email notification with delay
      const emailSubject = `Emergency Vet Visit - ${appointment.petName}`;
      const emailBody = this.generateEmergencyEmail(appointment);

      await new Promise(resolve => setTimeout(resolve, 1000));
      this.logger.log(
        `Sending emergency email to emergency contact: ${emailSubject}`,
      );

      return true;
    } catch (error) {
      this.logger.error(`Failed to notify emergency contact: ${error.message}`);
      return false;
    }
  }

  async notifyOwner(
    appointment: EmergencyAppointment,
    type: 'confirmation' | 'update' | 'ready',
  ): Promise<boolean> {
    try {
      let message = '';
      let subject = '';

      switch (type) {
        case 'confirmation':
          subject = `Emergency Appointment Confirmed - ${appointment.petName}`;
          message = `Your emergency appointment for ${appointment.petName} has been confirmed. 
          Priority: ${appointment.priority}. 
          Estimated wait time based on triage: ${this.getWaitTimeMessage(appointment.triageLevel)}.
          Please arrive as soon as possible.`;
          break;
        case 'update':
          subject = `Appointment Update - ${appointment.petName}`;
          message = `Update on ${appointment.petName}'s emergency visit. Status: ${appointment.status}.`;
          break;
        case 'ready':
          subject = `Ready for Treatment - ${appointment.petName}`;
          message = `${appointment.petName} is ready to be seen by the veterinarian. Please proceed to the treatment room.`;
          break;
      }

      // Simulate notification delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      this.logger.log(
        `Sending ${type} notification to ${appointment.ownerEmail}: ${subject}`,
      );

      return true;
    } catch (error) {
      this.logger.error(`Failed to notify owner: ${error.message}`);
      return false;
    }
  }

  private generateEmergencyEmail(appointment: EmergencyAppointment): string {
    return `
      Dear Emergency Contact,
      
      This is an urgent notification regarding ${appointment.petName}, a ${appointment.petSpecies} owned by ${appointment.ownerName}.
      
      The pet has been brought to our emergency veterinary clinic with the following symptoms:
      ${appointment.symptoms}
      
      Priority Level: ${appointment.priority}
      Triage Level: ${appointment.triageLevel}
      
      Owner Contact Information:
      Phone: ${appointment.ownerPhone}
      Email: ${appointment.ownerEmail}
      
      Please contact the owner or our clinic immediately.
      
      Emergency Veterinary Clinic
      Phone: (555) 123-EMRG
    `;
  }

  private getWaitTimeMessage(triageLevel: number): string {
    switch (triageLevel) {
      case 1:
        return 'Immediate attention';
      case 2:
        return 'Within 30 minutes';
      case 3:
        return 'Within 2 hours';
      case 4:
        return 'Within 24 hours';
      default:
        return 'To be determined';
    }
  }
}
