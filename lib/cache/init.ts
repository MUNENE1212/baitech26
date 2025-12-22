/**
 * Redis initialization
 * This file initializes the Redis connection for caching
 */

import { initializeRedis } from './redis-client';

let redisInitialized = false;

export async function ensureRedisInitialized() {
  if (!redisInitialized) {
    try {
      await initializeRedis();
      redisInitialized = true;
      console.log('✅ Redis initialized successfully');
    } catch (error) {
      console.error('❌ Redis initialization failed:', error);
      // Don't throw error - app should work without Redis
    }
  }
  return redisInitialized;
}

// Auto-initialize in server context
if (typeof window === 'undefined') {
  ensureRedisInitialized().catch(console.error);
}
