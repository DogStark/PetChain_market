import { InventoryItem } from '@/inventory/entities/inventory-item.entity';
import { Injectable, SetMetadata } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DatabaseOptimizationService } from '../services/database-optimization.service';

export const INDEX_HINT_METADATA = 'index:hint';

export interface IndexHint {
  table: string;
  columns: string[];
  type?: 'btree' | 'hash' | 'gin' | 'gist';
  where?: string;
}

export const IndexHint = (hint: IndexHint) => SetMetadata(INDEX_HINT_METADATA, hint);

@Injectable()
export class OptimizedInventoryService {
  constructor(
    @InjectRepository(InventoryItem)
    private inventoryRepository: Repository<InventoryItem>,
    private dbOptimization: DatabaseOptimizationService
  ) {}

  @IndexHint({
    table: 'inventory_items',
    columns: ['category', 'currentStock'],
    type: 'btree'
  })
  async findLowStockItems(category?: string): Promise<InventoryItem[]> {
    let queryBuilder = this.inventoryRepository
      .createQueryBuilder('item')
      .where('item.currentStock <= item.minThreshold');

    if (category) {
      queryBuilder = queryBuilder.andWhere('item.category = :category', { category });
    }

    const query = queryBuilder.getQuery();
    const params = queryBuilder.getParameters();
    
    const analysis = await this.dbOptimization.analyzeQuery(query, Object.values(params));
    if (analysis.estimatedCost > 1000) {
      console.warn('High-cost query detected:', analysis.suggestions);
    }

    return queryBuilder.getMany();
  }
}