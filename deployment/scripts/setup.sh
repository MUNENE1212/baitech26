#!/bin/bash
# Baitech VPS Setup Script for HostAfrica
# Run this script on a fresh Ubuntu or Debian server

set -e

echo "=========================================="
echo "Baitech VPS Setup Script"
echo "=========================================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "Please run as root (use sudo)"
    exit 1
fi

# Update system
echo "Updating system packages..."
apt update && apt upgrade -y

# Install essential packages
echo "Installing essential packages..."
apt install -y curl wget git build-essential software-properties-common

# Detect OS
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
else
    OS=$(lsb_release -si 2>/dev/null || echo "unknown")
fi

# Install Python 3.11
echo "Installing Python 3.11..."
if [ "$OS" = "ubuntu" ]; then
    add-apt-repository -y ppa:deadsnakes/ppa
    apt update
fi
apt install -y python3.11 python3.11-venv python3.11-dev python3-pip

# Install Node.js 20.x
echo "Installing Node.js 20.x..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install Nginx
echo "Installing Nginx..."
apt install -y nginx

# Install Certbot for SSL
echo "Installing Certbot..."
apt install -y certbot python3-certbot-nginx

# Install PM2 globally
echo "Installing PM2..."
npm install -g pm2

# Install UFW firewall
echo "Installing UFW firewall..."
apt install -y ufw

# Create application directory
echo "Creating application directory..."
mkdir -p /var/www/baitech
mkdir -p /var/www/baitech/logs
mkdir -p /var/www/certbot

# Set up firewall
echo "Configuring firewall..."
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

echo ""
echo "=========================================="
echo "System setup completed!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Clone your repository to /var/www/baitech"
echo "2. Run deploy.sh to deploy the application"
echo ""
