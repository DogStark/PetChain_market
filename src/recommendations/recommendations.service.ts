import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../products/entities/product.entity';
import { Review } from '../reviews/entities/review.entity';
import { RecommendationQueryDto } from './dto/recommendation-query.dto';

@Injectable()
export class RecommendationsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
  ) {}

  async getRecommendations(
    productId: string,
    queryDto: RecommendationQueryDto,
  ): Promise<Product[]> {
    switch (queryDto.type) {
      case 'similar':
        return this.getSimilarProducts(productId, queryDto.limit);
      case 'frequently_bought':
        return this.getFrequentlyBoughtTogether(productId, queryDto.limit);
      case 'trending':
        return this.getTrendingProducts(queryDto.limit);
      case 'personalized':
        return this.getPersonalizedRecommendations(
          queryDto.userId,
          queryDto.limit,
        );
      default:
        return this.getSimilarProducts(productId, queryDto.limit);
    }
  }

  private async getSimilarProducts(
    productId: string,
    limit: number,
  ): Promise<Product[]> {
    const product = await this.productRepository.findOne({
      where: { id: productId },
    });

    if (!product) return [];

    return this.productRepository
      .createQueryBuilder('product')
      .where('product.id != :productId', { productId })
      .andWhere('product.isActive = true')
      .andWhere('product.category = :category', { category: product.category })
      .orderBy('ABS(product.price - :price)', 'ASC')
      .addOrderBy('product.averageRating', 'DESC')
      .setParameter('price', product.price)
      .limit(limit)
      .getMany();
  }

  private async getFrequentlyBoughtTogether(
    productId: string,
    limit: number,
  ): Promise<Product[]> {
    // Simplified logic - in real app, you'd track purchase history
    const product = await this.productRepository.findOne({
      where: { id: productId },
    });

    if (!product) return [];

    return this.productRepository
      .createQueryBuilder('product')
      .where('product.id != :productId', { productId })
      .andWhere('product.isActive = true')
      .andWhere('product.category = :category OR product.brand = :brand', {
        category: product.category,
        brand: product.brand,
      })
      .orderBy('product.reviewCount', 'DESC')
      .addOrderBy('product.averageRating', 'DESC')
      .limit(limit)
      .getMany();
  }

  private async getTrendingProducts(limit: number): Promise<Product[]> {
    return this.productRepository
      .createQueryBuilder('product')
      .where('product.isActive = true')
      .andWhere('product.createdAt >= :date', {
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
      })
      .orderBy('product.reviewCount', 'DESC')
      .addOrderBy('product.averageRating', 'DESC')
      .limit(limit)
      .getMany();
  }

  private async getPersonalizedRecommendations(
    userId: string,
    limit: number,
  ): Promise<Product[]> {
    if (!userId) return this.getTrendingProducts(limit);

    // Get user's reviewed products to understand preferences
    const userReviews = await this.reviewRepository
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.product', 'product')
      .where('review.userId = :userId', { userId })
      .andWhere('review.rating >= 4') // Only consider highly rated products
      .orderBy('review.createdAt', 'DESC')
      .limit(10)
      .getMany();

    if (userReviews.length === 0) {
      return this.getTrendingProducts(limit);
    }

    // Extract categories and brands from user's preferences
    const categories = [...new Set(userReviews.map(r => r.product.category))];
    const brands = [...new Set(userReviews.map(r => r.product.brand))];
    const reviewedProductIds = userReviews.map(r => r.product.id);

    return this.productRepository
      .createQueryBuilder('product')
      .where('product.id NOT IN (:...reviewedProductIds)', {
        reviewedProductIds,
      })
      .andWhere('product.isActive = true')
      .andWhere(
        '(product.category IN (:...categories) OR product.brand IN (:...brands))',
        {
          categories,
          brands,
        },
      )
      .orderBy('product.averageRating', 'DESC')
      .addOrderBy('product.reviewCount', 'DESC')
      .limit(limit)
      .getMany();
  }
}
