import { IsUUID, IsOptional, IsNumber, Min, Max } from "class-validator"
import { Type } from "class-transformer"

export class AddRecentlyViewedDto {
  @IsUUID()
  user_id: string

  @IsUUID()
  product_id: string
}

export class GetRecentlyViewedDto {
  @IsUUID()
  user_id: string

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(50)
  limit?: number = 10
}
