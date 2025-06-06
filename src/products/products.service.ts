import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between, In } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductSearchDto } from './dto/product-search.dto';
import { PaginatedResult } from '../common/interfaces/pagination.interface';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const product = this.productRepository.create(createProductDto);
    return this.productRepository.save(product);
  }

  async findAll(
    searchDto: ProductSearchDto,
  ): Promise<PaginatedResult<Product>> {
    const queryBuilder = this.productRepository.createQueryBuilder('product');

    // Apply filters
    if (searchDto.search) {
      queryBuilder.where(
        'LOWER(product.name) LIKE LOWER(:search) OR LOWER(product.description) LIKE LOWER(:search)',
        { search: `%${searchDto.search}%` },
      );
    }

    if (searchDto.category) {
      queryBuilder.andWhere('product.category = :category', {
        category: searchDto.category,
      });
    }

    if (searchDto.brand) {
      queryBuilder.andWhere('product.brand = :brand', {
        brand: searchDto.brand,
      });
    }

    if (searchDto.minPrice !== undefined) {
      queryBuilder.andWhere('product.price >= :minPrice', {
        minPrice: searchDto.minPrice,
      });
    }

    if (searchDto.maxPrice !== undefined) {
      queryBuilder.andWhere('product.price <= :maxPrice', {
        maxPrice: searchDto.maxPrice,
      });
    }

    if (searchDto.tags && searchDto.tags.length > 0) {
      queryBuilder.andWhere('product.tags && :tags', { tags: searchDto.tags });
    }

    queryBuilder.andWhere('product.isActive = true');

    // Apply sorting
    queryBuilder.orderBy(`product.${searchDto.sortBy}`, searchDto.sortOrder);

    // Apply pagination
    const skip = (searchDto.page - 1) * searchDto.limit;
    queryBuilder.skip(skip).take(searchDto.limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      meta: {
        total,
        page: searchDto.page,
        limit: searchDto.limit,
        totalPages: Math.ceil(total / searchDto.limit),
      },
    };
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['inventory', 'reviews'],
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    await this.productRepository.update(id, updateProductDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.productRepository.update(id, { isActive: false });
    if (result.affected === 0) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
  }

  async updateRating(productId: string): Promise<void> {
    const result = await this.productRepository
      .createQueryBuilder()
      .select('AVG(review.rating)', 'avgRating')
      .addSelect('COUNT(review.id)', 'reviewCount')
      .from('reviews', 'review')
      .where('review.productId = :productId', { productId })
      .getRawOne();

    await this.productRepository.update(productId, {
      averageRating: parseFloat(result.avgRating) || 0,
      reviewCount: parseInt(result.reviewCount) || 0,
    });
  }
}
