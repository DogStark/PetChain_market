import { Injectable, Inject, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.cacheManager.get<T>(key);
      this.logger.debug(`Cache ${value ? 'HIT' : 'MISS'} for key: ${key}`);
      return value;
    } catch (error) {
      this.logger.error(`Cache GET error for key ${key}:`, error);
      return null;
    }
  }


  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      await this.cacheManager.set(key, value, ttl);
      this.logger.debug(`Cache SET for key: ${key}`);
    } catch (error) {
      this.logger.error(`Cache SET error for key ${key}:`, error);
    }
  }

  
  async del(key: string): Promise<void> {
    try {
      await this.cacheManager.del(key);
      this.logger.debug(`Cache DELETE for key: ${key}`);
    } catch (error) {
      this.logger.error(`Cache DELETE error for key ${key}:`, error);
    }
  }

  async delByPattern(pattern: string): Promise<void> {
    try {
      const keys = await (this.cacheManager as any).store.keys(pattern);
      if (keys.length > 0) {
        await Promise.all(keys.map((key: any) => this.cacheManager.del(key)));
        this.logger.debug(`Cleared ${keys.length} keys matching pattern: ${pattern}`);
      }
    } catch (error) {
      this.logger.error(`Cache pattern delete error for pattern ${pattern}:`, error);
    }
  }
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    let value = await this.get<T>(key);
    
    if (value === null) {
      value = await factory();
      await this.set(key, value, ttl);
    }
    
    return value;
  }

  async cacheWithInvalidation<T>(
    key: string,
    factory: () => Promise<T>,
    invalidationKeys: string[],
    ttl?: number
  ): Promise<T> {
    const value = await this.getOrSet(key, factory, ttl);
    
    for (const invalidationKey of invalidationKeys) {
      const mappingKey = `invalidation:${invalidationKey}`;
      const existingKeys = await this.get<string[]>(mappingKey) || [];
      if (!existingKeys.includes(key)) {
        await this.set(mappingKey, [...existingKeys, key], ttl);
      }
    }
    
    return value;
  }

  async invalidateByKey(invalidationKey: string): Promise<void> {
    const mappingKey = `invalidation:${invalidationKey}`;
    const keysToInvalidate = await this.get<string[]>(mappingKey);
    
    if (keysToInvalidate) {
      await Promise.all([
        ...keysToInvalidate.map(key => this.del(key)),
        this.del(mappingKey)
      ]);
    }
  }
}