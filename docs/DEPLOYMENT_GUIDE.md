# Baitech Production Deployment Guide

## HostAfrica VPS Deployment

This guide will help you deploy the Baitech e-commerce platform to a HostAfrica VPS server.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Server Requirements](#server-requirements)
3. [Initial Server Setup](#initial-server-setup)
4. [Application Deployment](#application-deployment)
5. [SSL Certificate Setup](#ssl-certificate-setup)
6. [Database Backups](#database-backups)
7. [Monitoring & Maintenance](#monitoring--maintenance)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, ensure you have:

- A HostAfrica VPS server with Ubuntu 20.04 or 22.04
- SSH access to your server (root or sudo user)
- A domain name pointed to your server's IP address
- MongoDB Atlas account (already configured)
- Your repository pushed to GitHub/GitLab

### Domain DNS Configuration

Point your domain to your VPS server:

```
Type: A Record
Name: @
Value: YOUR_SERVER_IP

Type: A Record
Name: www
Value: YOUR_SERVER_IP
```

Wait for DNS propagation (5-30 minutes).

---

## Server Requirements

### Minimum Specifications

- **RAM**: 2GB minimum (4GB recommended)
- **CPU**: 2 vCPU cores
- **Storage**: 20GB SSD minimum
- **OS**: Ubuntu 20.04 or 22.04 LTS

### Software Stack

The deployment scripts will install:

- Python 3.11
- Node.js 20.x
- Nginx
- PM2 (Process Manager)
- Certbot (Let's Encrypt SSL)
- MongoDB Tools (for backups)

---

## Initial Server Setup

### Step 1: Connect to Your Server

```bash
ssh root@YOUR_SERVER_IP
```

Or if using a non-root user:

```bash
ssh your_username@YOUR_SERVER_IP
```

### Step 2: Clone Your Repository

```bash
cd /var/www
git clone https://github.com/YOUR_USERNAME/baitech.git baitech
# OR
git clone YOUR_REPO_URL baitech
```

### Step 3: Run Initial Setup Script

This installs all required system packages:

```bash
cd /var/www/baitech
sudo bash deployment/scripts/setup.sh
```

The setup script will:
- Update system packages
- Install Python 3.11
- Install Node.js 20.x
- Install Nginx
- Install Certbot for SSL
- Install PM2 globally
- Create necessary directories
- Configure firewall

**This takes 5-10 minutes.**

---

## Application Deployment

### Step 1: Configure Environment Variables

#### Backend Environment

Edit the backend `.env` file:

```bash
cd /var/www/baitech
nano .env
```

Update these critical values:

```bash
# MongoDB (already configured)
MONGO_URL=mongodb+srv://baitech:ix5YYaOLtX0r2LTe@cluster0.nmtob1l.mongodb.net/baitekdb?appName=Cluster0
MONGO_DB=baitekdb

# IMPORTANT: Generate a new secret key!
SECRET_KEY=YOUR_NEW_SECRET_KEY_HERE

# Your domain
FRONTEND_URL=https://yourdomain.com

# CORS (your domain)
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Leave these as-is
API_HOST=0.0.0.0
API_PORT=8000
ENVIRONMENT=production
LOG_LEVEL=INFO
```

**Generate a new SECRET_KEY:**

```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

Copy the output and replace `YOUR_NEW_SECRET_KEY_HERE`.

#### Frontend Environment

Edit the frontend environment file:

```bash
cd /var/www/baitech/baitech-frontend
nano .env.production.local
```

Update:

```bash
# Your domain
NEXT_PUBLIC_API_URL=https://yourdomain.com/api
NEXT_PUBLIC_SITE_URL=https://yourdomain.com

# App config (leave as-is)
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_APP_NAME=Baitech
NEXT_PUBLIC_APP_DESCRIPTION=Premium technology products and professional tech services in Kenya

# Optional: Add analytics IDs later
# NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
# NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
```

### Step 2: Run Deployment Script

```bash
cd /var/www/baitech
sudo bash deployment/scripts/deploy.sh
```

The deployment script will:
1. Create Python virtual environment
2. Install Python dependencies (including pillow-heif for AVIF)
3. Copy and configure backend `.env`
4. Install frontend dependencies
5. Build Next.js production bundle
6. Configure Nginx (you'll be prompted for your domain)
7. Setup PM2 process manager
8. Start both backend and frontend
9. Enable PM2 startup on boot

**This takes 10-15 minutes.**

When prompted:
- Enter your domain name (e.g., `example.com`)
- Press Enter after editing environment files

### Step 3: Verify Deployment

Check that both services are running:

```bash
pm2 status
```

You should see:

```
┌─────┬──────────────────┬─────────┬─────────┬──────────┐
│ id  │ name             │ status  │ cpu     │ memory   │
├─────┼──────────────────┼─────────┼─────────┼──────────┤
│ 0   │ baitech-backend  │ online  │ 0%      │ 150 MB   │
│ 1   │ baitech-frontend │ online  │ 0%      │ 200 MB   │
└─────┴──────────────────┴─────────┴─────────┴──────────┘
```

Check Nginx status:

```bash
systemctl status nginx
```

Test your site (without SSL for now):

```bash
curl http://YOUR_SERVER_IP
```

---

## SSL Certificate Setup

### Step 1: Ensure DNS is Propagated

Verify your domain points to your server:

```bash
dig +short yourdomain.com
# Should return your server IP
```

### Step 2: Run SSL Setup Script

```bash
cd /var/www/baitech
sudo bash deployment/scripts/setup-ssl.sh
```

When prompted:
- Enter your domain name (e.g., `example.com`)
- Enter your email address (for renewal notifications)

The script will:
1. Stop Nginx temporarily
2. Obtain SSL certificate from Let's Encrypt
3. Update Nginx configuration with your domain
4. Start Nginx with SSL enabled
5. Setup auto-renewal

**This takes 2-3 minutes.**

### Step 3: Verify SSL

Visit your site:

```
https://yourdomain.com
https://www.yourdomain.com
```

Both should work with a valid SSL certificate (green padlock).

Check SSL rating:

```
https://www.ssllabs.com/ssltest/analyze.html?d=yourdomain.com
```

You should get an **A** or **A+** rating.

### Certificate Auto-Renewal

Certificates auto-renew before expiry. Test renewal:

```bash
sudo certbot renew --dry-run
```

---

## Database Backups

### Automatic Backups

Setup daily automatic backups with cron:

```bash
sudo crontab -e
```

Add this line (daily at 2 AM):

```cron
0 2 * * * /var/www/baitech/deployment/scripts/backup-db.sh >> /var/www/baitech/logs/backup.log 2>&1
```

### Manual Backup

Create a backup anytime:

```bash
sudo bash /var/www/baitech/deployment/scripts/backup-db.sh
```

Backups are stored in: `/var/www/baitech/backups/`

The script:
- Creates a MongoDB dump from Atlas
- Compresses to `.tar.gz`
- Keeps last 7 backups (deletes older ones)

### Restore from Backup

List available backups:

```bash
ls -lh /var/www/baitech/backups/
```

Restore:

```bash
sudo bash /var/www/baitech/deployment/scripts/restore-db.sh
```

Follow the prompts to select a backup file.

⚠️ **WARNING**: Restore will OVERWRITE your current database!

---

## Monitoring & Maintenance

### PM2 Monitoring

**View logs:**

```bash
pm2 logs
pm2 logs baitech-backend
pm2 logs baitech-frontend
```

**Monitor resources:**

```bash
pm2 monit
```

**View detailed info:**

```bash
pm2 show baitech-backend
pm2 show baitech-frontend
```

### Application Updates

When you update your code:

```bash
cd /var/www/baitech

# Pull latest changes
git pull origin main

# Backend updates
source venv/bin/activate
pip install -r requirements.txt

# Frontend updates
cd baitech-frontend
npm install
npm run build

# Restart services
cd ..
pm2 restart all

# Or restart individually
pm2 restart baitech-backend
pm2 restart baitech-frontend
```

### Nginx Logs

**Access logs:**

```bash
tail -f /var/log/nginx/access.log
```

**Error logs:**

```bash
tail -f /var/log/nginx/error.log
```

**Test Nginx config after changes:**

```bash
sudo nginx -t
sudo systemctl reload nginx
```

### System Resources

**Check disk space:**

```bash
df -h
```

**Check memory:**

```bash
free -h
```

**Check CPU:**

```bash
top
# or
htop
```

### Cleanup

**Clean old PM2 logs:**

```bash
pm2 flush
```

**Clean old backups (keeps last 7):**

```bash
cd /var/www/baitech/backups
ls -t baitech_backup_*.tar.gz | tail -n +8 | xargs rm
```

**Clean APT cache:**

```bash
sudo apt clean
sudo apt autoremove
```

---

## Troubleshooting

### Backend Not Starting

**Check logs:**

```bash
pm2 logs baitech-backend --lines 100
```

**Common issues:**

1. **ModuleNotFoundError**: Missing Python packages
   ```bash
   cd /var/www/baitech
   source venv/bin/activate
   pip install -r requirements.txt
   pm2 restart baitech-backend
   ```

2. **MongoDB connection error**: Check `.env` has correct `MONGO_URL`

3. **Port 8000 already in use**:
   ```bash
   sudo lsof -i :8000
   # Kill the process
   sudo kill -9 PID
   pm2 restart baitech-backend
   ```

### Frontend Not Starting

**Check logs:**

```bash
pm2 logs baitech-frontend --lines 100
```

**Common issues:**

1. **Build failed**: Rebuild
   ```bash
   cd /var/www/baitech/baitech-frontend
   rm -rf .next
   npm run build
   pm2 restart baitech-frontend
   ```

2. **Port 3000 in use**:
   ```bash
   sudo lsof -i :3000
   sudo kill -9 PID
   pm2 restart baitech-frontend
   ```

### Nginx Issues

**Test configuration:**

```bash
sudo nginx -t
```

**Restart Nginx:**

```bash
sudo systemctl restart nginx
```

**Check if Nginx is running:**

```bash
sudo systemctl status nginx
```

**Common issues:**

1. **502 Bad Gateway**: Backend not running
   ```bash
   pm2 status
   pm2 restart baitech-backend
   ```

2. **504 Gateway Timeout**: Increase timeout in Nginx config
   ```nginx
   proxy_read_timeout 300s;
   proxy_connect_timeout 75s;
   ```

### SSL Certificate Issues

**Check certificate expiry:**

```bash
sudo certbot certificates
```

**Renew manually:**

```bash
sudo certbot renew
sudo systemctl reload nginx
```

**Certificate not found**: Re-run SSL setup
```bash
sudo bash /var/www/baitech/deployment/scripts/setup-ssl.sh
```

### Database Issues

**Can't connect to MongoDB Atlas:**

1. Check IP whitelist in MongoDB Atlas:
   - Go to MongoDB Atlas → Network Access
   - Add your server IP: `YOUR_SERVER_IP/32`
   - Or allow all IPs: `0.0.0.0/0` (less secure)

2. Verify connection string in `.env`

**Test connection:**

```bash
cd /var/www/baitech
source venv/bin/activate
python3 -c "from utils.database import db; import asyncio; asyncio.run(db.products.find_one())"
```

### Out of Memory

**Increase swap space:**

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Make permanent
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### Firewall Blocking Traffic

**Check firewall status:**

```bash
sudo ufw status
```

**Ensure required ports are open:**

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

---

## Security Best Practices

### 1. Change Default Passwords

Update admin password after deployment:

```bash
cd /var/www/baitech
source venv/bin/activate
python3 setup_admin.py
```

### 2. Secure SSH

Edit SSH config:

```bash
sudo nano /etc/ssh/sshd_config
```

Recommended settings:

```
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
```

Restart SSH:

```bash
sudo systemctl restart sshd
```

### 3. Keep Software Updated

```bash
sudo apt update && sudo apt upgrade -y
```

### 4. Monitor Access Logs

```bash
tail -f /var/log/nginx/access.log | grep -v "bot\|spider"
```

### 5. Setup Fail2Ban (Optional)

Protect against brute-force attacks:

```bash
sudo apt install fail2ban -y
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

---

## Quick Reference Commands

### Application Management

```bash
# View status
pm2 status

# Restart all
pm2 restart all

# Restart specific service
pm2 restart baitech-backend
pm2 restart baitech-frontend

# View logs
pm2 logs

# Monitor resources
pm2 monit

# Stop all
pm2 stop all

# Start all
pm2 start ecosystem.config.js
```

### Nginx

```bash
# Test config
sudo nginx -t

# Reload config
sudo systemctl reload nginx

# Restart
sudo systemctl restart nginx

# View logs
tail -f /var/log/nginx/error.log
```

### Database

```bash
# Backup
sudo bash /var/www/baitech/deployment/scripts/backup-db.sh

# Restore
sudo bash /var/www/baitech/deployment/scripts/restore-db.sh
```

### SSL

```bash
# Check certificates
sudo certbot certificates

# Renew
sudo certbot renew

# Test renewal
sudo certbot renew --dry-run
```

---

## Architecture Overview

```
Internet
   │
   ▼
[Nginx :80/:443]
   │
   ├─► [Next.js :3000] ────┐
   │                       │
   └─► [FastAPI :8000] ────┤
                           │
                           ▼
                    [MongoDB Atlas]
```

**Request Flow:**

1. User visits `https://yourdomain.com`
2. Nginx receives request on port 443 (HTTPS)
3. Nginx routes based on path:
   - `/api/*` → FastAPI backend (port 8000)
   - `/admin/*` → FastAPI backend (port 8000)
   - `/*` → Next.js frontend (port 3000)
4. Next.js may call FastAPI internally for data
5. FastAPI queries MongoDB Atlas
6. Response flows back through Nginx to user

**Process Management:**

- **PM2** manages both Node.js (Next.js) and Python (FastAPI via uvicorn)
- Auto-restarts on crashes
- Auto-starts on server reboot
- Cluster mode for backend (2 instances)

---

## Performance Optimization

### 1. Enable Nginx Caching (Optional)

Add to Nginx config:

```nginx
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m max_size=1g inactive=60m;

location /api/ {
    proxy_cache api_cache;
    proxy_cache_valid 200 5m;
    proxy_cache_bypass $http_cache_control;
    add_header X-Cache-Status $upstream_cache_status;
    # ... existing proxy settings
}
```

### 2. Optimize Images (Already Done)

Images are already optimized with:
- Multiple sizes (thumbnail/medium/large)
- WebP format (~30% smaller)
- AVIF support (~50% smaller)
- Next.js automatic optimization

### 3. Monitor Performance

Use PM2 monitoring:

```bash
pm2 install pm2-metrics
pm2 web
```

Access metrics at: `http://YOUR_SERVER_IP:9615`

---

## Support & Resources

### Logs Locations

- **PM2 Backend**: `/var/www/baitech/logs/backend-*.log`
- **PM2 Frontend**: `/var/www/baitech/logs/frontend-*.log`
- **Nginx Access**: `/var/log/nginx/access.log`
- **Nginx Error**: `/var/log/nginx/error.log`
- **Backup Logs**: `/var/www/baitech/logs/backup.log`

### Important Files

- **Backend Env**: `/var/www/baitech/.env`
- **Frontend Env**: `/var/www/baitech/baitech-frontend/.env.production.local`
- **Nginx Config**: `/etc/nginx/sites-available/baitech`
- **PM2 Config**: `/var/www/baitech/ecosystem.config.js`
- **SSL Certs**: `/etc/letsencrypt/live/yourdomain.com/`

### Useful Links

- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt](https://letsencrypt.org/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

---

## Deployment Checklist

Before going live:

- [ ] DNS points to server IP
- [ ] Server setup script completed
- [ ] Environment variables configured (backend & frontend)
- [ ] Application deployed successfully
- [ ] PM2 services running (backend & frontend)
- [ ] SSL certificate installed
- [ ] HTTPS working (green padlock)
- [ ] Admin login working
- [ ] Product images loading
- [ ] MongoDB Atlas IP whitelisted
- [ ] Automatic backups configured (cron)
- [ ] Firewall enabled
- [ ] Test all main features
- [ ] Monitor logs for errors
- [ ] Setup monitoring/alerts (optional)

---

## Success!

Your Baitech e-commerce platform is now deployed and running on HostAfrica VPS! 🚀

**Access your site:**
- Frontend: `https://yourdomain.com`
- Admin Panel: `https://yourdomain.com/admin`

**Next Steps:**

1. Add products via admin panel
2. Test checkout flow
3. Setup analytics (Google Analytics, etc.)
4. Monitor performance and errors
5. Setup regular backups (cron job)

For issues or questions, check the [Troubleshooting](#troubleshooting) section above.

---

**Generated with Claude Code** - November 12, 2025
