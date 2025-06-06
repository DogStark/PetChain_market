import { IsOptional, IsString, IsNumber, IsArray, IsEnum, Min, Max } from "class-validator"
import { Type, Transform } from "class-transformer"

export enum SortBy {
  RELEVANCE = "relevance",
  PRICE_ASC = "price_asc",
  PRICE_DESC = "price_desc",
  NAME_ASC = "name_asc",
  NAME_DESC = "name_desc",
  RATING_DESC = "rating_desc",
  NEWEST = "newest",
  OLDEST = "oldest",
}

export class SearchProductsDto {
  @IsOptional()
  @IsString()
  query?: string

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => {
    if (typeof value === "string") {
      return value.split(",").map((item) => item.trim())
    }
    return value
  })
  categories?: string[]

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => {
    if (typeof value === "string") {
      return value.split(",").map((item) => item.trim())
    }
    return value
  })
  brands?: string[]

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  min_price?: number

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  max_price?: number

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(5)
  min_rating?: number

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => {
    if (typeof value === "string") {
      return value.split(",").map((item) => item.trim())
    }
    return value
  })
  tags?: string[]

  @IsOptional()
  @IsEnum(SortBy)
  sort_by?: SortBy = SortBy.RELEVANCE

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20

  @IsOptional()
  @IsString()
  status?: string = "active"
}
