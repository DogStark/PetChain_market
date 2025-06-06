import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  Patch,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewFilterDto } from './dto/review-filter.dto';

@ApiTags('reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post('product/:productId')
  @ApiOperation({ summary: 'Create a review for a product' })
  @ApiResponse({ status: 201, description: 'Review created successfully' })
  create(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() createReviewDto: CreateReviewDto,
  ) {
    return this.reviewsService.create(productId, createReviewDto);
  }

  @Get('product/:productId')
  @ApiOperation({ summary: 'Get reviews for a product' })
  @ApiResponse({ status: 200, description: 'Reviews retrieved successfully' })
  findByProduct(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Query() filterDto: ReviewFilterDto,
  ) {
    return this.reviewsService.findByProduct(productId, filterDto);
  }

  @Get('product/:productId/stats')
  @ApiOperation({ summary: 'Get review statistics for a product' })
  @ApiResponse({
    status: 200,
    description: 'Review stats retrieved successfully',
  })
  getReviewStats(@Param('productId', ParseUUIDPipe) productId: string) {
    return this.reviewsService.getReviewStats(productId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get review by ID' })
  @ApiResponse({ status: 200, description: 'Review retrieved successfully' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.reviewsService.findOne(id);
  }

  @Patch(':id/helpful')
  @ApiOperation({ summary: 'Mark review as helpful' })
  @ApiResponse({ status: 200, description: 'Review marked as helpful' })
  markHelpful(@Param('id', ParseUUIDPipe) id: string) {
    return this.reviewsService.markHelpful(id);
  }
}
