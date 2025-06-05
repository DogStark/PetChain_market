import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewFilterDto } from './dto/review-filter.dto';
import { PaginatedResult } from '../common/interfaces/pagination.interface';
import { ProductsService } from '../products/products.service';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    private productsService: ProductsService,
  ) {}

  async create(
    productId: string,
    createReviewDto: CreateReviewDto,
  ): Promise<Review> {
    // Verify product exists
    await this.productsService.findOne(productId);

    const review = this.reviewRepository.create({
      ...createReviewDto,
      productId,
    });

    const savedReview = await this.reviewRepository.save(review);

    // Update product rating
    await this.productsService.updateRating(productId);

    return savedReview;
  }

  async findByProduct(
    productId: string,
    filterDto: ReviewFilterDto,
  ): Promise<PaginatedResult<Review>> {
    const queryBuilder = this.reviewRepository.createQueryBuilder('review');

    queryBuilder.where('review.productId = :productId', { productId });

    if (filterDto.rating) {
      queryBuilder.andWhere('review.rating = :rating', {
        rating: filterDto.rating,
      });
    }

    queryBuilder.orderBy(`review.${filterDto.sortBy}`, 'DESC');

    const skip = (filterDto.page - 1) * filterDto.limit;
    queryBuilder.skip(skip).take(filterDto.limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      meta: {
        total,
        page: filterDto.page,
        limit: filterDto.limit,
        totalPages: Math.ceil(total / filterDto.limit),
      },
    };
  }

  async findOne(id: string): Promise<Review> {
    const review = await this.reviewRepository.findOne({
      where: { id },
      relations: ['product'],
    });

    if (!review) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }

    return review;
  }

  async markHelpful(id: string): Promise<Review> {
    const review = await this.findOne(id);
    review.helpfulCount += 1;
    return this.reviewRepository.save(review);
  }

  async getReviewStats(productId: string) {
    const stats = await this.reviewRepository
      .createQueryBuilder('review')
      .select('review.rating', 'rating')
      .addSelect('COUNT(*)', 'count')
      .where('review.productId = :productId', { productId })
      .groupBy('review.rating')
      .orderBy('review.rating', 'ASC')
      .getRawMany();

    const total = stats.reduce((sum, stat) => sum + parseInt(stat.count), 0);
    const average =
      stats.reduce((sum, stat) => sum + stat.rating * parseInt(stat.count), 0) /
        total || 0;

    return {
      total,
      average: parseFloat(average.toFixed(2)),
      distribution: stats.map(stat => ({
        rating: parseInt(stat.rating),
        count: parseInt(stat.count),
        percentage: parseFloat(
          ((parseInt(stat.count) / total) * 100).toFixed(1),
        ),
      })),
    };
  }
}
