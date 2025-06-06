export class ProductResponseDto {
  id: string
  name: string
  description: string
  price: number
  brand: string
  category_id: string
  image_url: string
  status: string
  stock_quantity: number
  sku: string
  rating: number
  review_count: number
  tags: string[]
  created_at: Date
  updated_at: Date
  category?: {
    id: string
    name: string
    slug: string
  }
}

export class SearchResponseDto {
  products: ProductResponseDto[]
  total: number
  page: number
  limit: number
  total_pages: number
  has_next: boolean
  has_previous: boolean
  filters: {
    categories: Array<{ id: string; name: string; count: number }>
    brands: Array<{ name: string; count: number }>
    price_range: { min: number; max: number }
    rating_distribution: Array<{ rating: number; count: number }>
  }
}
