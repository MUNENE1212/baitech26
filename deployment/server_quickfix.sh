#!/bin/bash
# Quick Fix Script for Baitech Server
# Run this on the server to fix the .env and deployment issues
# Usage: cd /var/www/baitech && bash deployment/server_quickfix.sh

set -e  # Exit on error

echo "=========================================="
echo "Baitech Server Quick Fix Script"
echo "=========================================="
echo ""

# Navigate to project root
cd /var/www/baitech

echo "[1/7] Pulling latest changes..."
git pull origin master
echo "✓ Git pull completed"
echo ""

echo "[2/7] Creating correct .env file..."
cat > .env <<'EOF'
MONGO_URL=mongodb+srv://baitech:ix5YYaOLtX0r2LTe@cluster0.nmtob1l.mongodb.net/baitekdb?retryWrites=true&w=majority
MONGO_DB=baitekdb
SECRET_KEY=D8LqbGKChHXuXNU6ddQUQGu6xeg6gkyQ6bd9axNsnzc
EOF
echo "✓ .env file created"
echo ""

echo "[3/7] Verifying .env file..."
cat .env
LINE_COUNT=$(wc -l < .env)
echo ""
echo "Line count: $LINE_COUNT (should be 3)"
if [ "$LINE_COUNT" -ne 3 ]; then
    echo "ERROR: .env file should have exactly 3 lines"
    exit 1
fi
echo "✓ .env file verified"
echo ""

echo "[4/7] Activating virtual environment and updating dependencies..."
source venv/bin/activate
pip install --upgrade pip -q
pip install -r requirements.txt -q
echo "✓ Dependencies updated"
echo ""

echo "[5/7] Verifying python-multipart is installed..."
if pip list | grep -q "python-multipart"; then
    echo "✓ python-multipart is installed: $(pip list | grep python-multipart)"
else
    echo "ERROR: python-multipart not found"
    exit 1
fi
echo ""

echo "[6/7] Restarting PM2 processes..."
pm2 restart baitech-backend
pm2 restart baitech-frontend
echo "✓ PM2 processes restarted"
echo ""

echo "[7/7] Checking PM2 status..."
sleep 3  # Give processes time to start
pm2 status
echo ""

echo "=========================================="
echo "Deployment fixed! Check logs below:"
echo "=========================================="
echo ""

echo "Backend logs (last 20 lines):"
pm2 logs baitech-backend --lines 20 --nostream
echo ""

echo "=========================================="
echo "Quick Fix Complete!"
echo "=========================================="
echo ""
echo "If backend shows errors, run:"
echo "  pm2 logs baitech-backend --lines 50"
echo ""
echo "Expected success message:"
echo "  INFO:     Uvicorn running on http://0.0.0.0:8000"
echo "  INFO:     Application startup complete."
echo ""
