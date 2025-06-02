import { Module } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { ReviewResponse } from './entities/response-review.dto';

@Module({
  imports: [TypeOrmModule.forFeature([Review, ReviewResponse])],
  controllers: [ReviewController],
  providers: [ReviewService],
  exports:[ReviewService]
})
export class ReviewModule {}

