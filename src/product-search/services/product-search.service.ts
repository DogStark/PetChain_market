import { Injectable, Logger } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository, SelectQueryBuilder } from "typeorm"
import type { Product } from "../entities/product.entity"
import type { Category } from "../entities/category.entity"
import type { SearchSuggestion } from "../entities/search-suggestion.entity"
import { RecentlyViewedProduct } from "../entities/recently-viewed.entity"
import { type SearchProductsDto, SortBy } from "../dto/search-products.dto"
import type { SearchResponseDto, ProductResponseDto } from "../dto/search-response.dto"
import type { GetSuggestionsDto, SearchSuggestionResponseDto } from "../dto/search-suggestions.dto"
import type { AddRecentlyViewedDto, GetRecentlyViewedDto } from "../dto/recently-viewed.dto"

@Injectable()
export class ProductSearchService {
  private readonly logger = new Logger(ProductSearchService.name);

  constructor(
    private readonly productRepository: Repository<Product>,
    private readonly categoryRepository: Repository<Category>,
    private readonly searchSuggestionRepository: Repository<SearchSuggestion>,
    private readonly searchSuggestionRepository: Repository<SearchSuggestion>,
    @InjectRepository(RecentlyViewedProduct)
    private readonly recentlyViewedRepository: Repository<RecentlyViewedProduct>,
  ) {}

  async searchProducts(searchDto: SearchProductsDto): Promise<SearchResponseDto> {
    const startTime = Date.now()

    try {
      // Build the main query
      const queryBuilder = this.buildSearchQuery(searchDto)

      // Get total count for pagination
      const totalQuery = queryBuilder.clone()
      const total = await totalQuery.getCount()

      // Apply pagination and get results
      const offset = (searchDto.page - 1) * searchDto.limit
      queryBuilder.skip(offset).take(searchDto.limit)

      const products = await queryBuilder.getMany()

      // Get filter aggregations
      const filters = await this.getFilterAggregations(searchDto)

      // Update search suggestions if there's a query
      if (searchDto.query) {
        await this.updateSearchSuggestion(searchDto.query, total)
      }

      const totalPages = Math.ceil(total / searchDto.limit)

      const response: SearchResponseDto = {
        products: products.map(this.mapProductToDto),
        total,
        page: searchDto.page,
        limit: searchDto.limit,
        total_pages: totalPages,
        has_next: searchDto.page < totalPages,
        has_previous: searchDto.page > 1,
        filters,
      }

      const duration = Date.now() - startTime
      this.logger.log(`Search completed in ${duration}ms. Query: "${searchDto.query}", Results: ${total}`)

      return response
    } catch (error) {
      this.logger.error("Search failed", error.stack)
      throw error
    }
  }

  private buildSearchQuery(searchDto: SearchProductsDto): SelectQueryBuilder<Product> {
    let queryBuilder = this.productRepository
      .createQueryBuilder("product")
      .leftJoinAndSelect("product.category", "category")

    // Full-text search
    if (searchDto.query) {
      const searchQuery = searchDto.query.trim()

      // Use PostgreSQL full-text search with ranking
      queryBuilder = queryBuilder
        .addSelect(`ts_rank(product.search_vector, plainto_tsquery('english', :searchQuery))`, "search_rank")
        .where(
          `product.search_vector @@ plainto_tsquery('english', :searchQuery) 
           OR product.name ILIKE :likeQuery 
           OR product.description ILIKE :likeQuery 
           OR product.brand ILIKE :likeQuery`,
          {
            searchQuery,
            likeQuery: `%${searchQuery}%`,
          },
        )
    }

    // Category filter
    if (searchDto.categories?.length) {
      queryBuilder = queryBuilder.andWhere("category.id IN (:...categories)", {
        categories: searchDto.categories,
      })
    }

    // Brand filter
    if (searchDto.brands?.length) {
      queryBuilder = queryBuilder.andWhere("product.brand IN (:...brands)", {
        brands: searchDto.brands,
      })
    }

    // Price range filter
    if (searchDto.min_price !== undefined) {
      queryBuilder = queryBuilder.andWhere("product.price >= :minPrice", {
        minPrice: searchDto.min_price,
      })
    }
    if (searchDto.max_price !== undefined) {
      queryBuilder = queryBuilder.andWhere("product.price <= :maxPrice", {
        maxPrice: searchDto.max_price,
      })
    }

    // Rating filter
    if (searchDto.min_rating !== undefined) {
      queryBuilder = queryBuilder.andWhere("product.rating >= :minRating", {
        minRating: searchDto.min_rating,
      })
    }

    // Tags filter
    if (searchDto.tags?.length) {
      queryBuilder = queryBuilder.andWhere("product.tags && :tags", {
        tags: searchDto.tags,
      })
    }

    // Status filter
    if (searchDto.status) {
      queryBuilder = queryBuilder.andWhere("product.status = :status", {
        status: searchDto.status,
      })
    }

    // Apply sorting
    queryBuilder = this.applySorting(queryBuilder, searchDto)

    return queryBuilder
  }

  private applySorting(
    queryBuilder: SelectQueryBuilder<Product>,
    searchDto: SearchProductsDto,
  ): SelectQueryBuilder<Product> {
    switch (searchDto.sort_by) {
      case SortBy.RELEVANCE:
        if (searchDto.query) {
          queryBuilder = queryBuilder.orderBy("search_rank", "DESC")
        } else {
          queryBuilder = queryBuilder.orderBy("product.created_at", "DESC")
        }
        break
      case SortBy.PRICE_ASC:
        queryBuilder = queryBuilder.orderBy("product.price", "ASC")
        break
      case SortBy.PRICE_DESC:
        queryBuilder = queryBuilder.orderBy("product.price", "DESC")
        break
      case SortBy.NAME_ASC:
        queryBuilder = queryBuilder.orderBy("product.name", "ASC")
        break
      case SortBy.NAME_DESC:
        queryBuilder = queryBuilder.orderBy("product.name", "DESC")
        break
      case SortBy.RATING_DESC:
        queryBuilder = queryBuilder.orderBy("product.rating", "DESC")
        break
      case SortBy.NEWEST:
        queryBuilder = queryBuilder.orderBy("product.created_at", "DESC")
        break
      case SortBy.OLDEST:
        queryBuilder = queryBuilder.orderBy("product.created_at", "ASC")
        break
      default:
        queryBuilder = queryBuilder.orderBy("product.created_at", "DESC")
    }

    return queryBuilder
  }

  private async getFilterAggregations(searchDto: SearchProductsDto) {
    const baseQuery = this.buildSearchQuery({ ...searchDto, categories: undefined, brands: undefined })

    // Get category aggregations
    const categoryAggregation = await baseQuery
      .clone()
      .select("category.id", "category_id")
      .addSelect("category.name", "category_name")
      .addSelect("COUNT(*)", "count")
      .groupBy("category.id, category.name")
      .getRawMany()

    // Get brand aggregations
    const brandAggregation = await baseQuery
      .clone()
      .select("product.brand", "brand")
      .addSelect("COUNT(*)", "count")
      .groupBy("product.brand")
      .getRawMany()

    // Get price range
    const priceRange = await baseQuery
      .clone()
      .select("MIN(product.price)", "min")
      .addSelect("MAX(product.price)", "max")
      .getRawOne()

    // Get rating distribution
    const ratingDistribution = await baseQuery
      .clone()
      .select("FLOOR(product.rating)", "rating")
      .addSelect("COUNT(*)", "count")
      .where("product.rating > 0")
      .groupBy("FLOOR(product.rating)")
      .orderBy("rating", "DESC")
      .getRawMany()

    return {
      categories: categoryAggregation.map((item) => ({
        id: item.category_id,
        name: item.category_name,
        count: Number.parseInt(item.count),
      })),
      brands: brandAggregation.map((item) => ({
        name: item.brand,
        count: Number.parseInt(item.count),
      })),
      price_range: {
        min: Number.parseFloat(priceRange?.min || "0"),
        max: Number.parseFloat(priceRange?.max || "0"),
      },
      rating_distribution: ratingDistribution.map((item) => ({
        rating: Number.parseInt(item.rating),
        count: Number.parseInt(item.count),
      })),
    }
  }

  private mapProductToDto(product: Product): ProductResponseDto {
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      brand: product.brand,
      category_id: product.category_id,
      image_url: product.image_url,
      status: product.status,
      stock_quantity: product.stock_quantity,
      sku: product.sku,
      rating: product.rating,
      review_count: product.review_count,
      tags: product.tags,
      created_at: product.created_at,
      updated_at: product.updated_at,
      category: product.category
        ? {
            id: product.category.id,
            name: product.category.name,
            slug: product.category.slug,
          }
        : undefined,
    }
  }

  async getSearchSuggestions(dto: GetSuggestionsDto): Promise<SearchSuggestionResponseDto[]> {
    const suggestions = await this.searchSuggestionRepository
      .createQueryBuilder("suggestion")
      .where("suggestion.query ILIKE :query", { query: `${dto.query}%` })
      .orderBy("suggestion.search_count", "DESC")
      .addOrderBy("suggestion.result_count", "DESC")
      .limit(dto.limit)
      .getMany()

    return suggestions.map((suggestion) => ({
      query: suggestion.query,
      search_count: suggestion.search_count,
      result_count: suggestion.result_count,
    }))
  }

  private async updateSearchSuggestion(query: string, resultCount: number): Promise<void> {
    try {
      const normalizedQuery = query.toLowerCase().trim()

      const existingSuggestion = await this.searchSuggestionRepository.findOne({
        where: { query: normalizedQuery },
      })

      if (existingSuggestion) {
        existingSuggestion.search_count += 1
        existingSuggestion.result_count = resultCount
        await this.searchSuggestionRepository.save(existingSuggestion)
      } else {
        const newSuggestion = this.searchSuggestionRepository.create({
          query: normalizedQuery,
          search_count: 1,
          result_count: resultCount,
        })
        await this.searchSuggestionRepository.save(newSuggestion)
      }
    } catch (error) {
      this.logger.error("Failed to update search suggestion", error.stack)
    }
  }

  async addRecentlyViewed(dto: AddRecentlyViewedDto): Promise<void> {
    try {
      // Remove existing entry for this user-product combination
      await this.recentlyViewedRepository.delete({
        user_id: dto.user_id,
        product_id: dto.product_id,
      })

      // Add new entry
      const recentlyViewed = this.recentlyViewedRepository.create({
        user_id: dto.user_id,
        product_id: dto.product_id,
      })

      await this.recentlyViewedRepository.save(recentlyViewed)

      // Keep only the latest 50 entries per user
      const userEntries = await this.recentlyViewedRepository
        .createQueryBuilder("rv")
        .where("rv.user_id = :userId", { userId: dto.user_id })
        .orderBy("rv.viewed_at", "DESC")
        .skip(50)
        .getMany()

      if (userEntries.length > 0) {
        const idsToDelete = userEntries.map((entry) => entry.id)
        await this.recentlyViewedRepository.delete(idsToDelete)
      }
    } catch (error) {
      this.logger.error("Failed to add recently viewed product", error.stack)
      throw error
    }
  }

  async getRecentlyViewed(dto: GetRecentlyViewedDto): Promise<ProductResponseDto[]> {
    const recentlyViewed = await this.recentlyViewedRepository
      .createQueryBuilder("rv")
      .leftJoinAndSelect("rv.product", "product")
      .leftJoinAndSelect("product.category", "category")
      .where("rv.user_id = :userId", { userId: dto.user_id })
      .orderBy("rv.viewed_at", "DESC")
      .limit(dto.limit)
      .getMany()

    return recentlyViewed.map((rv) => this.mapProductToDto(rv.product))
  }
}
