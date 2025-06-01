import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pet } from '../entities/pet.entity';
import { LazyLoadingService } from '../../common/services/lazy-loading.service';
import { CacheService } from '../../common/cache/cache.service';

@Injectable()
export class PetService {
  constructor(
    @InjectRepository(Pet)
    private petRepository: Repository<Pet>,
    private lazyLoadingService: LazyLoadingService,
    private cacheService: CacheService,
  ) {}

  async findOne(id: string, loadRelations: string[] = []): Promise<Pet> {
    const cacheKey = `pet:${id}:${loadRelations.join(',')}`;
    
    const cached = await this.cacheService.get<Pet>(cacheKey);
    if (cached) return cached;

    const pet = await this.petRepository.findOne({ where: { id } });
    if (!pet) {
      throw new NotFoundException(`Pet with ID ${id} not found`);
    }

    const petWithRelations = loadRelations.length > 0
      ? await this.lazyLoadingService.loadRelations(pet, this.petRepository, loadRelations)
      : pet;

    await this.cacheService.set(cacheKey, petWithRelations, 300);

    return petWithRelations;
  }

  async findManyWithSmartLoading(
    options: {
      page?: number;
      limit?: number;
      ownerId?: string;
      relations?: string[];
    } = {}
  ): Promise<{ data: Pet[]; total: number; hasMore: boolean }> {
    const { page = 1, limit = 20, ownerId, relations = [] } = options;
    
    let queryBuilder = this.petRepository.createQueryBuilder('pet');

    if (ownerId) {
      queryBuilder = queryBuilder.where('pet.ownerId = :ownerId', { ownerId });
    }

    const [pets, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const petsWithRelations = await this.lazyLoadingService.smartLoad(
      pets,
      this.petRepository,
      { relations }
    );

    return {
      data: petsWithRelations,
      total,
      hasMore: page * limit < total
    };
  }

  async findPetsWithOwners(cursor?: string, limit: number = 20): Promise<{
    data: Array<Pet & { owner: any }>;
    nextCursor?: string;
    hasMore: boolean;
  }> {
    const result = await this.lazyLoadingService.paginatedLazyLoad(
      this.petRepository,
      cursor,
      limit,
      [] 
    );

    await this.lazyLoadingService.batchLoadRelations(
      result.data,
      [{
        property: 'owner',
        repository: this.petRepository.manager.getRepository('User'),
        foreignKey: 'ownerId',
        select: ['id', 'name', 'email'] 
      }]
    );

    return result as any;
  }
}