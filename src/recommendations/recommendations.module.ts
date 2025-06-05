import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecommendationsService } from './recommendations.service';
import { RecommendationsController } from './recommendations.controller';
import { Product } from '../products/entities/product.entity';
import { Review } from '../reviews/entities/review.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Review])],
  controllers: [RecommendationsController],
  providers: [RecommendationsService],
  exports: [RecommendationsService],
})
export class RecommendationsModule {}
