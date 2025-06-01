import { IsOptional, IsString, IsDateString } from 'class-validator';

export class GetAuditLogsDto {
  @IsOptional()
  @IsString()
  user?: string;

  @IsOptional()
  @IsString()
  action?: string;

  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;
}