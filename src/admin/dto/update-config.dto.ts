import { IsOptional, IsBoolean } from 'class-validator';

export class UpdateConfigDto {
  @IsOptional()
  @IsBoolean()
  maintenanceMode?: boolean;
}

