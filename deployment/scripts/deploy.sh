#!/bin/bash
# Baitech Deployment Script
# Run this after setup.sh to deploy the application

set -e

APP_DIR="/var/www/baitech"
FRONTEND_DIR="$APP_DIR/baitech-frontend"

echo "=========================================="
echo "Baitech Deployment Script"
echo "=========================================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "Please run as root (use sudo)"
    exit 1
fi

# Check if app directory exists
if [ ! -d "$APP_DIR" ]; then
    echo "Error: $APP_DIR does not exist"
    echo "Please clone your repository first:"
    echo "  cd /var/www && git clone <your-repo-url> baitech"
    exit 1
fi

cd $APP_DIR

echo "Creating Python virtual environment..."
python3.11 -m venv venv
source venv/bin/activate

echo "Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

echo "Installing pillow-heif for AVIF support..."
pip install pillow-heif

echo "Setting up backend environment..."
if [ ! -f .env ]; then
    if [ -f .env.production.example ]; then
        echo "Creating .env from .env.production.example template..."
        cp .env.production.example .env
    else
        echo "Creating .env from .env.production template..."
        cp .env.production .env
    fi
    echo ""
    echo "⚠️  IMPORTANT: Edit /var/www/baitech/.env with your production values!"
    echo "   Especially:"
    echo "   - MONGO_URL (MongoDB Atlas connection string)"
    echo "   - SECRET_KEY (generate a new one!)"
    echo "   - FRONTEND_URL (your domain)"
    echo "   - CORS_ORIGINS (your domain)"
    echo ""
    echo "Generate SECRET_KEY with:"
    echo "  python3 -c \"import secrets; print(secrets.token_urlsafe(32))\""
    echo ""
    read -p "Press Enter to continue after editing .env..."
fi

echo "Installing frontend dependencies..."
cd $FRONTEND_DIR
npm install

echo "Setting up frontend environment..."
if [ ! -f .env.production.local ]; then
    if [ -f .env.production.example ]; then
        echo "Creating .env.production.local from .env.production.example template..."
        cp .env.production.example .env.production.local
    else
        echo "Creating .env.production.local from .env.production template..."
        cp .env.production .env.production.local
    fi
    echo ""
    echo "⚠️  IMPORTANT: Edit $FRONTEND_DIR/.env.production.local with your production values!"
    echo "   Especially:"
    echo "   - NEXT_PUBLIC_API_URL (your domain/IP)"
    echo "   - NEXT_PUBLIC_SITE_URL (your domain)"
    echo ""
    read -p "Press Enter to continue after editing .env.production.local..."
fi

echo "Building Next.js frontend..."
npm run build

echo "Setting up Nginx configuration..."
if [ ! -f /etc/nginx/sites-available/baitech ]; then
    cp $APP_DIR/deployment/nginx/baitech.conf /etc/nginx/sites-available/baitech

    echo ""
    echo "⚠️  IMPORTANT: Edit /etc/nginx/sites-available/baitech"
    echo "   Replace 'yourdomain.com' with your actual domain"
    echo ""
    read -p "Enter your domain name: " DOMAIN
    sed -i "s/yourdomain.com/$DOMAIN/g" /etc/nginx/sites-available/baitech

    # Create symlink
    ln -sf /etc/nginx/sites-available/baitech /etc/nginx/sites-enabled/

    # Remove default site
    rm -f /etc/nginx/sites-enabled/default

    # Test Nginx configuration
    nginx -t
fi

echo "Setting up PM2..."
cd $APP_DIR
pm2 delete all 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd -u root --hp /root

echo "Restarting Nginx..."
systemctl restart nginx

echo ""
echo "=========================================="
echo "Deployment completed!"
echo "=========================================="
echo ""
echo "Application status:"
pm2 status
echo ""
echo "Next steps:"
echo "1. Setup SSL certificate: sudo bash $APP_DIR/deployment/scripts/setup-ssl.sh"
echo "2. Check logs: pm2 logs"
echo "3. Monitor: pm2 monit"
echo ""
