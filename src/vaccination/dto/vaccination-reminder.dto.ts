export class VaccinationReminderDto {
  petName: string | undefined;
  petId: string;
  ownerEmail: string;
  vaccineName: string;
  scheduledDate: Date;
  daysUntilDue: number;
}
