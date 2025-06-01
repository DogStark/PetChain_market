import { IsOptional, IsString, IsEmail, IsEnum } from 'class-validator';
import { Role } from '../../common/enums/role.enums';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
