import { IsString, IsEnum, IsOptional, IsBoolean, IsNumber, MaxLength, MinLength } from "class-validator"
import { AddressType } from "../entities/address.entity"

export class CreateAddressDto {
  @IsString()
  @MinLength(1)
  customerId!: string

  @IsOptional()
  @IsEnum(AddressType)
  type?: AddressType = AddressType.HOME

  @IsString()
  @MinLength(5)
  @MaxLength(255)
  street!: string

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  city!: string

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  state!: string

  @IsString()
  @MinLength(3)
  @MaxLength(20)
  postalCode!: string

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  country!: string

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean = false

  @IsOptional()
  @IsNumber()
  latitude?: number

  @IsOptional()
  @IsNumber()
  longitude?: number
}
