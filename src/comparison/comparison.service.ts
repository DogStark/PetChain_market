import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../products/entities/product.entity';
import { ComparisonDto } from './dto/comparison.dto';
import {
  ComparisonResult,
  ProductComparison,
  ComparisonSummary,
} from './interfaces/comparison.interface';

@Injectable()
export class ComparisonService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async compareProducts(
    comparisonDto: ComparisonDto,
  ): Promise<ComparisonResult> {
    const products = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.inventory', 'inventory')
      .where('product.id IN (:...productIds)', {
        productIds: comparisonDto.productIds,
      })
      .andWhere('product.isActive = true')
      .getMany();

    if (products.length < 2) {
      throw new BadRequestException(
        'At least 2 active products are required for comparison',
      );
    }

    const productComparisons: ProductComparison[] = products.map(product => ({
      id: product.id,
      name: product.name,
      price: product.price,
      averageRating: product.averageRating,
      reviewCount: product.reviewCount,
      category: product.category,
      brand: product.brand,
      specifications: product.specifications || {},
      images: product.images || [],
      inventory: product.inventory
        ? {
            availableQuantity: product.inventory.availableQuantity,
            isInStock: !product.inventory.isOutOfStock,
          }
        : undefined,
    }));

    const summary = this.generateComparisonSummary(productComparisons);

    return {
      products: productComparisons,
      summary,
    };
  }

  private generateComparisonSummary(
    products: ProductComparison[],
  ): ComparisonSummary {
    const cheapest = products.reduce((min, product) =>
      product.price < min.price ? product : min,
    );

    const mostExpensive = products.reduce((max, product) =>
      product.price > max.price ? product : max,
    );

    const highestRated = products.reduce((max, product) =>
      product.averageRating > max.averageRating ? product : max,
    );

    const mostReviewed = products.reduce((max, product) =>
      product.reviewCount > max.reviewCount ? product : max,
    );

    // Find common and differing specifications
    const allSpecs = products.map(p => Object.keys(p.specifications)).flat();
    const specCounts = allSpecs.reduce(
      (acc, spec) => {
        acc[spec] = (acc[spec] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const commonSpecs = Object.keys(specCounts).filter(
      spec => specCounts[spec] === products.length,
    );

    const differingSpecs = Object.keys(specCounts).filter(
      spec => specCounts[spec] < products.length && specCounts[spec] > 0,
    );

    return {
      cheapest: cheapest.id,
      mostExpensive: mostExpensive.id,
      highestRated: highestRated.id,
      mostReviewed: mostReviewed.id,
      commonSpecs,
      differingSpecs,
    };
  }
}
