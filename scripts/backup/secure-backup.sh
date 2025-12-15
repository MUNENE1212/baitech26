#!/bin/bash

# Secure Backup Script for MongoDB and Application Data
# This script creates encrypted backups and stores them securely

set -euo pipefail

# Configuration
BACKUP_DIR="${BACKUP_DIR:-/var/backups/baitech}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="baitech_backup_${TIMESTAMP}"
LOG_FILE="/var/log/baitech-backup.log"

# Security settings
export GPG_TTY=$(tty)
BACKUP_PASSPHRASE="${BACKUP_PASSPHRASE:-}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}ERROR: $1${NC}" | tee -a "$LOG_FILE"
    exit 1
}

success() {
    echo -e "${GREEN}SUCCESS: $1${NC}" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}WARNING: $1${NC}" | tee -a "$LOG_FILE"
}

# Check if running as root for system operations
check_requirements() {
    log "Checking backup requirements..."

    # Check required commands
    for cmd in mongodump tar gpg aws; do
        if ! command -v $cmd &> /dev/null; then
            error "$cmd is not installed"
        fi
    done

    # Check AWS credentials for S3 backup
    if [[ "${USE_S3_BACKUP:-true}" == "true" ]]; then
        if [[ -z "${AWS_ACCESS_KEY_ID:-}" || -z "${AWS_SECRET_ACCESS_KEY:-}" ]]; then
            error "AWS credentials not set for S3 backup"
        fi
    fi

    # Check backup passphrase
    if [[ -z "$BACKUP_PASSPHRASE" ]]; then
        error "Backup passphrase not set"
    fi

    success "Requirements check passed"
}

# Create backup directory
setup_backup_dir() {
    log "Setting up backup directory..."

    mkdir -p "$BACKUP_DIR"
    chmod 700 "$BACKUP_DIR"

    # Create temporary directory for this backup
    TEMP_DIR=$(mktemp -d -p "$BACKUP_DIR")
    chmod 700 "$TEMP_DIR"

    success "Backup directory created: $TEMP_DIR"
}

# Create MongoDB backup
backup_mongodb() {
    log "Starting MongoDB backup..."

    local mongo_backup_dir="$TEMP_DIR/mongodb"
    mkdir -p "$mongo_backup_dir"

    # Get MongoDB URI from environment
    local MONGODB_URI="${MONGODB_URI:-${MONGODB_URL:-}}"

    if [[ -z "$MONGODB_URI" ]]; then
        error "MongoDB URI not found in environment variables"
    fi

    # Perform MongoDB backup
    mongodump \
        --uri="$MONGODB_URI" \
        --out="$mongo_backup_dir" \
        --gzip \
        --forceTableScan \
        --numParallelCollections=4

    # Verify backup
    if [[ ! -d "$mongo_backup_dir" ]] || [[ -z "$(ls -A "$mongo_backup_dir")" ]]; then
        error "MongoDB backup failed or empty"
    fi

    # Create backup manifest
    cat > "$mongo_backup_dir/backup_manifest.json" << EOF
{
    "timestamp": "$(date -Iseconds)",
    "backup_type": "mongodb",
    "source_uri": "$(echo "$MONGODB_URI" | sed 's/\/\/[^@]*@/\/\/***:***@/')",
    "collections": $(find "$mongo_backup_dir" -name "*.bson.gz" | wc -l),
    "total_size_bytes": $(du -sb "$mongo_backup_dir" | cut -f1)
}
EOF

    success "MongoDB backup completed"
}

# Backup application files
backup_application() {
    log "Starting application backup..."

    local app_backup_dir="$TEMP_DIR/application"
    mkdir -p "$app_backup_dir"

    local app_dir="${APP_DIR:-$(pwd)}"

    # Backup critical application files
    tar -czf "$app_backup_dir/application.tar.gz" \
        -C "$app_dir" \
        --exclude="node_modules" \
        --exclude=".git" \
        --exclude="*.log" \
        --exclude="tmp" \
        --exclude="cache" \
        --exclude=".next/cache" \
        --exclude="public/uploads" \
        --exclude="dist" \
        --exclude="build" \
        .

    # Backup environment files (if they exist)
    if [[ -f "$app_dir/.env.local" ]]; then
        cp "$app_dir/.env.local" "$app_backup_dir/env.local.backup"
    fi

    if [[ -f "$app_dir/.env" ]]; then
        cp "$app_dir/.env" "$app_backup_dir/env.backup"
    fi

    # Create application manifest
    cat > "$app_backup_dir/application_manifest.json" << EOF
{
    "timestamp": "$(date -Iseconds)",
    "backup_type": "application",
    "app_directory": "$app_dir",
    "git_commit": "$(git -C "$app_dir" rev-parse HEAD 2>/dev/null || echo 'unknown')",
    "git_branch": "$(git -C "$app_dir" rev-parse --abbrev-ref HEAD 2>/dev/null || echo 'unknown')",
    "application_size_bytes": $(stat -c%s "$app_backup_dir/application.tar.gz")
}
EOF

    success "Application backup completed"
}

# Backup uploaded files and user data
backup_user_data() {
    log "Starting user data backup..."

    local user_data_dir="$TEMP_DIR/user_data"
    mkdir -p "$user_data_dir"

    local app_dir="${APP_DIR:-$(pwd)}"
    local uploads_dir="$app_dir/public/uploads"

    if [[ -d "$uploads_dir" ]]; then
        tar -czf "$user_data_dir/uploads.tar.gz" -C "$app_dir/public" uploads

        # Create uploads manifest
        cat > "$user_data_dir/uploads_manifest.json" << EOF
{
    "timestamp": "$(date -Iseconds)",
    "backup_type": "uploads",
    "total_files": $(find "$uploads_dir" -type f | wc -l),
    "total_size_bytes": $(du -sb "$uploads_dir" | cut -f1)
}
EOF
    fi

    success "User data backup completed"
}

# Encrypt backup files
encrypt_backup() {
    log "Encrypting backup files..."

    local encrypted_dir="$BACKUP_DIR/encrypted/$BACKUP_NAME"
    mkdir -p "$encrypted_dir"

    # Encrypt MongoDB backup
    tar -czf - -C "$TEMP_DIR" mongodb | \
        gpg --batch --yes --passphrase "$BACKUP_PASSPHRASE" \
        --symmetric --cipher-algo AES256 \
        --compress-algo 1 --s2k-mode 3 \
        --s2k-digest-algo SHA512 \
        --output "$encrypted_dir/mongodb.tar.gz.gpg"

    # Encrypt application backup
    tar -czf - -C "$TEMP_DIR" application | \
        gpg --batch --yes --passphrase "$BACKUP_PASSPHRASE" \
        --symmetric --cipher-algo AES256 \
        --compress-algo 1 --s2k-mode 3 \
        --s2k-digest-algo SHA512 \
        --output "$encrypted_dir/application.tar.gz.gpg"

    # Encrypt user data backup if it exists
    if [[ -d "$TEMP_DIR/user_data" ]] && [[ -n "$(ls -A "$TEMP_DIR/user_data")" ]]; then
        tar -czf - -C "$TEMP_DIR" user_data | \
            gpg --batch --yes --passphrase "$BACKUP_PASSPHRASE" \
            --symmetric --cipher-algo AES256 \
            --compress-algo 1 --s2k-mode 3 \
            --s2k-digest-algo SHA512 \
            --output "$encrypted_dir/user_data.tar.gz.gpg"
    fi

    # Create backup metadata
    cat > "$encrypted_dir/backup_metadata.json" << EOF
{
    "backup_name": "$BACKUP_NAME",
    "timestamp": "$(date -Iseconds)",
    "backup_components": ["mongodb", "application", "user_data"],
    "encryption": "AES256-GPG",
    "total_size_bytes": $(du -sb "$encrypted_dir" | cut -f1),
    "retention_days": $RETENTION_DAYS
}
EOF

    # Set secure permissions
    chmod 600 "$encrypted_dir"/*
    chmod 700 "$encrypted_dir"

    success "Backup encryption completed"
}

# Upload to S3 (if configured)
upload_to_s3() {
    if [[ "${USE_S3_BACKUP:-true}" != "true" ]]; then
        log "S3 backup disabled, skipping upload"
        return
    fi

    log "Uploading backup to S3..."

    local s3_bucket="${S3_BACKUP_BUCKET:-baitech-backups}"
    local s3_path="backups/$BACKUP_NAME"

    # Upload encrypted files to S3
    aws s3 cp "$encrypted_dir" "s3://$s3_bucket/$s3_path" \
        --recursive \
        --storage-class GLACIER_IR \
        --server-side-encryption AES256

    # Verify upload
    aws s3 ls "s3://$s3_bucket/$s3_path/" > /dev/null

    success "S3 upload completed"
}

# Cleanup old backups
cleanup_old_backups() {
    log "Cleaning up old backups..."

    # Local cleanup
    find "$BACKUP_DIR" -type d -name "baitech_backup_*" -mtime +$RETENTION_DAYS -exec rm -rf {} \; 2>/dev/null || true

    # S3 cleanup
    if [[ "${USE_S3_BACKUP:-true}" == "true" ]]; then
        local s3_bucket="${S3_BACKUP_BUCKET:-baitech-backups}"
        aws s3 ls "s3://$s3_bucket/backups/" | \
            while read -r line; do
                backup_date=$(echo "$line" | awk '{print $1}' | tr '-' ' ')
                backup_name=$(echo "$line" | awk '{print $2}')

                if [[ -n "$backup_name" ]]; then
                    # Convert backup date to timestamp for comparison
                    if date -d "$backup_date" >/dev/null 2>&1; then
                        backup_timestamp=$(date -d "$backup_date" +%s)
                        cutoff_timestamp=$(date -d "$RETENTION_DAYS days ago" +%s)

                        if [[ $backup_timestamp -lt $cutoff_timestamp ]]; then
                            log "Deleting old backup from S3: $backup_name"
                            aws s3 rm "s3://$s3_bucket/backups/$backup_name" --recursive
                        fi
                    fi
                fi
            done
    fi

    success "Old backup cleanup completed"
}

# Create backup verification report
create_backup_report() {
    log "Creating backup verification report..."

    local report_file="$BACKUP_DIR/backup_report_$TIMESTAMP.json"

    cat > "$report_file" << EOF
{
    "backup_name": "$BACKUP_NAME",
    "timestamp": "$(date -Iseconds)",
    "status": "success",
    "components": {
        "mongodb": {
            "status": "completed",
            "encrypted": true,
            "location": "${encrypted_dir:-}/mongodb.tar.gz.gpg"
        },
        "application": {
            "status": "completed",
            "encrypted": true,
            "location": "${encrypted_dir:-}/application.tar.gz.gpg"
        },
        "user_data": {
            "status": "completed",
            "encrypted": true,
            "location": "${encrypted_dir:-}/user_data.tar.gz.gpg"
        }
    },
    "storage": {
        "local": true,
        "s3": ${USE_S3_BACKUP:-false},
        "s3_bucket": "${S3_BACKUP_BUCKET:-N/A}"
    },
    "retention_days": $RETENTION_DAYS,
    "total_backup_size_bytes": $(du -sb "$encrypted_dir" 2>/dev/null | cut -f1 || echo 0)
}
EOF

    success "Backup report created: $report_file"
}

# Cleanup temporary files
cleanup_temp() {
    if [[ -n "${TEMP_DIR:-}" ]] && [[ -d "$TEMP_DIR" ]]; then
        rm -rf "$TEMP_DIR"
        log "Temporary files cleaned up"
    fi
}

# Main execution
main() {
    log "Starting secure backup process..."

    # Set up cleanup trap
    trap cleanup_temp EXIT

    check_requirements
    setup_backup_dir
    backup_mongodb
    backup_application
    backup_user_data
    encrypt_backup
    upload_to_s3
    cleanup_old_backups
    create_backup_report

    success "Backup process completed successfully!"
    log "Backup stored in: $BACKUP_DIR/encrypted/$BACKUP_NAME"
}

# Run main function
main "$@"