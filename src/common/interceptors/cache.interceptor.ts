import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Controller,
  UseInterceptors,
  Get,
  Query,
  Param,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CacheService } from '../cache/cache.service';
import { CACHE_KEY_METADATA, CACHE_TTL_METADATA, CacheKey, CacheTTL } from '../decorators/cache.decorator';
import { PetService } from '@/pets/pet.service';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(
    private cacheService: CacheService,
    private reflector: Reflector,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const cacheKey = this.reflector.get<string>(
      CACHE_KEY_METADATA,
      context.getHandler(),
    );
    
    const cacheTTL = this.reflector.get<number>(
      CACHE_TTL_METADATA,
      context.getHandler(),
    );

    if (!cacheKey) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const dynamicKey = this.generateCacheKey(cacheKey, request);

    const cachedValue = await this.cacheService.get(dynamicKey);
    if (cachedValue !== null) {
      return of(cachedValue);
    }

    return next.handle().pipe(
      tap(async (response) => {
        await this.cacheService.set(dynamicKey, response, cacheTTL);
      }),
    );
  }

  private generateCacheKey(baseKey: string, request: any): string {
    const { params, query, user } = request;
    const keyParts = [baseKey];

    if (params) {
      keyParts.push(JSON.stringify(params));
    }
    if (query) {
      keyParts.push(JSON.stringify(query));
    }
    if (user?.id) {
      keyParts.push(`user:${user.id}`);
    }

    return keyParts.join(':');
  }
}

@Controller('pets')
@UseInterceptors(CacheInterceptor)
export class PetController {
  constructor(private petService: PetService) {}

  @Get()
  @CacheKey('pets:list')
  @CacheTTL(300) 
  async findAll(@Query() query: any) {
    return this.petService.findAll(query);
  }

  @Get(':id')
  @CacheKey('pets:detail')
  @CacheTTL(600) 
  async findOne(@Param('id') id: string) {
    return this.petService.findOne(id);
  }
}