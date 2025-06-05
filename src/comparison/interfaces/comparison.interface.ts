export interface ComparisonResult {
  products: ProductComparison[];
  summary: ComparisonSummary;
}

export interface ProductComparison {
  id: string;
  name: string;
  price: number;
  averageRating: number;
  reviewCount: number;
  category: string;
  brand: string;
  specifications: Record<string, any>;
  images: string[];
  inventory?: {
    availableQuantity: number;
    isInStock: boolean;
  };
}

export interface ComparisonSummary {
  cheapest: string;
  mostExpensive: string;
  highestRated: string;
  mostReviewed: string;
  commonSpecs: string[];
  differingSpecs: string[];
}
