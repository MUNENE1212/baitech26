import { MongoClient, Db, Collection, ReadPreference } from 'mongodb';
import { RedisClientType, createClient } from 'redis';
import { cacheService } from '../cache/cache';

// MongoDB Connection
let mongoClient: MongoClient;
let database: Db;
let isConnecting = false;
let indexesCreated = false;

export async function connectMongoDB(): Promise<Db> {
  // If we already have a database connection, return it
  if (database && mongoClient) {
    try {
      // Test the connection with a ping
      await database.admin().ping();
      return database;
    } catch (error) {
      console.warn('Database connection lost, reconnecting...');
      database = null as any;
      mongoClient = null as any;
    }
  }

  // Prevent multiple simultaneous connections
  if (isConnecting) {
    // Wait for connection to complete
    while (isConnecting) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    if (database) return database;
  }

  isConnecting = true;

  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGODB_URL || process.env.MONGO_URL || 'mongodb://localhost:27017';

    console.log('Connecting to MongoDB...');

    // Configure MongoDB connection options for better reliability
    const clientOptions = {
      maxPoolSize: 20, // Increased pool size
      maxIdleTimeMS: 30000, // Close connections after 30s of inactivity
      serverSelectionTimeoutMS: 30000, // Increased timeout to 30s
      socketTimeoutMS: 60000, // Increased socket timeout
      connectTimeoutMS: 10000, // Connection timeout
      heartbeatFrequencyMS: 10000, // How often to check connection
      family: 4,
      retryWrites: true,
      retryReads: true,
      w: 'majority' as any,
      readPreference: ReadPreference.PRIMARY,
    };

    mongoClient = new MongoClient(mongoUri, clientOptions);
    await mongoClient.connect();
    database = mongoClient.db();

    // Only create indexes once
    if (!indexesCreated) {
      await createIndexes();
      indexesCreated = true;
    }

    console.log('✅ Connected to MongoDB successfully');
    return database;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    mongoClient = null as any;
    database = null as any;
    isConnecting = false;
    throw error;
  } finally {
    isConnecting = false;
  }
}

async function createIndexes() {
  try {
    console.log('Creating database indexes...');

    // Users collection indexes
    await database.collection('users').createIndex({ email: 1 }, { unique: true }).catch(() => null);
    await database.collection('users').createIndex({ role: 1 }).catch(() => null);

    // Products collection indexes
    await database.collection('products').createIndex({ product_id: 1 }, { unique: true }).catch(() => null);
    await database.collection('products').createIndex({ category: 1, subcategory: 1 }).catch(() => null);
    await database.collection('products').createIndex({ name: 'text', description: 'text' }).catch(() => null);
    await database.collection('products').createIndex({ featured: 1 }).catch(() => null);
    await database.collection('products').createIndex({ price: 1 }).catch(() => null);

    // Services collection indexes
    await database.collection('services_offered').createIndex({ service_id: 1 }, { unique: true }).catch(() => null);
    await database.collection('services_offered').createIndex({ is_active: 1 }).catch(() => null);
    await database.collection('services_offered').createIndex({ order: 1 }).catch(() => null);
    await database.collection('services').createIndex({ service_id: 1 }).catch(() => null);
    await database.collection('services').createIndex({ status: 1 }).catch(() => null);
    await database.collection('services').createIndex({ customer_contact: 1 }).catch(() => null);

    // Orders collection indexes
    await database.collection('orders').createIndex({ order_number: 1 }, { unique: true }).catch(() => null);
    await database.collection('orders').createIndex({ customer_contact: 1 }).catch(() => null);
    await database.collection('orders').createIndex({ order_status: 1 }).catch(() => null);
    await database.collection('orders').createIndex({ order_date: -1 }).catch(() => null);

    // Reviews collection indexes
    await database.collection('reviews').createIndex({ date: -1 }).catch(() => null);
    await database.collection('reviews').createIndex({ rating: 1 }).catch(() => null);
    await database.collection('reviews').createIndex({ product_id: 1 }).catch(() => null);

    // Technicians collection indexes
    await database.collection('technicians').createIndex({ specializations: 1 }).catch(() => null);
    await database.collection('technicians').createIndex({ jobs_completed: -1 }).catch(() => null);

    console.log('✅ Database indexes created successfully');
  } catch (error) {
    console.warn('⚠️  Some indexes could not be created:', error.message);
    // Don't throw error - app can work without some indexes
  }
}

export async function getMongoDB(): Promise<Db> {
  if (!database) {
    return await connectMongoDB();
  }
  return database;
}

// Redis Connection
let redisClient: RedisClientType;
let redisConnectionAttempted = false;

export async function connectRedis(): Promise<RedisClientType> {
  if (redisClient && redisClient.isOpen) {
    return redisClient;
  }

  // Skip Redis connection during build time to reduce noise
  if (process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build') {
    console.log('Skipping Redis connection during build time');
    return null as any;
  }

  if (redisConnectionAttempted) {
    // Don't spam connection attempts during build
    return null as any;
  }

  redisConnectionAttempted = true;
  const redisUrl = process.env.REDIS_URL || process.env.REDIS_URI || 'redis://localhost:6379';

  try {
    // Add connection timeout to prevent hanging
    const connectionTimeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Redis connection timeout after 3 seconds')), 3000);
    });

    redisClient = createClient({
      url: redisUrl,
      socket: {
        connectTimeout: 3000, // 3 second connection timeout
        reconnectStrategy: (retries) => {
          if (retries > 2) {
            return false; // Stop reconnecting after 2 attempts
          }
          return Math.min(retries * 50, 1000);
        }
      }
    });

    // Suppress error logging during build time
    redisClient.on('error', (err) => {
      // Only log if not during build
      if (process.env.NEXT_PHASE !== 'phase-production-build') {
        console.debug('Redis connection failed:', err.message);
      }
    });

    redisClient.on('connect', () => {
      if (process.env.NEXT_PHASE !== 'phase-production-build') {
        console.log('✅ Connected to Redis successfully');
      }
    });

    await Promise.race([
      redisClient.connect(),
      connectionTimeoutPromise
    ]);

    return redisClient;
  } catch (error) {
    // Only show warning once and not during build
    if (process.env.NEXT_PHASE !== 'phase-production-build') {
      console.warn('⚠️  Redis not available - application will work without caching');
      if (error instanceof Error && error.message.includes('timeout')) {
        console.debug('💡 Redis connection timed out - this is normal if Redis is not running');
      }
    }
    // Don't throw error for Redis - app can work without cache
    return null as any;
  }
}

export async function getRedisClient(): Promise<RedisClientType | null> {
  if (!redisClient || !redisClient.isOpen) {
    return await connectRedis();
  }
  return redisClient;
}

// Cache keys
export const CACHE_KEYS = {
  PRODUCTS: 'products',
  PRODUCT: (id: string) => `product:${id}`,
  SERVICES_OFFERED: 'services_offered',
  SERVICE_OFFERED: (id: string) => `service_offered:${id}`,
  FEATURED_PRODUCTS: 'featured_products',
  HOMEPAGE_DATA: 'homepage_data',
  USER: (id: string) => `user:${id}`,
  REVIEWS: 'reviews',
  PRODUCT_REVIEWS: (productId: string) => `reviews:product:${productId}`,
  TECHNICIANS: 'technicians',
  TECHNICIAN: (id: string) => `technician:${id}`,
} as const;

// Collections helpers
export async function getUsersCollection(): Promise<Collection> {
  const db = await getMongoDB();
  return db.collection('users');
}

export async function getProductsCollection(): Promise<Collection> {
  const db = await getMongoDB();
  return db.collection('products');
}

export async function getServicesCollection(): Promise<Collection> {
  const db = await getMongoDB();
  return db.collection('services');
}

export async function getServicesOfferedCollection(): Promise<Collection> {
  const db = await getMongoDB();
  return db.collection('services_offered');
}

export async function getOrdersCollection(): Promise<Collection> {
  const db = await getMongoDB();
  return db.collection('orders');
}

export async function getReviewsCollection(): Promise<Collection> {
  const db = await getMongoDB();
  return db.collection('reviews');
}

export async function getTechniciansCollection(): Promise<Collection> {
  const db = await getMongoDB();
  return db.collection('technicians');
}

export async function getTechnicianApplicationsCollection(): Promise<Collection> {
  const db = await getMongoDB();
  return db.collection('technician_applications');
}

// Export cache service for use in API routes
export { cacheService };


// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Closing database connections...');
  if (mongoClient) {
    await mongoClient.close();
  }
  if (redisClient && redisClient.isOpen) {
    await redisClient.quit();
  }
  process.exit(0);
});