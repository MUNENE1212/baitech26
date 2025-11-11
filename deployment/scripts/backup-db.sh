#!/bin/bash
# MongoDB Atlas Database Backup Script
# Creates a backup and uploads to a backup directory

set -e

BACKUP_DIR="/var/www/baitech/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="baitech_backup_$TIMESTAMP"

echo "=========================================="
echo "MongoDB Backup Script"
echo "=========================================="
echo ""

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Get MongoDB connection string from .env
cd /var/www/baitech
source venv/bin/activate

if [ ! -f .env ]; then
    echo "Error: .env file not found"
    exit 1
fi

# Extract MongoDB URL
MONGO_URL=$(grep MONGO_URL .env | cut -d '=' -f2)

if [ -z "$MONGO_URL" ]; then
    echo "Error: MONGO_URL not found in .env"
    exit 1
fi

echo "Starting backup: $BACKUP_NAME"
echo ""

# Install mongodump if not present
if ! command -v mongodump &> /dev/null; then
    echo "Installing MongoDB Database Tools..."
    wget https://fastdl.mongodb.org/tools/db/mongodb-database-tools-ubuntu2004-x86_64-100.9.4.deb
    dpkg -i mongodb-database-tools-ubuntu2004-x86_64-100.9.4.deb
    rm mongodb-database-tools-ubuntu2004-x86_64-100.9.4.deb
fi

# Create backup using mongodump
echo "Creating database dump..."
mongodump --uri="$MONGO_URL" --out="$BACKUP_DIR/$BACKUP_NAME"

# Compress backup
echo "Compressing backup..."
cd $BACKUP_DIR
tar -czf "${BACKUP_NAME}.tar.gz" "$BACKUP_NAME"
rm -rf "$BACKUP_NAME"

# Get backup size
BACKUP_SIZE=$(du -h "${BACKUP_NAME}.tar.gz" | cut -f1)

echo ""
echo "=========================================="
echo "Backup completed!"
echo "=========================================="
echo ""
echo "Backup file: $BACKUP_DIR/${BACKUP_NAME}.tar.gz"
echo "Size: $BACKUP_SIZE"
echo ""

# Keep only last 7 backups
echo "Cleaning old backups (keeping last 7)..."
cd $BACKUP_DIR
ls -t baitech_backup_*.tar.gz | tail -n +8 | xargs -r rm

echo "Done!"
echo ""
