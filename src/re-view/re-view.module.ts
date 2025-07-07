import { Module } from '@nestjs/common';
import { ReviewsController } from './re-view.controller';
import { ReviewsService } from './re-view.service';
@Module({
  controllers: [ReviewsController],
  providers: [ReviewsService],
})
export class ReviewsModule {}
