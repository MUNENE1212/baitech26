import { MongoClient, Db, Collection, ServerApiVersion } from 'mongodb';

interface MongoConfig {
  uri: string;
  dbName: string;
  options: any;
}

class SecureMongoDBManager {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private isConnected: boolean = false;

  private getConfig(): MongoConfig {
    const uri = process.env.MONGODB_URI || process.env.MONGODB_URL;
    const dbName = process.env.MONGODB_DB || process.env.MONGO_DB || 'baitekdb';

    if (!uri) {
      throw new Error('MongoDB URI not provided in environment variables');
    }

    // Validate URI format
    if (!uri.startsWith('mongodb+srv://') && !uri.startsWith('mongodb://')) {
      throw new Error('Invalid MongoDB URI format');
    }

    return {
      uri,
      dbName,
      options: {
        serverApi: {
          version: ServerApiVersion.v1,
          strict: true,
          deprecationErrors: true,
        },
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        family: 4, // Use IPv4
        retryWrites: true,
        retryReads: true,
        w: 'majority',
        readPreference: 'primary',
        // Enable SSL for production
        ssl: process.env.NODE_ENV === 'production',
        sslValidate: process.env.NODE_ENV === 'production',
      }
    };
  }

  async connect(): Promise<void> {
    try {
      const config = this.getConfig();

      this.client = new MongoClient(config.uri, config.options);

      // Set up event handlers
      this.client.on('serverOpening', (event) => {
        console.log('MongoDB server opened:', event.address);
      });

      this.client.on('serverClosed', (event) => {
        console.warn('MongoDB server closed:', event.address);
        this.isConnected = false;
      });

      this.client.on('serverHeartbeatFailed', (event) => {
        console.error('MongoDB server heartbeat failed:', event.address);
      });

      this.client.on('topologyOpening', (topologyId) => {
        console.log('MongoDB topology opening:', topologyId);
      });

      this.client.on('topologyClosed', (topologyId) => {
        console.log('MongoDB topology closed:', topologyId);
        this.isConnected = false;
      });

      // Connect to the server
      await this.client.connect();

      // Connect to the database
      this.db = this.client.db(config.dbName);

      // Test the connection
      await this.db.admin().ping();

      this.isConnected = true;
      console.log('Connected securely to MongoDB');

      // Enable security features
      await this.enableSecurityFeatures();

    } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
      this.client = null;
      this.db = null;
      this.isConnected = false;
      throw error;
    }
  }

  private async enableSecurityFeatures(): Promise<void> {
    if (!this.db) return;

    try {
      // Create indexes for common queries and security
      await this.createSecurityIndexes();

      // Create audit collection for security events
      const auditCollection = this.db.collection('security_audit');
      await auditCollection.createIndex({ timestamp: 1 }, { expireAfterSeconds: 7776000 }); // 90 days

    } catch (error) {
      console.error('Failed to enable MongoDB security features:', error);
    }
  }

  private async createSecurityIndexes(): Promise<void> {
    if (!this.db) return;

    const indexes = [
      // Users collection indexes
      {
        collection: 'users',
        index: { email: 1 },
        options: { unique: true }
      },
      {
        collection: 'users',
        index: { username: 1 },
        options: { unique: true, sparse: true }
      },
      {
        collection: 'users',
        index: { 'loginAttempts': 1, 'lastLoginAttempt': 1 }
      },
      {
        collection: 'users',
        index: { 'createdAt': 1 }
      },

      // Products collection indexes
      {
        collection: 'products',
        index: { slug: 1 },
        options: { unique: true }
      },
      {
        collection: 'products',
        index: { category: 1, isActive: 1 }
      },
      {
        collection: 'products',
        index: { 'createdAt': -1 }
      },

      // Security audit indexes
      {
        collection: 'security_audit',
        index: { ip: 1, timestamp: -1 }
      },
      {
        collection: 'security_audit',
        index: { event: 1, timestamp: -1 }
      },

      // Session indexes
      {
        collection: 'sessions',
        index: { userId: 1, expiresAt: 1 },
        options: { expireAfterSeconds: 0 }
      },
      {
        collection: 'sessions',
        index: { token: 1 },
        options: { unique: true }
      }
    ];

    for (const { collection, index, options } of indexes) {
      try {
        await this.db.collection(collection).createIndex(index, options || {});
        console.log(`Created index on ${collection}:`, JSON.stringify(index));
      } catch (error) {
        console.warn(`Failed to create index on ${collection}:`, error);
      }
    }
  }

  async disconnect(): Promise<void> {
    if (this.client && this.isConnected) {
      await this.client.close();
      this.client = null;
      this.db = null;
      this.isConnected = false;
      console.log('Disconnected from MongoDB');
    }
  }

  isConnectedToDb(): boolean {
    return this.isConnected && this.db !== null;
  }

  getDatabase(): Db {
    if (!this.db) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.db;
  }

  getCollection<T = any>(name: string): Collection<T> {
    if (!this.db) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.db.collection<T>(name);
  }

  // Security operations
  async logSecurityEvent(event: string, details: any, ip?: string): Promise<void> {
    if (!this.db) return;

    try {
      const auditCollection = this.db.collection('security_audit');
      await auditCollection.insertOne({
        timestamp: new Date(),
        event,
        details,
        ip,
        userAgent: details.userAgent,
        severity: this.getEventSeverity(event)
      });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  private getEventSeverity(event: string): 'low' | 'medium' | 'high' | 'critical' {
    const criticalEvents = ['UNAUTHORIZED_ADMIN_ACCESS', 'SQL_INJECTION_ATTEMPT', 'RATE_LIMIT_EXCEEDED'];
    const highEvents = ['BLOCKED_IP_ACCESS_ATTEMPT', 'INVALID_UPLOAD_CONTENT_TYPE', 'SUSPICIOUS_USER_AGENT'];
    const mediumEvents = ['INVALID_ORIGIN_REQUEST', 'OVERSIZED_REQUEST'];

    if (criticalEvents.includes(event)) return 'critical';
    if (highEvents.includes(event)) return 'high';
    if (mediumEvents.includes(event)) return 'medium';
    return 'low';
  }

  // Input sanitization for MongoDB queries
  sanitizeQuery(query: any): any {
    if (typeof query !== 'object' || query === null) {
      return query;
    }

    const sanitized: any = {};

    for (const [key, value] of Object.entries(query)) {
      // Skip dangerous MongoDB operators
      if (key.startsWith('$') && !['$and', '$or', '$in', '$nin', '$gt', '$gte', '$lt', '$lte', '$ne'].includes(key)) {
        console.warn('Dangerous MongoDB operator filtered:', key);
        continue;
      }

      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        sanitized[key] = this.sanitizeQuery(value);
      } else if (typeof value === 'string') {
        // Basic string sanitization
        sanitized[key] = value.replace(/[<>]/g, '').trim();
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  // Health check
  async healthCheck(): Promise<{ status: string; details: any }> {
    if (!this.client || !this.isConnected) {
      return {
        status: 'disconnected',
        details: { message: 'MongoDB client not connected' }
      };
    }

    try {
      const adminDb = this.client.db().admin();
      const serverStatus = await adminDb.serverStatus();
      const dbStats = await this.db!.stats();

      return {
        status: 'connected',
        details: {
          version: serverStatus.version,
          uptime: serverStatus.uptime,
          connections: serverStatus.connections,
          memory: serverStatus.mem,
          dbStats: {
            collections: dbStats.collections,
            documents: dbStats.objects,
            dataSize: dbStats.dataSize,
            indexes: dbStats.indexes,
            indexSize: dbStats.indexSize
          }
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
const mongoManager = new SecureMongoDBManager();

// Initialize MongoDB connection
export const initializeMongoDB = async () => {
  try {
    await mongoManager.connect();
  } catch (error) {
    console.error('Failed to initialize MongoDB:', error);
    throw error;
  }
};

// Export MongoDB utilities
export const db = {
  getDatabase: () => mongoManager.getDatabase(),
  getCollection: <T = any>(name: string) => mongoManager.getCollection<T>(name),
  isConnected: () => mongoManager.isConnectedToDb(),
  healthCheck: () => mongoManager.healthCheck(),
  disconnect: () => mongoManager.disconnect(),
  sanitizeQuery: (query: any) => mongoManager.sanitizeQuery(query),
  logSecurityEvent: (event: string, details: any, ip?: string) => mongoManager.logSecurityEvent(event, details, ip)
};

export default db;