#!/bin/bash
# Script to add swap space on VPS to prevent build failures

echo "🔧 Checking current swap..."
free -h

echo ""
echo "📊 Checking disk space..."
df -h

echo ""
echo "💾 Creating 4GB swap file..."

# Create a 4GB swap file
dd if=/dev/zero of=/swapfile bs=1M count=4096 status=progress

# Set correct permissions
chmod 600 /swapfile

# Make it a swap file
mkswap /swapfile

# Enable swap
swapon /swapfile

# Make it permanent (add to fstab)
echo '/swapfile none swap sw 0 0' >> /etc/fstab

echo ""
echo "✅ Swap file created and enabled!"
echo ""
echo "📊 New memory status:"
free -h

echo ""
echo "💡 Tips:"
echo "  - Swap will prevent 'killed' errors during builds"
echo "  - Consider upgrading VPS RAM if builds still fail"
echo "  - Current swap usage will be low unless RAM is full"
