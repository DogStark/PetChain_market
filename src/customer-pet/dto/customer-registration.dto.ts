import { IsString, IsEmail, IsOptional, MinLength, MaxLength, IsPhoneNumber, ValidateNested } from "class-validator"
import { Type } from "class-transformer"
import { CreateAddressDto } from "./create-address.dto"

export class CustomerRegistrationDto {
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

  @IsString()
  @MinLength(8)
  password!: string

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateAddressDto)
  address?: Omit<CreateAddressDto, "customerId">

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
}
