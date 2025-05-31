import { PartialType } from "@nestjs/mapped-types"
import { CreateAddressDto } from "./create-address.dto"
import { IsOptional, IsBoolean } from "class-validator"

export class UpdateAddressDto extends PartialType(CreateAddressDto) {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean
}
