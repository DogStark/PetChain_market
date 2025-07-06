import { Controller, Post, Get, Patch, Body, Param, Query } from '@nestjs/common';
import { ReviewsService } from './re-view.service';
import { CreateReviewDto } from './dto/create-re-view.dto';
import { RespondReviewDto } from './dto/respond-review.dto';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly service: ReviewsService) {}

  @Post()
  create(@Body() dto: CreateReviewDto) {
    return this.service.create(dto);
  }

  @Get(':productId')
  getReviews(@Param('productId') pid: string) {
    return {
      reviews: this.service.findAll(pid),
      averageRating: this.service.getAverageRating(pid),
    };
  }

  @Patch(':id/moderate')
  moderate(@Param('id') id: number, @Query('approve') approve: string) {
    return this.service.moderate(id, approve === 'true');
  }

  @Patch(':id/helpful')
  voteHelpful(@Param('id') id: number) {
    return this.service.voteHelpful(id);
  }

  @Patch(':id/respond')
  respond(@Param('id') id: number, @Body() dto: RespondReviewDto) {
    return this.service.respond(id, dto.response);
  }
}
