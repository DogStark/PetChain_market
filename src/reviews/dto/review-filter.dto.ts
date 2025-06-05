import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../common/dto/pagination.dto';

enum ReviewSortBy {
  CREATED_AT = 'createdAt',
  RATING = 'rating',
  HELPFUL = 'helpfulCount',
}

export class ReviewFilterDto extends PaginationDto {
  @ApiPropertyOptional({ minimum: 1, maximum: 5 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  rating?: number;

  @ApiPropertyOptional({ enum: ReviewSortBy, default: ReviewSortBy.CREATED_AT })
  @IsOptional()
  @IsEnum(ReviewSortBy)
  sortBy?: ReviewSortBy = ReviewSortBy.CREATED_AT;
}
