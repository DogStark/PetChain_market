import { Injectable, Logger } from '@nestjs/common';
import { ObjectLiteral, Repository } from 'typeorm';

interface LazyLoadOptions {
  relations?: string[];
  where?: Record<string, any>;
  order?: Record<string, 'ASC' | 'DESC'>;
  take?: number;
  skip?: number;
}

@Injectable()
export class LazyLoadingService {
  private readonly logger = new Logger(LazyLoadingService.name);
  private loadedRelations = new Map<string, Set<string>>();

  async loadRelations<T extends ObjectLiteral>(
    entity: T,
    repository: Repository<T>,
    relations: string[]
  ): Promise<T> {
    const entityId = (entity as any).id;
    const entityKey = `${repository.metadata.name}:${entityId}`;
    
    if (!this.loadedRelations.has(entityKey)) {
      this.loadedRelations.set(entityKey, new Set());
    }
    
    const loadedSet = this.loadedRelations.get(entityKey);
    const unloadedRelations = relations.filter(rel => !(loadedSet ?? new Set()).has(rel));
    
    if (unloadedRelations.length === 0) {
      return entity;
    }

    let queryBuilder = repository
      .createQueryBuilder('entity')
      .where('entity.id = :id', { id: entityId });

    unloadedRelations.forEach(rel => {
      queryBuilder = queryBuilder.leftJoinAndSelect(`entity.${rel}`, rel);
    });

    const loadedEntity = await queryBuilder.getOne();

    unloadedRelations.forEach(rel => loadedSet!.add(rel));
    
    this.logger.debug(`Loaded relations [${unloadedRelations.join(', ')}] for ${entityKey}`);
    
    return loadedEntity || entity;
  }

  async smartLoad<T extends ObjectLiteral>(
    entities: T[],
    repository: Repository<T>,
    options: LazyLoadOptions = {}
  ): Promise<T[]> {
    if (!entities.length) return entities;

    const { relations = [], where, order, take, skip } = options;
    
    const neededRelations = this.analyzeRelationUsage(entities, relations);
    
    if (neededRelations.length === 0) {
      return entities;
    }

    const entityIds = entities.map((entity: any) => entity.id);
    
    let queryBuilder = repository
      .createQueryBuilder('entity')
      .whereInIds(entityIds);

    neededRelations.forEach(relation => {
      queryBuilder = queryBuilder.leftJoinAndSelect(`entity.${relation}`, relation);
    });

    if (where) {
      Object.entries(where).forEach(([key, value]) => {
        queryBuilder = queryBuilder.andWhere(`entity.${key} = :${key}`, { [key]: value });
      });
    }

    if (order) {
      Object.entries(order).forEach(([key, direction]) => {
        queryBuilder = queryBuilder.addOrderBy(`entity.${key}`, direction);
      });
    }

    if (take) queryBuilder = queryBuilder.take(take);
    if (skip) queryBuilder = queryBuilder.skip(skip);

    return queryBuilder.getMany();
  }


  async batchLoadRelations<T>(
    entities: T[],
    relationConfig: Array<{
      property: string;
      repository: Repository<any>;
      foreignKey: string;
      select?: string[];
    }>
  ): Promise<void> {
    for (const config of relationConfig) {
      const { property, repository, foreignKey, select } = config;
      
      const foreignKeys = entities
        .map((entity: any) => entity[foreignKey])
        .filter(Boolean);

      if (foreignKeys.length === 0) continue;

      let queryBuilder = repository
        .createQueryBuilder('relation')
        .whereInIds(foreignKeys);

      if (select) {
        queryBuilder = queryBuilder.select(select.map(field => `relation.${field}`));
      }

      const relatedEntities = await queryBuilder.getMany();
      const relatedMap = new Map(
        relatedEntities.map((entity: any) => [entity.id, entity])
      );

      entities.forEach((entity: any) => {
        const fkValue = entity[foreignKey];
        if (fkValue && relatedMap.has(fkValue)) {
          entity[property] = relatedMap.get(fkValue);
        }
      });
    }
  }

  async paginatedLazyLoad<T extends ObjectLiteral>(
    repository: Repository<T>,
    cursor?: string,
    limit: number = 20,
    relations: string[] = []
  ): Promise<{
    data: T[];
    nextCursor?: string;
    hasMore: boolean;
  }> {
    let queryBuilder = repository.createQueryBuilder('entity');

    if (cursor) {
      queryBuilder = queryBuilder.where('entity.id > :cursor', { cursor });
    }

    relations.forEach(relation => {
      queryBuilder = queryBuilder.leftJoinAndSelect(`entity.${relation}`, relation);
    });

    const entities = await queryBuilder
      .orderBy('entity.id', 'ASC')
      .take(limit + 1) 
      .getMany();

    const hasMore = entities.length > limit;
    const data = hasMore ? entities.slice(0, -1) : entities;
    const nextCursor = hasMore ? (entities[entities.length - 2] as any).id : undefined;

    return { data, nextCursor, hasMore };
  }

  private analyzeRelationUsage<T>(entities: T[], requestedRelations: string[]): string[] {
    if (entities.length <= 5) {
      return requestedRelations;
    }

    const priorityRelations = ['owner', 'user', 'author']; // Adjust based on your domain
    return requestedRelations.filter(rel => 
      priorityRelations.some(priority => rel.includes(priority))
    );
  }

  clearCache(entityKey?: string): void {
    if (entityKey) {
      this.loadedRelations.delete(entityKey);
    } else {
      this.loadedRelations.clear();
    }
  }
}