import { redis } from './redis-client';

/**
 * Cache configuration
 */
export const CACHE_TTL = {
  SHORT: 300,        // 5 minutes
  MEDIUM: 1800,      // 30 minutes
  LONG: 3600,        // 1 hour
  VERY_LONG: 86400,  // 24 hours
};

/**
 * Cache result wrapper
 */
export interface CacheResult<T> {
  data: T | null;
  fromCache: boolean;
}

/**
 * Get or set cache
 */
export async function getOrSetCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl: number = CACHE_TTL.MEDIUM
): Promise<T> {
  try {
    // Try to get from cache
    if (redis.isConnected()) {
      const cached = await redis.get(key);

      if (cached) {
        console.log(`✅ Cache HIT: ${key}`);
        return JSON.parse(cached) as T;
      }

      console.log(`❌ Cache MISS: ${key}`);
    }

    // Fetch data
    const data = await fetchFn();

    // Set in cache
    if (redis.isConnected() && data !== null && data !== undefined) {
      await redis.set(key, JSON.stringify(data), ttl);
      console.log(`💾 Cache SET: ${key} (TTL: ${ttl}s)`);
    }

    return data;
  } catch (error) {
    console.error(`Cache error for ${key}:`, error);
    // Return fresh data on cache error
    return await fetchFn();
  }
}

/**
 * Get cached data
 */
export async function getCached<T>(key: string): Promise<CacheResult<T>> {
  try {
    if (!redis.isConnected()) {
      return { data: null, fromCache: false };
    }

    const cached = await redis.get(key);

    if (!cached) {
      return { data: null, fromCache: false };
    }

    return {
      data: JSON.parse(cached) as T,
      fromCache: true,
    };
  } catch (error) {
    console.error('Get cache error:', error);
    return { data: null, fromCache: false };
  }
}

/**
 * Set cached data
 */
export async function setCached<T>(
  key: string,
  data: T,
  ttl: number = CACHE_TTL.MEDIUM
): Promise<boolean> {
  try {
    if (!redis.isConnected()) {
      return false;
    }

    return await redis.set(key, JSON.stringify(data), ttl);
  } catch (error) {
    console.error('Set cache error:', error);
    return false;
  }
}

/**
 * Invalidate cache by key
 */
export async function invalidateCache(key: string): Promise<boolean> {
  try {
    if (!redis.isConnected()) {
      return false;
    }

    return await redis.del(key);
  } catch (error) {
    console.error('Invalidate cache error:', error);
    return false;
  }
}

/**
 * Invalidate cache by pattern
 */
export async function invalidateCachePattern(pattern: string): Promise<number> {
  try {
    if (!redis.isConnected()) {
      return 0;
    }

    return await redis.clearPattern(pattern);
  } catch (error) {
    console.error('Invalidate cache pattern error:', error);
    return 0;
  }
}

/**
 * Cache key generators
 */
export const CacheKeys = {
  products: (params?: string) => `products:${params || 'all'}`,
  product: (id: string) => `product:${id}`,
  homepage: () => 'homepage:data',
  services: () => 'services:all',
  categories: () => 'categories:all',
  search: (query: string) => `search:${query}`,
};
