import { PartialType } from "@nestjs/mapped-types"
import { IsOptional, IsEnum } from "class-validator"
import { CreateCustomerDto } from "./create-customer-pet.dto"
import { CustomerStatus } from "../entities/customer-pet.entity"

export class UpdateCustomerDto extends PartialType(CreateCustomerDto) {
  @IsOptional()
  @IsEnum(CustomerStatus)
  status?: CustomerStatus
}
