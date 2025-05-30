import { IsOptional, IsString, IsEnum, IsDateString, IsArray } from 'class-validator';

export enum ReportType {
  STOCK_STATUS = 'STOCK_STATUS',
  MOVEMENT_ANALYSIS = 'MOVEMENT_ANALYSIS',
  LOW_STOCK = 'LOW_STOCK',
  TURNOVER_ANALYSIS = 'TURNOVER_ANALYSIS',
  SUPPLIER_PERFORMANCE = 'SUPPLIER_PERFORMANCE'
}

export enum ReportFormat {
  JSON = 'JSON',
  CSV = 'CSV',
  PDF = 'PDF',
  EXCEL = 'EXCEL'
}

export class InventoryReportDto {
  @IsEnum(ReportType)
  reportType: ReportType = ReportType.STOCK_STATUS;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categoryIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  supplierIds?: string[];

  @IsOptional()
  @IsEnum(ReportFormat)
  format?: ReportFormat = ReportFormat.JSON;

  @IsOptional()
  @IsString()
  email?: string; 
}