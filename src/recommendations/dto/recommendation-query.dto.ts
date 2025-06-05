import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

enum RecommendationType {
  SIMILAR = 'similar',
  FREQUENTLY_BOUGHT = 'frequently_bought',
  TRENDING = 'trending',
  PERSONALIZED = 'personalized',
}

export class RecommendationQueryDto {
  @ApiPropertyOptional({
    enum: RecommendationType,
    default: RecommendationType.SIMILAR,
  })
  @IsOptional()
  @IsEnum(RecommendationType)
  type?: RecommendationType = RecommendationType.SIMILAR;

  @ApiPropertyOptional({ default: 5, minimum: 1, maximum: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 5;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  userId?: string;
}
