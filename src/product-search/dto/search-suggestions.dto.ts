import { IsOptional, IsString, IsNumber, Min, Max } from "class-validator"
import { Type } from "class-transformer"

export class GetSuggestionsDto {
  @IsString()
  query: string

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(20)
  limit?: number = 10
}

export class SearchSuggestionResponseDto {
  query: string
  search_count: number
  result_count: number
}
