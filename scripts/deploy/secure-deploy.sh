#!/bin/bash

# Secure Production Deployment Script
# This script handles secure deployment with rollback capabilities

set -euo pipefail

# Configuration
APP_NAME="baitech"
DEPLOY_ENV="production"
DEPLOY_DIR="/var/www/$APP_NAME"
BACKUP_DIR="/var/backups/deployments"
HEALTH_CHECK_URL="https://yourdomain.com/api/health"
SLACK_WEBHOOK="${SLACK_WEBHOOK:-}"
ROLLBACK_DEPLOYMENT="false"
DRY_RUN="false"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Logging
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}ERROR: $1${NC}" >&2
    notify_slack "❌ Deployment FAILED: $1"
    exit 1
}

success() {
    echo -e "${GREEN}SUCCESS: $1${NC}"
    notify_slack "✅ $1"
}

warning() {
    echo -e "${YELLOW}WARNING: $1${NC}"
    notify_slack "⚠️ $1"
}

# Slack notifications
notify_slack() {
    if [[ -n "$SLACK_WEBHOOK" ]]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"$1\"}" \
            "$SLACK_WEBHOOK" || true
    fi
}

# Pre-deployment checks
pre_deployment_checks() {
    log "Running pre-deployment checks..."

    # Check if running as appropriate user
    if [[ $EUID -eq 0 ]]; then
        error "This script should not be run as root for security"
    fi

    # Check environment variables
    local required_vars=("MONGODB_URI" "JWT_SECRET" "NEXTAUTH_SECRET" "REDIS_URL")
    for var in "${required_vars[@]}"; do
        if [[ -z "${!var:-}" ]]; then
            error "Required environment variable $var is not set"
        fi
    done

    # Check disk space
    local available_space=$(df "$DEPLOY_DIR" | awk 'NR==2 {print $4}')
    if [[ $available_space -lt 1048576 ]]; then # 1GB in KB
        error "Insufficient disk space for deployment"
    fi

    # Check if previous deployment exists for rollback
    if [[ ! -d "$DEPLOY_DIR/current" ]]; then
        error "No current deployment found. Initialize deployment first."
    fi

    success "Pre-deployment checks passed"
}

# Create deployment backup
create_deployment_backup() {
    log "Creating deployment backup..."

    local backup_name="${APP_NAME}_backup_$(date +%Y%m%d_%H%M%S)"
    local backup_path="$BACKUP_DIR/$backup_name"

    mkdir -p "$backup_path"

    # Backup current deployment
    if [[ -d "$DEPLOY_DIR/current" ]]; then
        cp -r "$DEPLOY_DIR/current" "$backup_path/current"
        cp -r "$DEPLOY_DIR/current/.env*" "$backup_path/" 2>/dev/null || true
    fi

    # Backup database (full backup for production)
    if [[ "$DRY_RUN" != "true" ]]; then
        "$BACKUP_DIR/../backup/secure-backup.sh"
    fi

    # Create rollback symlink
    ln -sf "$backup_path" "$BACKUP_DIR/rollback_target"

    success "Deployment backup created: $backup_path"
}

# Build application
build_application() {
    log "Building application..."

    # Install dependencies
    npm ci --production=false --silent

    # Run security audit on dependencies
    npm audit --audit-level=high || {
        warning "Security vulnerabilities found in dependencies"
        read -p "Continue with deployment? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            error "Deployment cancelled due to security vulnerabilities"
        fi
    }

    # Build the application
    npm run build

    # Run tests
    if [[ -f "package.json" ]] && grep -q '"test"' package.json; then
        log "Running tests..."
        npm test
    fi

    success "Application built successfully"
}

# Deploy new version
deploy_application() {
    log "Deploying new application version..."

    local release_name="${APP_NAME}_release_$(date +%Y%m%d_%H%M%S)"
    local release_path="$DEPLOY_DIR/releases/$release_name"

    if [[ "$DRY_RUN" != "true" ]]; then
        # Create release directory
        mkdir -p "$release_path"

        # Copy application files
        rsync -av --exclude='.git' --exclude='node_modules' --exclude='.env*' \
              --exclude='*.log' --exclude='tmp' \
              . "$release_path/"

        # Install production dependencies
        cd "$release_path"
        npm ci --production --silent

        # Copy production environment file
        if [[ -f "/etc/$APP_NAME/.env.production" ]]; then
            cp "/etc/$APP_NAME/.env.production" "$release_path/.env.local"
        else
            error "Production environment file not found"
        fi

        # Set appropriate permissions
        chown -R deploy:www-data "$release_path"
        find "$release_path" -type d -exec chmod 755 {} \;
        find "$release_path" -type f -exec chmod 644 {} \;

        # Switch to new deployment
        cd "$DEPLOY_DIR"
        ln -sfn "$release_path" "new"

        # Graceful server restart
        if systemctl is-active --quiet "$APP_NAME"; then
            systemctl reload "$APP_NAME" || systemctl restart "$APP_NAME"
        else
            systemctl start "$APP_NAME"
        fi

        # Wait for application to start
        sleep 10

        # Switch new to current
        mv current old 2>/dev/null || true
        mv new current
        rm -rf old 2>/dev/null || true

        cd "$release_path"
    fi

    success "Application deployed successfully"
}

# Health check
health_check() {
    log "Performing health check..."

    local max_attempts=30
    local attempt=1

    while [[ $attempt -le $max_attempts ]]; do
        if curl -f -s -m 10 "$HEALTH_CHECK_URL" >/dev/null; then
            success "Health check passed on attempt $attempt"
            return 0
        fi

        log "Health check attempt $attempt failed, retrying in 10 seconds..."
        sleep 10
        ((attempt++))
    done

    error "Health check failed after $max_attempts attempts"
}

# Post-deployment verification
post_deployment_verification() {
    log "Running post-deployment verification..."

    # Check application logs for errors
    if journalctl -u "$APP_NAME" --since "1 minute ago" | grep -i error >/dev/null; then
        warning "Errors detected in application logs"
    fi

    # Verify database connection
    local db_check=$(curl -s "$HEALTH_CHECK_URL/database" | jq -r '.status // "error"' 2>/dev/null || echo "error")
    if [[ "$db_check" != "connected" ]]; then
        error "Database connection verification failed"
    fi

    # Verify Redis connection
    local redis_check=$(curl -s "$HEALTH_CHECK_URL/redis" | jq -r '.status // "error"' 2>/dev/null || echo "error")
    if [[ "$redis_check" != "connected" ]]; then
        error "Redis connection verification failed"
    fi

    # Clean up old deployments (keep last 5)
    find "$DEPLOY_DIR/releases" -maxdepth 1 -type d -name "${APP_NAME}_release_*" | \
        sort -r | tail -n +6 | xargs rm -rf || true

    success "Post-deployment verification completed"
}

# Rollback function
rollback_deployment() {
    log "Initiating deployment rollback..."

    if [[ ! -L "$BACKUP_DIR/rollback_target" ]]; then
        error "No rollback target available"
    fi

    local rollback_path=$(readlink "$BACKUP_DIR/rollback_target/current")
    if [[ ! -d "$rollback_path" ]]; then
        error "Rollback target not found: $rollback_path"
    fi

    # Switch to rollback deployment
    cd "$DEPLOY_DIR"
    mv current failed 2>/dev/null || true
    cp -r "$rollback_path" "current"

    # Restart application
    systemctl restart "$APP_NAME"
    sleep 10

    # Verify rollback
    if health_check; then
        success "Rollback completed successfully"
        notify_slack "🔄 Deployment ROLLED BACK successfully"
    else
        error "Rollback verification failed"
    fi
}

# Cleanup old backups
cleanup_old_backups() {
    log "Cleaning up old backups..."

    # Remove old deployment backups (keep last 10)
    find "$BACKUP_DIR" -maxdepth 1 -type d -name "${APP_NAME}_backup_*" | \
        sort -r | tail -n +11 | xargs rm -rf || true

    # Remove old releases (keep last 5)
    find "$DEPLOY_DIR/releases" -maxdepth 1 -type d -name "${APP_NAME}_release_*" | \
        sort -r | tail -n +6 | xargs rm -rf || true

    success "Old backups cleaned up"
}

# Help function
show_help() {
    cat << EOF
Secure Deployment Script for $APP_NAME

Usage: $0 [OPTIONS]

Options:
    -r, --rollback     Rollback to previous deployment
    -d, --dry-run      Perform a dry run without actual deployment
    -h, --help         Show this help message

Environment Variables:
    SLACK_WEBHOOK      Slack webhook URL for notifications
    MONGODB_URI        MongoDB connection URI
    JWT_SECRET         JWT secret key
    NEXTAUTH_SECRET    NextAuth secret key
    REDIS_URL          Redis connection URL

Examples:
    $0                          # Deploy new version
    $0 --rollback              # Rollback to previous version
    $0 --dry-run               # Perform dry run

EOF
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -r|--rollback)
            ROLLBACK_DEPLOYMENT="true"
            shift
            ;;
        -d|--dry-run)
            DRY_RUN="true"
            shift
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            error "Unknown option: $1. Use --help for usage information."
            ;;
    esac
done

# Main execution
main() {
    log "Starting secure deployment process..."
    notify_slack "🚀 Starting deployment of $APP_NAME"

    # Trap for cleanup on error
    trap 'error "Deployment interrupted"' ERR

    if [[ "$ROLLBACK_DEPLOYMENT" == "true" ]]; then
        rollback_deployment
        exit 0
    fi

    pre_deployment_checks
    create_deployment_backup
    build_application
    deploy_application
    health_check
    post_deployment_verification
    cleanup_old_backups

    success "Deployment completed successfully!"
    notify_slack "🎉 Deployment of $APP_NAME completed successfully!"
}

# Execute main function
main "$@"