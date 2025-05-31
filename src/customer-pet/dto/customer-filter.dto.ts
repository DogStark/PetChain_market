import { IsOptional, IsString, IsEnum, IsBoolean, IsNumber } from "class-validator"
import { Transform } from "class-transformer"
import { CustomerStatus, CustomerType } from "../entities/customer-pet.entity"

export class CustomerFilterDto {
  @IsOptional()
  @IsString()
  search?: string

  @IsOptional()
  @IsEnum(CustomerStatus)
  status?: CustomerStatus

  @IsOptional()
  @IsEnum(CustomerType)
  customerType?: CustomerType

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }: { value: any }) => value === "true")
  isEmailVerified?: boolean

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }: { value: any }) => value === "true")
  isPhoneVerified?: boolean

  @IsOptional()
  @IsNumber()
  @Transform(({ value }: { value: any }) => Number.parseInt(value))
  page?: number = 1

  @IsOptional()
  @IsNumber()
  @Transform(({ value }: { value: any }) => Number.parseInt(value))
  limit?: number = 10

  @IsOptional()
  @IsString()
  sortBy?: string = "createdAt"

  @IsOptional()
  @IsEnum(["ASC", "DESC"])
  sortOrder?: "ASC" | "DESC" = "DESC"
}
