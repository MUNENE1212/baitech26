#!/usr/bin/env node

/**
 * Redis Connection Test Script
 * Tests if Redis is running and accessible
 */

const redis = require('redis');

async function testRedisConnection() {
  const redisUrl = process.env.REDIS_URL || process.env.REDIS_URI || 'redis://localhost:6379';

  console.log('🔍 Testing Redis connection...');
  console.log(`📍 URL: ${redisUrl}`);

  const client = redis.createClient({
    url: redisUrl,
    socket: {
      connectTimeout: 5000,
    },
  });

  client.on('error', (err) => {
    console.error('❌ Redis Client Error:', err.message);
  });

  client.on('connect', () => {
    console.log('✅ Redis Client Connected');
  });

  client.on('ready', () => {
    console.log('✅ Redis Client Ready');
  });

  try {
    await client.connect();

    // Test basic operations
    console.log('\n📝 Testing Redis operations...');

    // PING
    const pong = await client.ping();
    console.log(`  PING -> ${pong}`);

    // SET
    await client.set('test_key', 'test_value', { EX: 10 });
    console.log('  SET test_key = test_value (TTL: 10s)');

    // GET
    const value = await client.get('test_key');
    console.log(`  GET test_key -> ${value}`);

    // DELETE
    await client.del('test_key');
    console.log('  DEL test_key');

    // INFO
    const info = await client.info('server');
    const lines = info.split('\n');
    const version = lines.find(line => line.startsWith('redis_version'));
    console.log(`\n📊 Redis Info:`);
    console.log(`  ${version}`);

    // DB Size
    const dbSize = await client.dbSize();
    console.log(`  Total keys: ${dbSize}`);

    console.log('\n✅ Redis is working correctly! 🎉');
    console.log('\n💡 Your application will now use Redis for caching.');

  } catch (error) {
    console.error('\n❌ Redis connection failed:', error.message);
    console.log('\n💡 Troubleshooting:');
    console.log('  1. Make sure Redis is running: docker-compose up -d redis');
    console.log('  2. Check Redis logs: docker-compose logs redis');
    console.log('  3. Verify REDIS_URL in .env.local');
    console.log('  4. Test connection: docker-compose exec web npm run test:redis');
    process.exit(1);
  } finally {
    await client.quit();
  }
}

// Run the test
testRedisConnection().catch(console.error);
