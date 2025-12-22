# Redis Setup Guide

Redis will significantly improve your application's performance by caching database queries, API responses, and session data.

## 🚀 Quick Start Options

### Option 1: Docker (Recommended for Development)

```bash
# Start Redis with Docker Compose
docker-compose -f docker-compose.redis.yml up -d

# Check if Redis is running
docker ps | grep redis

# View Redis logs
docker logs baitech-redis

# Stop Redis
docker-compose -f docker-compose.redis.yml down
```

**Benefits:**
- Isolated environment
- Easy to start/stop
- Includes Redis Commander GUI (http://localhost:8081)
- No system installation required

### Option 2: System Installation (Recommended for Production)

```bash
# Make the setup script executable
chmod +x scripts/setup-redis.sh

# Run the Redis setup script
sudo ./scripts/setup-redis.sh

# Manual commands (if script fails):
sudo apt update
sudo apt install redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

### Option 3: Start Redis Immediately (if already installed)

```bash
# Check if Redis is installed
redis-server --version

# Start Redis service
sudo systemctl start redis-server

# Enable on boot
sudo systemctl enable redis-server

# Check status
sudo systemctl status redis-server

# Test connection
redis-cli ping
```

## 📊 Performance Benefits

With Redis enabled, you'll see:

- **3-10x faster** API response times
- **Reduced database load** (cached queries)
- **Better user experience** (instant page loads)
- **Scalable performance** (handle more concurrent users)

### What Gets Cached?

1. **Products**: Product data, categories, featured items
2. **Services**: Service listings and details
3. **User Sessions**: Authentication data and user info
4. **API Responses**: Common API calls and results
5. **Dashboard Data**: Admin statistics and metrics

## 🔧 Configuration

### Environment Variables
Your `.env.local` file should include:
```env
REDIS_URL=redis://localhost:6379
# Optional: Redis password
# REDIS_PASSWORD=your_password
```

### Redis GUI Tools

1. **Redis Commander** (included in Docker setup)
   - URL: http://localhost:8081
   - Visual database management

2. **RedisInsight** (Optional)
   ```bash
   docker run -d -p 8001:8001 redislabs/redisinsight
   ```
   - URL: http://localhost:8001

3. **Command Line Interface**
   ```bash
   redis-cli
   > KEYS *
   > GET key_name
   > DEL key_name
   ```

## 🔍 Troubleshooting

### Redis Connection Issues

1. **Check if Redis is running:**
   ```bash
   sudo systemctl status redis-server
   ```

2. **Test connection:**
   ```bash
   redis-cli ping
   # Should return: PONG
   ```

3. **Check logs:**
   ```bash
   sudo journalctl -u redis-server -f
   ```

4. **Restart Redis:**
   ```bash
   sudo systemctl restart redis-server
   ```

### Common Errors

**Error:** `ECONNREFUSED 127.0.0.1:6379`
- Redis is not running
- Solution: Start Redis service

**Error:** `Permission denied`
- Redis user permissions issue
- Solution: Check Redis configuration

**Error:** `Connection timeout`
- Redis configuration issue
- Solution: Check `bind` directive in config

## 📈 Monitoring Redis Performance

### Check Memory Usage
```bash
redis-cli info memory
```

### Check Key Statistics
```bash
redis-cli info stats
```

### Monitor in Real-time
```bash
redis-cli monitor
```

### Clear Cache (if needed)
```bash
redis-cli FLUSHALL
# ⚠️ Warning: This clears all cached data!
```

## 🚀 Production Recommendations

1. **Security**: Set Redis password
2. **Memory**: Configure max memory limit
3. **Persistence**: Enable AOF persistence
4. **Backup**: Regular Redis data backups
5. **Monitoring**: Use Redis monitoring tools

## 📞 Getting Help

- Redis Documentation: https://redis.io/documentation
- Redis GUI: http://localhost:8081 (when using Docker)
- Application logs check Redis connection status