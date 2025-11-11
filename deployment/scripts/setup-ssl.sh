#!/bin/bash
# SSL Certificate Setup Script using Let's Encrypt

set -e

echo "=========================================="
echo "SSL Certificate Setup"
echo "=========================================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "Please run as root (use sudo)"
    exit 1
fi

# Get domain name
read -p "Enter your domain name (e.g., example.com): " DOMAIN
read -p "Enter your email address: " EMAIL

if [ -z "$DOMAIN" ] || [ -z "$EMAIL" ]; then
    echo "Domain and email are required"
    exit 1
fi

echo ""
echo "Setting up SSL certificate for: $DOMAIN"
echo "Email: $EMAIL"
echo ""

# Stop Nginx temporarily
echo "Stopping Nginx..."
systemctl stop nginx

# Obtain certificate
echo "Obtaining SSL certificate..."
certbot certonly --standalone \
    -d $DOMAIN \
    -d www.$DOMAIN \
    --non-interactive \
    --agree-tos \
    --email $EMAIL \
    --preferred-challenges http

# Update Nginx configuration with actual domain
echo "Updating Nginx configuration..."
sed -i "s/yourdomain.com/$DOMAIN/g" /etc/nginx/sites-available/baitech

# Test Nginx configuration
echo "Testing Nginx configuration..."
nginx -t

# Start Nginx
echo "Starting Nginx..."
systemctl start nginx

# Setup auto-renewal
echo "Setting up certificate auto-renewal..."
systemctl enable certbot.timer
systemctl start certbot.timer

echo ""
echo "=========================================="
echo "SSL Setup completed!"
echo "=========================================="
echo ""
echo "Your site is now accessible at:"
echo "  https://$DOMAIN"
echo "  https://www.$DOMAIN"
echo ""
echo "Certificate will auto-renew before expiry."
echo "Check renewal status: sudo certbot renew --dry-run"
echo ""
