import { RedisClientType } from 'redis';
import { getRedisClient, CACHE_KEYS } from '../database/connection';

export class CacheService {
  private redisClient: RedisClientType | null = null;
  private defaultTTL = 3600; // 1 hour

  constructor() {
    this.initializeRedis();
  }

  private redisAvailable = false;
  private redisInitializationAttempted = false;

  private async initializeRedis() {
    if (this.redisInitializationAttempted) {
      return;
    }

    this.redisInitializationAttempted = true;

    try {
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Redis connection timeout')), 3000);
      });

      this.redisClient = await Promise.race([
        getRedisClient(),
        timeoutPromise
      ]) as RedisClientType | null;

      this.redisAvailable = true;
      console.log('✅ Redis connected successfully');
    } catch (error) {
      console.warn('⚠️  Redis not available, caching disabled (this is normal if Redis is not running)');
      console.log('💡 To enable caching: Start Redis server or disable Redis in config');
      this.redisAvailable = false;
      this.redisClient = null;
    }
  }

  private async isRedisAvailable(): Promise<boolean> {
    if (!this.redisInitializationAttempted) {
      await this.initializeRedis();
    }

    return !!this.redisAvailable &&
           !!this.redisClient &&
           !!this.redisClient?.isOpen;
  }

  /**
   * Get cached value
   */
  async get<T>(key: string): Promise<T | null> {
    if (!(await this.isRedisAvailable())) {
      return null;
    }

    try {
      const value = await this.redisClient!.get(key);
      if (!value || value === '{}' || typeof value !== 'string') return null;
      return JSON.parse(value);
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Set cached value with optional TTL
   */
  async set(key: string, value: unknown, ttl?: number): Promise<boolean> {
    if (!(await this.isRedisAvailable())) {
      return false;
    }

    try {
      const serializedValue = JSON.stringify(value);
      const finalTTL = ttl || this.defaultTTL;
      await this.redisClient!.setEx(key, finalTTL, serializedValue);
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  /**
   * Delete cached value
   */
  async delete(key: string): Promise<boolean> {
    if (!(await this.isRedisAvailable())) {
      return false;
    }

    try {
      await this.redisClient!.del(key);
      return true;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

  /**
   * Clear cache by pattern
   */
  async clearPattern(pattern: string): Promise<boolean> {
    if (!(await this.isRedisAvailable())) {
      return false;
    }

    try {
      const keys = await this.redisClient!.keys(pattern);
      if (keys.length > 0) {
        await this.redisClient!.del(keys);
      }
      return true;
    } catch (error) {
      console.error('Cache clear pattern error:', error);
      return false;
    }
  }

  /**
   * Cache a database query result
   */
  async memoize<T>(
    key: string,
    queryFn: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    // Try to get from cache first
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Execute query and cache result
    const result = await queryFn();
    await this.set(key, result, ttl);
    return result;
  }

  /**
   * Invalidate multiple related cache keys
   */
  async invalidateRelatedCache(resources: string[]): Promise<void> {
    const patterns = [
      ...resources.map(r => `${r}:*`),
      ...resources.map(r => `*:${r}`),
    ];

    for (const pattern of patterns) {
      await this.clearPattern(pattern);
    }
  }

  // Specific cache methods for different data types

  /**
   * Cache products with search filters
   */
  async cacheProducts(
    filters: Record<string, unknown>,
    products: unknown[],
    ttl: number = 1800 // 30 minutes
  ): Promise<void> {
    const filterKey = JSON.stringify(filters);
    const key = `${CACHE_KEYS.PRODUCTS}:${Buffer.from(filterKey).toString('base64')}`;
    await this.set(key, products, ttl);
  }

  /**
   * Get cached products with filters
   */
  async getCachedProducts(filters: Record<string, unknown>): Promise<unknown[] | null> {
    const filterKey = JSON.stringify(filters);
    const key = `${CACHE_KEYS.PRODUCTS}:${Buffer.from(filterKey).toString('base64')}`;
    return await this.get<unknown[]>(key);
  }

  /**
   * Cache homepage data
   */
  async cacheHomepageData(data: unknown, ttl: number = 3600): Promise<void> {
    await this.set(CACHE_KEYS.HOMEPAGE_DATA, data, ttl);
  }

  /**
   * Get cached homepage data
   */
  async getCachedHomepageData(): Promise<unknown | null> {
    return await this.get(CACHE_KEYS.HOMEPAGE_DATA);
  }

  /**
   * Cache product details
   */
  async cacheProduct(id: string, product: unknown, ttl: number = 3600): Promise<void> {
    await this.set(CACHE_KEYS.PRODUCT(id), product, ttl);
  }

  /**
   * Get cached product details
   */
  async getCachedProduct(id: string): Promise<unknown | null> {
    return await this.get(CACHE_KEYS.PRODUCT(id));
  }

  /**
   * Cache user data
   */
  async cacheUser(id: string, user: unknown, ttl: number = 1800): Promise<void> {
    await this.set(CACHE_KEYS.USER(id), user, ttl);
  }

  /**
   * Get cached user data
   */
  async getCachedUser(id: string): Promise<unknown | null> {
    return await this.get(CACHE_KEYS.USER(id));
  }

  /**
   * Cache service offerings
   */
  async cacheServicesOffered(services: unknown[], ttl: number = 3600): Promise<void> {
    await this.set(CACHE_KEYS.SERVICES_OFFERED, services, ttl);
  }

  /**
   * Get cached service offerings
   */
  async getCachedServicesOffered(): Promise<unknown[] | null> {
    return await this.get(CACHE_KEYS.SERVICES_OFFERED);
  }

  /**
   * Cache technicians data
   */
  async cacheTechnicians(technicians: unknown[], ttl: number = 1800): Promise<void> {
    await this.set(CACHE_KEYS.TECHNICIANS, technicians, ttl);
  }

  /**
   * Get cached technicians data
   */
  async getCachedTechnicians(): Promise<unknown[] | null> {
    return await this.get(CACHE_KEYS.TECHNICIANS);
  }

  /**
   * Cache featured products
   */
  async cacheFeaturedProducts(products: unknown[], ttl: number = 1800): Promise<void> {
    await this.set(CACHE_KEYS.FEATURED_PRODUCTS, products, ttl);
  }

  /**
   * Get cached featured products
   */
  async getCachedFeaturedProducts(): Promise<unknown[] | null> {
    return await this.get(CACHE_KEYS.FEATURED_PRODUCTS);
  }

  /**
   * Invalidate product-related caches
   */
  async invalidateProductCaches(productId?: string): Promise<void> {
    const patterns = [
      `${CACHE_KEYS.PRODUCTS}:*`,
      CACHE_KEYS.FEATURED_PRODUCTS,
      CACHE_KEYS.HOMEPAGE_DATA,
      `${CACHE_KEYS.REVIEWS}:product:*`,
    ];

    if (productId) {
      patterns.push(CACHE_KEYS.PRODUCT(productId));
    }

    for (const pattern of patterns) {
      if (pattern.includes(':*')) {
        await this.clearPattern(pattern);
      } else {
        await this.delete(pattern);
      }
    }
  }

  /**
   * Invalidate user-related caches
   */
  async invalidateUserCaches(userId: string): Promise<void> {
    await this.delete(CACHE_KEYS.USER(userId));
    await this.clearPattern(`${CACHE_KEYS.REVIEWS}:*`);
  }

  /**
   * Invalidate service-related caches
   */
  async invalidateServiceCaches(): Promise<void> {
    await this.delete(CACHE_KEYS.SERVICES_OFFERED);
    await this.delete(CACHE_KEYS.HOMEPAGE_DATA);
  }

  /**
   * Health check for cache
   */
  async healthCheck(): Promise<{ available: boolean; latency?: number }> {
    if (!(await this.isRedisAvailable())) {
      return { available: false };
    }

    try {
      const start = Date.now();
      await this.redisClient!.ping();
      const latency = Date.now() - start;
      return { available: true, latency };
    } catch (error) {
      return { available: false };
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{ keys: number; memoryUsage: string }> {
    if (!(await this.isRedisAvailable())) {
      return { keys: 0, memoryUsage: '0B' };
    }

    try {
      const keys = await this.redisClient!.dbSize();
      const memory = await this.redisClient!.info('memory');
      const memoryLine = memory.split('\n').find(line => line.startsWith('used_memory_human:'));
      const memoryUsage = memoryLine ? memoryLine.split(':')[1] : '0B';

      return { keys, memoryUsage };
    } catch (error) {
      return { keys: 0, memoryUsage: '0B' };
    }
  }
}

// Export singleton instance
export const cacheService = new CacheService();