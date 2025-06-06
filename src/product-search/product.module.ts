import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { Product } from "./entities/product.entity"
import { Category } from "./entities/category.entity"
import { SearchSuggestion } from "./entities/search-suggestion.entity"
import { RecentlyViewedProduct } from "./entities/recently-viewed.entity"
import { ProductSearchService } from "./services/product-search.service"
import { ProductSearchController } from "./controllers/product-search.controller"

@Module({
  imports: [TypeOrmModule.forFeature([Product, Category, SearchSuggestion, RecentlyViewedProduct])],
  controllers: [ProductSearchController],
  providers: [ProductSearchService],
  exports: [ProductSearchService],
})
export class ProductsModule {}
