import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateConsultationDto {
  @IsOptional()
  @IsBoolean()
  completed?: boolean;
}
