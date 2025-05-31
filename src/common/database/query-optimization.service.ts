import { Pet } from '@/customer/pet/entities/pet.entity';
import { Injectable } from '@nestjs/common';
import { Repository, SelectQueryBuilder, ObjectLiteral } from 'typeorm';

@Injectable()
export class QueryOptimizationService {


  optimizeRelationsQuery<T extends ObjectLiteral>(
    queryBuilder: SelectQueryBuilder<T>,
    relations: string[],
    conditions?: Record<string, any>
  ): SelectQueryBuilder<T> {
    relations.forEach(relation => {
      const [parentAlias, relationName] = relation.split('.');
      if (relationName) {
        queryBuilder.leftJoinAndSelect(`${parentAlias}.${relationName}`, relationName);
      } else {
        queryBuilder.leftJoinAndSelect(`${queryBuilder.alias}.${relation}`, relation);
      }
    });

    if (conditions) {
      Object.entries(conditions).forEach(([key, value]) => {
        queryBuilder.andWhere(`${queryBuilder.alias}.${key} = :${key}`, { [key]: value });
      });
    }

    return queryBuilder;
  }


  async paginateQuery<T extends ObjectLiteral>(
    queryBuilder: SelectQueryBuilder<T>,
    page: number = 1,
    limit: number = 10
  ): Promise<{ data: T[]; total: number; totalPages: number }> {
    const offset = (page - 1) * limit;
    
    const countQuery = queryBuilder.clone();
    countQuery.select('COUNT(*)', 'count');
    
    const [data, countResult] = await Promise.all([
      queryBuilder.skip(offset).take(limit).getMany(),
      countQuery.getRawOne()
    ]);

    const total = parseInt(countResult.count);
    const totalPages = Math.ceil(total / limit);

    return { data, total, totalPages };
  }

  async batchInsert<T extends ObjectLiteral>(
    repository: Repository<T>,
    entities: Partial<T>[],
    batchSize: number = 1000
  ): Promise<void> {
    const batches = this.chunkArray(entities, batchSize);
    
    for (const batch of batches) {
      await repository.createQueryBuilder()
        .insert()
        .values(batch)
        .execute();
    }
  }

  createSearchQuery<T extends ObjectLiteral>(
    repository: Repository<T>,
    searchTerm: string,
    searchFields: string[]
  ): SelectQueryBuilder<T> {
    const queryBuilder = repository.createQueryBuilder('entity');
    
    if (searchTerm && searchFields.length > 0) {
      const searchConditions = searchFields
        .map(field => `LOWER(entity.${field}) LIKE LOWER(:searchTerm)`)
        .join(' OR ');
      
      queryBuilder.where(`(${searchConditions})`, {
        searchTerm: `%${searchTerm}%`
      });
    }

    return queryBuilder;
  }

  async streamQuery<T extends ObjectLiteral>(
    queryBuilder: SelectQueryBuilder<T>,
    callback: (entity: T) => Promise<void>
  ): Promise<void> {
    const stream = await queryBuilder.stream();

    stream.on('data', async (row) => {
      let plainRow: any = row;
      if (Buffer.isBuffer(row)) {
        plainRow = JSON.parse(row.toString('utf8'));
      } else if (typeof row === 'string') {
        plainRow = JSON.parse(row);
      }
      const entity = queryBuilder.connection.manager.create(queryBuilder.expressionMap.mainAlias!.target as any, plainRow) as T;
      return await callback(entity);
    });

    return new Promise((resolve, reject) => {
      stream.on('end', resolve);
      stream.on('error', reject);
    });
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}

@Injectable()
export class OptimizedPetService {
  constructor(
    @InjectRepository(Pet)
    private petRepository: Repository<Pet>,
    private queryOptimizer: QueryOptimizationService
  ) {}

  async findPetsWithOptimization(
    page: number,
    limit: number,
    searchTerm?: string
  ) {
    let queryBuilder = this.petRepository.createQueryBuilder('pet');

    if (searchTerm) {
      queryBuilder = this.queryOptimizer.createSearchQuery(
        this.petRepository,
        searchTerm,
        ['name', 'breed', 'description']
      );
    }

    queryBuilder = this.queryOptimizer.optimizeRelationsQuery(
      queryBuilder,
      ['owner', 'medicalRecords', 'medicalRecords.veterinarian']
    );

    return this.queryOptimizer.paginateQuery(queryBuilder, page, limit);
  }
}

function InjectRepository(Pet: any): (target: typeof OptimizedPetService, propertyKey: undefined, parameterIndex: 0) => void {
    throw new Error('Function not implemented.');
}
