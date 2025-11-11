#!/bin/bash
# MongoDB Restore Script
# Restores database from a backup file

set -e

BACKUP_DIR="/var/www/baitech/backups"

echo "=========================================="
echo "MongoDB Restore Script"
echo "=========================================="
echo ""

# List available backups
echo "Available backups:"
echo ""
ls -lht $BACKUP_DIR/*.tar.gz 2>/dev/null || {
    echo "No backups found in $BACKUP_DIR"
    exit 1
}
echo ""

# Get backup file to restore
read -p "Enter backup filename to restore (or full path): " BACKUP_FILE

# Check if file exists
if [ ! -f "$BACKUP_FILE" ]; then
    # Try in backup directory
    BACKUP_FILE="$BACKUP_DIR/$BACKUP_FILE"
    if [ ! -f "$BACKUP_FILE" ]; then
        echo "Error: Backup file not found"
        exit 1
    fi
fi

echo ""
echo "⚠️  WARNING: This will OVERWRITE your current database!"
read -p "Are you sure? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "Restore cancelled"
    exit 0
fi

# Get MongoDB connection string
cd /var/www/baitech
source venv/bin/activate

if [ ! -f .env ]; then
    echo "Error: .env file not found"
    exit 1
fi

MONGO_URL=$(grep MONGO_URL .env | cut -d '=' -f2)

if [ -z "$MONGO_URL" ]; then
    echo "Error: MONGO_URL not found in .env"
    exit 1
fi

# Extract backup
TEMP_DIR="/tmp/baitech_restore_$$"
mkdir -p $TEMP_DIR

echo ""
echo "Extracting backup..."
tar -xzf "$BACKUP_FILE" -C $TEMP_DIR

# Find the dump directory
DUMP_DIR=$(find $TEMP_DIR -type d -name "baitekdb" | head -1)

if [ -z "$DUMP_DIR" ]; then
    echo "Error: Database dump not found in backup"
    rm -rf $TEMP_DIR
    exit 1
fi

# Restore using mongorestore
echo "Restoring database..."
mongorestore --uri="$MONGO_URL" --drop --dir="$DUMP_DIR"

# Cleanup
rm -rf $TEMP_DIR

echo ""
echo "=========================================="
echo "Restore completed!"
echo "=========================================="
echo ""
echo "Database has been restored from: $BACKUP_FILE"
echo ""
