#!/bin/bash
# Quick script to setup environment files from examples

echo "=========================================="
echo "Environment Setup Script"
echo "=========================================="
echo ""

# Function to setup a file from example
setup_file() {
    local example_file=$1
    local target_file=$2

    if [ -f "$target_file" ]; then
        echo "⚠  $target_file already exists"
        read -p "   Overwrite? (yes/no): " OVERWRITE
        if [ "$OVERWRITE" != "yes" ]; then
            echo "   Skipped"
            return
        fi
    fi

    if [ ! -f "$example_file" ]; then
        echo "✗ Example file not found: $example_file"
        return
    fi

    cp "$example_file" "$target_file"
    echo "✓ Created: $target_file"
}

echo "Setting up backend environment files..."
setup_file ".env.example" ".env"

echo ""
echo "Setting up frontend environment files..."
setup_file "baitech-frontend/.env.local.example" "baitech-frontend/.env.local"

echo ""
echo "Setting up admin script..."
setup_file "setup_admin.py.example" "setup_admin.py"
chmod +x setup_admin.py 2>/dev/null

echo ""
echo "=========================================="
echo "Setup completed!"
echo "=========================================="
echo ""
echo "IMPORTANT: Edit these files with your actual values:"
echo "  1. .env - Backend configuration"
echo "  2. baitech-frontend/.env.local - Frontend configuration"
echo ""
echo "Generate a secure SECRET_KEY:"
echo "  python3 -c \"import secrets; print(secrets.token_urlsafe(32))\""
echo ""
echo "Then run:"
echo "  - Backend: python3 main.py"
echo "  - Frontend: cd baitech-frontend && npm run dev"
echo ""
