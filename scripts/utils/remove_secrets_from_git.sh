#!/bin/bash
# Script to remove sensitive files from git history
# Run this if you accidentally committed .env files or other secrets

echo "=========================================="
echo "Remove Secrets from Git History"
echo "=========================================="
echo ""
echo "⚠️  WARNING: This script will rewrite git history!"
echo "⚠️  All team members will need to re-clone the repository."
echo ""
read -p "Are you sure you want to continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "Aborted"
    exit 0
fi

echo ""
echo "Checking what will be removed..."
echo ""

# Check if files are in git history
FILES_TO_REMOVE=(
    ".env"
    ".env.production"
    ".env.local"
    "baitech-frontend/.env.production.local"
    "baitech-frontend/.env.local"
    "setup_admin.py"
)

FOUND_FILES=()

for file in "${FILES_TO_REMOVE[@]}"; do
    if git log --all --pretty=format: --name-only --diff-filter=A | grep -q "^$file$"; then
        echo "  ✗ Found in history: $file"
        FOUND_FILES+=("$file")
    fi
done

if [ ${#FOUND_FILES[@]} -eq 0 ]; then
    echo "  ✓ No sensitive files found in git history"
    echo ""
    echo "Your repository is clean!"
    exit 0
fi

echo ""
echo "Found ${#FOUND_FILES[@]} sensitive file(s) in git history."
echo ""
read -p "Remove these files from git history? (yes/no): " CONFIRM2

if [ "$CONFIRM2" != "yes" ]; then
    echo "Aborted"
    exit 0
fi

echo ""
echo "Installing BFG Repo-Cleaner..."

# Download BFG if not present
if [ ! -f "bfg.jar" ]; then
    wget https://repo1.maven.org/maven2/com/madgag/bfg/1.14.0/bfg-1.14.0.jar -O bfg.jar
fi

echo "Removing files from git history..."

# Remove each file
for file in "${FOUND_FILES[@]}"; do
    echo "  Removing: $file"
    java -jar bfg.jar --delete-files "$(basename $file)" .git
done

echo ""
echo "Cleaning up git repository..."
git reflog expire --expire=now --all
git gc --prune=now --aggressive

echo ""
echo "=========================================="
echo "Cleanup completed!"
echo "=========================================="
echo ""
echo "IMPORTANT NEXT STEPS:"
echo "1. Force push to remote: git push --force --all"
echo "2. Notify all team members to re-clone the repository"
echo "3. Rotate all exposed secrets (SECRET_KEY, MongoDB password, etc.)"
echo ""
echo "See SECURITY.md for secret rotation instructions."
echo ""
