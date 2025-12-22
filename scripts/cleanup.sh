#!/bin/bash

# BAITECH Cleanup Script
# This script removes old files and prepares the app for VPS deployment

set -e

echo "🧹 Starting BAITECH cleanup process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored messages
print_message() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Create backup directory
BACKUP_DIR="./cleanup-backup-$(date +%Y%m%d-%H%M%S)"
print_message "Creating backup directory: $BACKUP_DIR"
mkdir -p "$BACKUP_DIR"

# Step 1: Move old documentation to backup
print_message "Moving old documentation files to backup..."
mkdir -p "$BACKUP_DIR/old-docs"

# List of old docs to backup
OLD_DOCS=(
    "ADMIN_ISSUES_FIX_GUIDE.md"
    "ADMIN_PAGE_ENHANCEMENTS.md"
    "ADMIN_SEEDING_GUIDE.md"
    "ADMIN_USER_GUIDE.md"
    "CLOUDINARY_SETUP.md"
    "DEBUGGING_REPORT.md"
    "DEPLOYMENT_CHECKLIST.md"
    "DEPLOYMENT_INSTRUCTIONS.md"
    "FASTAPI_BACKEND_BACKUP_README.md"
    "FASTAPI_TO_NEXTJS_ROUTES_ANALYSIS.md"
    "HOMEPAGE_API_INVESTIGATION_REPORT.md"
    "IMAGE_MIGRATION_REPORT.md"
    "LINKEDIN_POST.md"
    "MIGRATION_FINAL_SUMMARY.md"
    "MIGRATION_PLAN.md"
    "MIGRATION_SUCCESS.md"
    "MIGRATION_SUMMARY_NEXTJS_ONLY.md"
    "NEXTJS_MIGRATION_IMPLEMENTATION_PLAN.md"
    "PRODUCT_DETAIL_PAGE.md"
    "PRODUCT_PAGE_FIXES.md"
    "PYTHON_BACKEND_CLEANUP_GUIDE.md"
    "PYTHON_BACKEND_ISOLATION_PLAN.md"
    "REBRANDING_SUMMARY.md"
    "SECURITY_EMERGENCY_RESPONSE.md"
    "SECURITY_IMPLEMENTATION_REPORT.md"
    "VPS_ADMIN_FIX_GUIDE.md"
)

for doc in "${OLD_DOCS[@]}"; do
    if [ -f "$doc" ]; then
        mv "$doc" "$BACKUP_DIR/old-docs/" 2>/dev/null || true
        print_message "Moved: $doc"
    fi
done

# Step 2: Remove old scripts
print_message "Backing up old scripts..."
mkdir -p "$BACKUP_DIR/old-scripts"

if [ -f "create-admin.js" ]; then
    mv create-admin.js "$BACKUP_DIR/old-scripts/"
    print_message "Moved: create-admin.js"
fi

if [ -f "debug-images.js" ]; then
    mv debug-images.js "$BACKUP_DIR/old-scripts/"
    print_message "Moved: debug-images.js"
fi

# Step 3: Remove backup folders
print_message "Moving backup folders..."
if [ -d "backup-before-migration" ]; then
    mv backup-before-migration "$BACKUP_DIR/"
    print_message "Moved: backup-before-migration/"
fi

if [ -d "baitech-frontend" ]; then
    mv baitech-frontend "$BACKUP_DIR/"
    print_message "Moved: baitech-frontend/"
fi

if [ -d "exported_data" ]; then
    mv exported_data "$BACKUP_DIR/"
    print_message "Moved: exported_data/"
fi

# Step 4: Remove agent workspaces
print_message "Removing agent workspaces..."
if [ -d ".agent-workpace" ]; then
    mv .agent-workpace "$BACKUP_DIR/"
    print_message "Moved: .agent-workpace/"
fi

if [ -d ".agent-workspace" ]; then
    mv .agent-workspace "$BACKUP_DIR/"
    print_message "Moved: .agent-workspace/"
fi

# Step 5: Remove coverage reports (can be regenerated)
print_message "Removing coverage reports..."
if [ -d "coverage" ]; then
    rm -rf coverage
    print_message "Removed: coverage/"
fi

# Step 6: Remove disabled config files
print_message "Removing disabled configuration files..."
if [ -f "next.config.production.ts.disabled" ]; then
    mv next.config.production.ts.disabled "$BACKUP_DIR/old-scripts/"
    print_message "Moved: next.config.production.ts.disabled"
fi

# Step 7: Clean up node_modules and build artifacts
print_warning "Do you want to remove node_modules and .next? (y/N)"
read -r response
if [[ "$response" =~ ^[Yy]$ ]]; then
    print_message "Removing node_modules and .next..."
    rm -rf node_modules
    rm -rf .next
    rm -rf .swc
    rm -f tsconfig.tsbuildinfo
    print_message "Build artifacts removed. Run 'npm install' to reinstall dependencies."
fi

# Step 8: Create .gitignore for production
print_message "Updating .gitignore..."
cat > .gitignore.temp << 'EOF'
# Dependencies
node_modules
.pnp
.pnp.js

# Testing
coverage

# Next.js
.next/
out/
build
dist

# Production
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local env files
.env
.env*.local
.env.production

# Vercel
.vercel

# TypeScript
*.tsbuildinfo
next-env.d.ts

# IDEs
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Development
.agent-workpace/
.agent-workspace/

# Backups
backup-before-migration/
*.backup
cleanup-backup-*/

# Redis dumps
dump.rdb
EOF

if [ -f .gitignore ]; then
    mv .gitignore "$BACKUP_DIR/.gitignore.backup"
fi
mv .gitignore.temp .gitignore
print_message "Updated .gitignore"

# Summary
echo ""
print_message "✨ Cleanup completed!"
echo ""
echo "📦 Backup location: $BACKUP_DIR"
echo ""
echo "📋 Next steps:"
echo "1. Review the backup directory"
echo "2. Run 'npm install' to reinstall dependencies"
echo "3. Run 'npm run build' to test the build"
echo "4. Commit changes to git"
echo ""
print_warning "Remember to test everything before pushing to production!"
