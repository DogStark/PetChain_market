import { Controller, Get, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RecommendationsService } from './recommendations.service';
import { RecommendationQueryDto } from './dto/recommendation-query.dto';

@ApiTags('recommendations')
@Controller('recommendations')
export class RecommendationsController {
  constructor(
    private readonly recommendationsService: RecommendationsService,
  ) {}

  @Get('product/:productId')
  @ApiOperation({ summary: 'Get product recommendations' })
  @ApiResponse({
    status: 200,
    description: 'Recommendations retrieved successfully',
  })
  getRecommendations(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Query() queryDto: RecommendationQueryDto,
  ) {
    return this.recommendationsService.getRecommendations(productId, queryDto);
  }
}
