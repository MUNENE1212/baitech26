#!/bin/bash

# Redis Setup Script for Ubuntu/Linux
# This script installs Redis and starts it as a service

echo "🚀 Setting up Redis for better performance..."

# Update package list
echo "📦 Updating package list..."
sudo apt update

# Install Redis server
echo "📦 Installing Redis server..."
sudo apt install -y redis-server

# Configure Redis for performance
echo "⚙️ Configuring Redis for optimal performance..."

# Create Redis configuration file with optimized settings
sudo tee /etc/redis/redis-custom.conf > /dev/null <<EOF
# Network
bind 127.0.0.1
port 6379

# Security
# Add a password for production use
# requirepass your_secure_password_here

# Memory Management
maxmemory 256mb
maxmemory-policy allkeys-lru

# Persistence
save 900 1
save 300 10
save 60 10000

# Performance
tcp-keepalive 300
timeout 0
tcp-backlog 511

# Logging
loglevel notice
logfile /var/log/redis/redis-server.log

# Others
databases 16
EOF

# Backup original config
sudo cp /etc/redis/redis.conf /etc/redis/redis.conf.backup

# Use our custom configuration
sudo cp /etc/redis/redis-custom.conf /etc/redis/redis.conf

# Set proper permissions
sudo chown redis:redis /etc/redis/redis.conf
sudo chmod 640 /etc/redis/redis.conf

# Enable Redis to start on boot
echo "🔧 Enabling Redis service..."
sudo systemctl enable redis-server

# Start Redis service
echo "🚀 Starting Redis service..."
sudo systemctl start redis-server

# Check if Redis is running
echo "🔍 Checking Redis status..."
if sudo systemctl is-active --quiet redis-server; then
    echo "✅ Redis is running successfully!"
    echo "📊 Redis version: $(redis-server --version)"
    echo "🌐 Redis is listening on: localhost:6379"
else
    echo "❌ Redis failed to start. Checking logs..."
    sudo journalctl -u redis-server --no-pager -n 20
fi

# Test Redis connection
echo "🧪 Testing Redis connection..."
redis-cli ping

echo ""
echo "🎉 Redis setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Your application should now connect to Redis automatically"
echo "2. For Redis GUI, visit: http://localhost:8081 (if using Docker with Redis Commander)"
echo "3. To check Redis status: sudo systemctl status redis-server"
echo "4. To restart Redis: sudo systemctl restart redis-server"
echo "5. To view Redis logs: sudo journalctl -u redis-server -f"
echo ""
echo "🔒 Security note: Consider setting a Redis password in production by uncommenting the requirepass line in /etc/redis/redis.conf"