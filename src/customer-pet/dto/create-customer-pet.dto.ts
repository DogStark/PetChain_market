import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  IsDateString,
  IsPhoneNumber,
  MaxLength,
  MinLength,
  IsBoolean,
} from "class-validator"
import { CustomerType } from "../entities/customer-pet.entity"

export class CreateCustomerDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  firstName!: string

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  lastName!: string

  @IsEmail()
  @MaxLength(255)
  email!: string

  @IsOptional()
  @IsPhoneNumber()
  phoneNumber?: string

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string

  @IsOptional()
  @IsEnum(CustomerType)
  customerType?: CustomerType = CustomerType.INDIVIDUAL

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string

  @IsOptional()
  @IsString()
  @MaxLength(255)
  emergencyContactName?: string

  @IsOptional()
  @IsPhoneNumber()
  emergencyContactPhone?: string

  @IsOptional()
  @IsString()
  @MaxLength(100)
  emergencyContactRelation?: string

  @IsOptional()
  @IsBoolean()
  isEmailVerified?: boolean = false

  @IsOptional()
  @IsBoolean()
  isPhoneVerified?: boolean = false
}
