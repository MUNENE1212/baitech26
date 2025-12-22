const { MongoClient, Db, Collection } = require('mongodb');
const { RedisClientType, createClient } = require('redis');
const { cacheService } = require('../cache/cache');

// MongoDB Connection
let mongoClient: MongoClient;
let database: Db;
let redisClient: any;

async function connectMongoDB() {
  if (database) {
    return database;
  }

  const mongoUri = process.env.MONGODB_URI || process.env.MONGODB_URL || 'mongodb://localhost:27017';

  try {
    mongoClient = new MongoClient(mongoUri);
    await mongoClient.connect();
    database = mongoClient.db();

    console.log('Connected to MongoDB successfully');
    return database;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

async function connectRedis() {
  try {
    const redisUrl = process.env.REDIS_URL || process.env.REDIS_URL || 'redis://localhost:6379';
    redisClient = createClient({ url: redisUrl });
    await redisClient.connect();
    console.log('Connected to Redis successfully');
    return redisClient;
  } catch (error) {
    console.warn('Redis connection failed, continuing without cache:', error.message);
    return null;
  }
}

// Collections
async function getProductsCollection() {
  const db = await connectMongoDB();
  return db.collection('products');
}

async function getTechnicianApplicationsCollection() {
  const db = await connectMongoDB();
  return db.collection('technician_applications');
}

async function getOrdersCollection() {
  const db = await connectMongoDB();
  return db.collection('orders');
}

async function getServicesCollection() {
  const db = await connectMongoDB();
  return db.collection('services');
}

async function getReviewsCollection() {
  const db = await connectMongoDB();
  return db.collection('reviews');
}

// Export cache service for use in API routes
module.exports = { cacheService };