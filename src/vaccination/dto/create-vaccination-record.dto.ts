import { IsString, IsDate, IsOptional, IsArray, IsUUID, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateVaccinationRecordDto {
  @IsUUID()
  petId: string;

  @IsString()
  vaccineName: string;

  @IsString()
  vaccineType: string;

  @IsString()
  manufacturer: string;

  @IsString()
  batchNumber: string;

  @IsDate()
  @Type(() => Date)
  administeredDate: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  nextDueDate?: Date;

  @IsString()
  veterinarianName: string;

  @IsString()
  clinicName: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  sideEffects?: string[];
}
