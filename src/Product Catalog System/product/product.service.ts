import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between } from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { ProductImage } from './entities/product-image.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductFilterDto } from './dto/product-filter.dto';
import { CategoryService } from '../category/category.service';
import { InventoryService } from '../inventory/inventory.service';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(ProductVariant)
    private variantRepository: Repository<ProductVariant>,
    @InjectRepository(ProductImage)
    private imageRepository: Repository<ProductImage>,
    private categoryService: CategoryService,
    private inventoryService: InventoryService,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const category = await this.categoryService.findOne(createProductDto.categoryId);
    
    const product = this.productRepository.create({
      ...createProductDto,
      category,
    });

    const savedProduct = await this.productRepository.save(product);

    // Create inventory record
    await this.inventoryService.createInventory(
      savedProduct.id, 
      createProductDto.initialStock || 0
    );

    // Create variants if provided
    if (createProductDto.variants && createProductDto.variants.length > 0) {
      for (const variantDto of createProductDto.variants) {
        const variant = this.variantRepository.create({
          ...variantDto,
          product: savedProduct,
        });
        await this.variantRepository.save(variant);
      }
    }

    return this.findOne(savedProduct.id);
  }

  async findAll(filterDto: ProductFilterDto): Promise<{ products: Product[], total: number }> {
    const queryBuilder = this.productRepository.createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.variants', 'variants')
      .leftJoinAndSelect('product.images', 'images')
      .leftJoinAndSelect('product.inventory', 'inventory')
      .where('product.isActive = :isActive', { isActive: true });

    // Search filter
    if (filterDto.search) {
      queryBuilder.andWhere(
        '(product.name LIKE :search OR product.description LIKE :search OR product.sku LIKE :search)',
        { search: `%${filterDto.search}%` }
      );
    }

    // Category filter
    if (filterDto.categoryId) {
      queryBuilder.andWhere('product.category.id = :categoryId', { categoryId: filterDto.categoryId });
    }

    // Price range filter
    if (filterDto.minPrice !== undefined) {
      queryBuilder.andWhere('product.price >= :minPrice', { minPrice: filterDto.minPrice });
    }
    if (filterDto.maxPrice !== undefined) {
      queryBuilder.andWhere('product.price <= :maxPrice', { maxPrice: filterDto.maxPrice });
    }

    // Size filter
    if (filterDto.sizes && filterDto.sizes.length > 0) {
      queryBuilder.andWhere('variants.size IN (:...sizes)', { sizes: filterDto.sizes });
    }

    // Color filter
    if (filterDto.colors && filterDto.colors.length > 0) {
      queryBuilder.andWhere('variants.color IN (:...colors)', { colors: filterDto.colors });
    }

    // Pagination
    const offset = (filterDto.page - 1) * filterDto.limit;
    queryBuilder.skip(offset).take(filterDto.limit);

    const [products, total] = await queryBuilder.getManyAndCount();

    return { products, total };
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['category', 'variants', 'images', 'inventory'],
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async uploadImages(productId: number, files: Express.Multer.File[]): Promise<ProductImage[]> {
    const product = await this.findOne(productId);
    const images: ProductImage[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const image = this.imageRepository.create({
        product,
        filename: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        url: `/uploads/${file.filename}`,
        isPrimary: i === 0, // First image is primary
        sortOrder: i,
      });

      images.push(await this.imageRepository.save(image));
    }

    return images;
  }

  async searchProducts(query: string): Promise<Product[]> {
    return this.productRepository.find({
      where: [
        { name: Like(`%${query}%`) },
        { description: Like(`%${query}%`) },
        { sku: Like(`%${query}%`) },
      ],
      relations: ['category', 'variants', 'images', 'inventory'],
      take: 20,
    });
  }

  async getProductsByCategoryId(categoryId: number): Promise<Product[]> {
    return this.productRepository.find({
      where: { category: { id: categoryId } },
      relations: ['category', 'variants', 'images', 'inventory'],
    });
  }
}