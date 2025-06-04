import { IsString, IsOptional, IsArray, IsNumber, Min } from 'class-validator';

export class CreateStaffRoleDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  baseSalary?: number;
}
