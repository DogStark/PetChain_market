import { IsString, IsDate, IsOptional, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateVaccinationScheduleDto {
  @IsUUID()
  petId: string;

  @IsString()
  vaccineName: string;

  @IsString()
  vaccineType: string;

  @IsDate()
  @Type(() => Date)
  scheduledDate: Date;

  @IsOptional()
  @IsString()
  notes?: string;
}
