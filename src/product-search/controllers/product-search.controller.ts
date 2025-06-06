import { Controller, Get, Post, Query, Body, ValidationPipe, UsePipes, HttpCode, HttpStatus } from "@nestjs/common"
import type { ProductSearchService } from "../services/product-search.service"
import type { SearchProductsDto } from "../dto/search-products.dto"
import type { SearchResponseDto } from "../dto/search-response.dto"
import type { GetSuggestionsDto, SearchSuggestionResponseDto } from "../dto/search-suggestions.dto"
import type { AddRecentlyViewedDto, GetRecentlyViewedDto } from "../dto/recently-viewed.dto"

@Controller("products")
export class ProductSearchController {
  constructor(private readonly productSearchService: ProductSearchService) {}

  @Get('search')
  @UsePipes(new ValidationPipe({ transform: true }))
  async searchProducts(@Query() searchDto: SearchProductsDto): Promise<SearchResponseDto> {
    return this.productSearchService.searchProducts(searchDto);
  }

  @Get('search/suggestions')
  @UsePipes(new ValidationPipe({ transform: true }))
  async getSearchSuggestions(
    @Query() dto: GetSuggestionsDto,
  ): Promise<SearchSuggestionResponseDto[]> {
    return this.productSearchService.getSearchSuggestions(dto);
  }

  @Post('recently-viewed')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe())
  async addRecentlyViewed(@Body() dto: AddRecentlyViewedDto): Promise<{ message: string }> {
    await this.productSearchService.addRecentlyViewed(dto);
    return { message: 'Product added to recently viewed' };
  }

  @Get('recently-viewed')
  @UsePipes(new ValidationPipe({ transform: true }))
  async getRecentlyViewed(@Query() dto: GetRecentlyViewedDto) {
    return this.productSearchService.getRecentlyViewed(dto);
  }
}
