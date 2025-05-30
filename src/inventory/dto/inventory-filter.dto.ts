import { IsOptional, IsString, IsNumber, IsBoolean, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';

export class InventoryFilterDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  supplierId?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  lowStock?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  outOfStock?: boolean;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  limit?: number = 10;

  @IsOptional()
  @IsString()
  sortBy?: string = 'name';

  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'ASC';
}
