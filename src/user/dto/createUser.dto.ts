import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  Matches,
} from 'class-validator';
import { Trim, Escape } from 'class-sanitizer';
import { UserRole } from '../../common/enums/roles.enum';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty({ message: 'Email must not be empty.' })
  @Trim()
  @Escape()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message:
        'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character',
    },
  )
  password!: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
