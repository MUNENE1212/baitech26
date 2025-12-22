#!/usr/bin/env node

/**
 * Clear Redis cache script
 * Clears all cached data from Redis
 */

import { getRedisClient, connectRedis } from '../lib/database/connection';
import { cacheService } from '../lib/cache/cache';

async function clearCache() {
  try {
    console.log('🧹 Starting cache cleanup...');

    const redis = await getRedisClient();

    if (!redis) {
      console.log('⚠️  Redis not available, nothing to clear');
      return;
    }

    // Get all cache keys
    const keys = await redis.keys('*');

    if (keys.length === 0) {
      console.log('✅ Cache is already empty');
      return;
    }

    console.log(`📊 Found ${keys.length} cache keys`);

    // Clear all keys
    await redis.del(keys);

    console.log('✅ Cache cleared successfully!');

    // Show cache statistics
    const stats = await cacheService.getStats();
    console.log('\n📈 Cache Statistics:');
    console.log(`  • Keys: ${stats.keys}`);
    console.log(`  • Memory Usage: ${stats.memoryUsage}`);

  } catch (error) {
    console.error('❌ Failed to clear cache:', error);
    process.exit(1);
  }
}

// Run cache clear if this file is executed directly
if (require.main === module) {
  clearCache();
}

export { clearCache };