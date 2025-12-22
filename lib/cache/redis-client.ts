import { createClient, RedisClientType } from 'redis';

// Redis client with authentication and security
class RedisManager {
  private client: RedisClientType | null = null;
  private isConnected: boolean = false;

  async connect(): Promise<void> {
    try {
      // Use environment variables with secure configuration
      const redisUrl = process.env.REDIS_URL || process.env.REDIS_URI;

      if (!redisUrl) {
        console.warn('Redis URL not provided, caching will be disabled');
        return;
      }

      // Validate Redis URL format
      if (!redisUrl.startsWith('redis://') && !redisUrl.startsWith('rediss://')) {
        throw new Error('Invalid Redis URL format');
      }

      this.client = createClient({
        url: redisUrl,
        socket: {
          connectTimeout: 10000,
          reconnectStrategy: (retries) => {
            if (retries > 10) {
              console.error('Redis reconnection failed after 10 attempts');
              return new Error('Redis reconnection failed');
            }
            return Math.min(retries * 100, 3000);
          },
        },
        // Add authentication if password is provided
        password: this.extractPassword(redisUrl),
      });

      // Set up event handlers
      this.client.on('error', (err) => {
        console.error('Redis Client Error:', err);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        console.log('Redis Client Connected');
        this.isConnected = true;
      });

      this.client.on('ready', () => {
        console.log('Redis Client Ready');
      });

      this.client.on('end', () => {
        console.log('Redis Client Disconnected');
        this.isConnected = false;
      });

      await this.client.connect();

      // Test the connection
      await this.client.ping();

    } catch (error) {
      console.error('Failed to connect to Redis:', error);
      this.client = null;
      this.isConnected = false;
    }
  }

  private extractPassword(redisUrl: string): string | undefined {
    try {
      const url = new URL(redisUrl);
      return url.password || undefined;
    } catch {
      return undefined;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client && this.isConnected) {
      await this.client.disconnect();
      this.client = null;
      this.isConnected = false;
    }
  }

  isClientConnected(): boolean {
    return this.isConnected && this.client !== null;
  }

  async get(key: string): Promise<string | null> {
    if (!this.client || !this.isConnected) {
      return null;
    }

    try {
      const result = await this.client.get(key) as string | null;
      return result;
    } catch (error) {
      console.error('Redis GET error:', error);
      return null;
    }
  }

  async set(key: string, value: string, ttl?: number): Promise<boolean> {
    if (!this.client || !this.isConnected) {
      return false;
    }

    try {
      if (ttl) {
        await this.client.setEx(key, ttl, value);
      } else {
        await this.client.set(key, value);
      }
      return true;
    } catch (error) {
      console.error('Redis SET error:', error);
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    if (!this.client || !this.isConnected) {
      return false;
    }

    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      console.error('Redis DEL error:', error);
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    if (!this.client || !this.isConnected) {
      return false;
    }

    try {
      const result = await this.client.exists(key);
      return result > 0;
    } catch (error) {
      console.error('Redis EXISTS error:', error);
      return false;
    }
  }

  // Secure cache operations with key validation
  private validateKey(key: string): boolean {
    // Prevent Redis injection and ensure key format
    const validKeyPattern = /^[a-zA-Z0-9_\-:.@]+$/;
    return validKeyPattern.test(key) && key.length < 256;
  }

  async secureGet(key: string): Promise<string | null> {
    if (!this.validateKey(key)) {
      console.error('Invalid Redis key format:', key);
      return null;
    }
    return this.get(key);
  }

  async secureSet(key: string, value: string, ttl?: number): Promise<boolean> {
    if (!this.validateKey(key)) {
      console.error('Invalid Redis key format:', key);
      return false;
    }
    return this.set(key, value, ttl);
  }

  async secureDel(key: string): Promise<boolean> {
    if (!this.validateKey(key)) {
      console.error('Invalid Redis key format:', key);
      return false;
    }
    return this.del(key);
  }

  // Cache management utilities
  async clearPattern(pattern: string): Promise<number> {
    if (!this.client || !this.isConnected) {
      return 0;
    }

    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(keys);
      }
      return keys.length;
    } catch (error) {
      console.error('Redis CLEAR PATTERN error:', error);
      return 0;
    }
  }

  // Health check
  async healthCheck(): Promise<{ status: string; details: any }> {
    if (!this.client || !this.isConnected) {
      return {
        status: 'disconnected',
        details: { message: 'Redis client not connected' }
      };
    }

    try {
      const pong = await this.client.ping();
      const info = await this.client.info('memory');

      return {
        status: 'connected',
        details: {
          ping: pong,
          memory: info
        }
      };
    } catch (error) {
      return {
        status: 'error',
        details: { error: (error as Error).message }
      };
    }
  }
}

// Singleton instance
const redisManager = new RedisManager();

// Initialize Redis connection
export const initializeRedis = async () => {
  await redisManager.connect();
};

// Export Redis utilities
export const redis = {
  get: (key: string) => redisManager.secureGet(key),
  set: (key: string, value: string, ttl?: number) => redisManager.secureSet(key, value, ttl),
  del: (key: string) => redisManager.secureDel(key),
  exists: (key: string) => redisManager.exists(key),
  clearPattern: (pattern: string) => redisManager.clearPattern(pattern),
  isConnected: () => redisManager.isClientConnected(),
  healthCheck: () => redisManager.healthCheck(),
  disconnect: () => redisManager.disconnect()
};

export default redis;