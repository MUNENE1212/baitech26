# BAITECH VPS Deployment Guide

This guide covers deploying BAITECH e-commerce application to a VPS.

## Prerequisites

- VPS with Ubuntu 20.04+ or similar Linux distribution
- Domain name pointed to VPS IP
- SSH access to VPS
- MongoDB Atlas account (for database)
- Cloudinary account (for image storage)

## Quick Start

### 1. Initial VPS Setup

```bash
# Update system
ssh root@your-vps-ip
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Install Nginx
apt install nginx -y
```

### 2. Setup Application

```bash
# Clone repository
git clone git@github.com:MUNENE1212/baitech26.git
cd baitech26

# Copy environment template
cp .env.local.example .env.local

# Edit environment variables
nano .env.local
```

### 3. Configure Environment Variables

Edit `.env.local` with your values:

```env
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/baitech

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# JWT Secret (generate a strong random string)
JWT_SECRET=your-super-secret-jwt-key-here

# Admin Credentials (for seeding)
ADMIN_EMAIL=admin@baitech.co.ke
ADMIN_PASSWORD=secure-admin-password

# App URL
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### 4. Build and Deploy

```bash
# Build Docker image
docker-compose build

# Start application
docker-compose up -d

# Check logs
docker-compose logs -f
```

### 5. Configure Nginx Reverse Proxy

```bash
# Create nginx config
nano /etc/nginx/sites-available/baitech
```

Add the following configuration:

```nginx
upstream backend {
    server localhost:3000;
}

server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL certificates (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Proxy settings
    location / {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Static files caching
    location /_next/static {
        proxy_pass http://backend;
        proxy_cache_valid 200 365d;
        add_header Cache-Control "public, immutable";
    }

    # Images caching
    location /images {
        proxy_pass http://backend;
        proxy_cache_valid 200 30d;
        add_header Cache-Control "public";
    }
}
```

Enable the site:

```bash
ln -s /etc/nginx/sites-available/baitech /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### 6. Setup SSL with Let's Encrypt

```bash
# Install Certbot
apt install certbot python3-certbot-nginx -y

# Obtain SSL certificate
certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal is configured automatically
```

### 7. Seed Admin User

```bash
# From within the container
docker-compose exec web npm run seed:admin
```

### 8. Setup Redis (Optional - for caching)

```bash
# Using Docker Compose Redis service
docker-compose -f docker-compose.redis.yml up -d redis

# Update .env.local with Redis URL
REDIS_URL=redis://redis:6379
```

## Monitoring and Maintenance

### View Logs

```bash
# Application logs
docker-compose logs -f web

# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Restart Application

```bash
docker-compose restart web
```

### Update Application

```bash
git pull
docker-compose down
docker-compose build
docker-compose up -d
```

### Backup Database

Use MongoDB Atlas backup features or export manually:

```bash
# From local machine
mongodump --uri="mongodb+srv://username:password@cluster.mongodb.net/baitech" --out=backup-$(date +%Y%m%d)
```

## Security Best Practices

1. **Keep system updated**: `apt update && apt upgrade -y`
2. **Use strong passwords**: For admin, database, and JWT secret
3. **Enable firewall**: Only allow necessary ports (80, 443, 22)
4. **Disable root login**: SSH key-based authentication only
5. **Regular backups**: Set up automated database backups
6. **Monitor logs**: Check for suspicious activity
7. **SSL certificates**: Ensure auto-renewal is working

## Performance Optimization

1. **Enable caching**: Configure Redis for session and data caching
2. **CDN for images**: Cloudinary provides CDN
3. **Gzip compression**: Enabled in Next.js by default
4. **Database indexing**: Ensure proper indexes on frequently queried fields
5. **Monitor resources**: Use `docker stats` to monitor resource usage

## Troubleshooting

### Application won't start

```bash
# Check logs
docker-compose logs web

# Check environment variables
docker-compose config
```

### 502 Bad Gateway

```bash
# Check if app is running
docker-compose ps

# Check nginx configuration
nginx -t

# Restart nginx
systemctl restart nginx
```

### Database connection issues

```bash
# Verify MongoDB URI
echo $MONGODB_URI

# Check MongoDB Atlas whitelist
# Ensure VPS IP is whitelisted
```

## PWA Features

The application includes Progressive Web App features:
- Offline support
- Install to home screen
- Push notifications (ready to implement)
- App-like experience

## Support

For issues and questions:
- Check logs: `docker-compose logs -f`
- Review MongoDB Atlas status
- Verify Cloudinary configuration
- Check Nginx error logs

## Cost Estimation

- VPS: $5-20/month (depending on specs)
- MongoDB Atlas: Free tier available, then $9+/month
- Cloudinary: Free tier available
- Domain: $10-15/year
- SSL: Free (Let's Encrypt)

Total: ~$20-40/month for production setup
