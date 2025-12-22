#!/bin/bash

# BAITECH Production Deployment Script
# This script deploys the application to a VPS

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_message() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

# Configuration
APP_NAME="baitech"
CONTAINER_NAME="baitech-web"
BACKUP_DIR="./backups/deployment-$(date +%Y%m%d-%H%M%S)"

print_message "🚀 Starting BAITECH deployment..."

# Step 1: Pre-deployment checks
print_message "Checking environment..."

if [ ! -f .env.local ]; then
    print_error ".env.local file not found!"
    print_warning "Copy .env.local.example to .env.local and configure it"
    exit 1
fi

if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed!"
    exit 1
fi

# Step 2: Create backup
print_message "Creating backup directory..."
mkdir -p "$BACKUP_DIR"

if [ -d .next ]; then
    cp -r .next "$BACKUP_DIR/" 2>/dev/null || true
fi

# Step 3: Pull latest changes
print_message "Pulling latest changes from git..."
git pull origin main || git pull origin master

# Step 4: Stop running containers
print_message "Stopping existing containers..."
if docker ps -q --filter "name=$CONTAINER_NAME" | grep -q .; then
    docker stop "$CONTAINER_NAME" || true
fi

# Step 5: Build new image
print_message "Building Docker image..."
docker-compose build web

# Step 6: Start new container
print_message "Starting new container..."
docker-compose up -d web

# Step 7: Wait for health check
print_message "Waiting for application to start..."
sleep 15

# Step 8: Check if container is running
if docker ps --filter "name=$CONTAINER_NAME" --filter "status=running" | grep -q .; then
    print_message "✅ Container is running!"
else
    print_error "❌ Container failed to start!"
    docker logs "$CONTAINER_NAME" --tail 50
    exit 1
fi

# Step 9: Health check
print_message "Performing health check..."
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    print_message "✅ Health check passed!"
else
    print_warning "⚠️  Health check failed, but container is running"
    print_warning "Check logs: docker logs $CONTAINER_NAME"
fi

# Step 10: Cleanup old images
print_message "Cleaning up old Docker images..."
docker image prune -af --filter "until=24h" || true

# Step 11: Seed admin if this is first deployment
print_message "Checking if admin user exists..."
# This would need to be implemented based on your API
# You might want to call your seeding endpoint here

# Summary
echo ""
print_message "✨ Deployment completed successfully!"
echo ""
echo "📊 Container status:"
docker ps --filter "name=$CONTAINER_NAME"
echo ""
echo "📋 Useful commands:"
echo "  View logs: docker logs -f $CONTAINER_NAME"
echo "  Restart: docker-compose restart web"
echo "  Stop: docker-compose stop web"
echo "  Shell access: docker exec -it $CONTAINER_NAME sh"
echo ""
print_warning "Remember to monitor the application for any issues!"
