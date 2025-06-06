import { IsString, IsUUID, IsISO8601 } from 'class-validator';

export class CreateConsultationDto {
  @IsString()
  patientName: string;

  @IsString()
  doctorName: string;

  @IsISO8601()
  scheduledAt: string; // ISO date string

  @IsUUID()
  pricingId: string;
}
