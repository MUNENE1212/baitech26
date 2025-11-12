# Deployment Files Summary

## Overview

All production deployment files have been created for HostAfrica VPS deployment. This document provides a quick reference to all deployment-related files.

---

## Created Files

### 1. Environment Configuration

#### `.env.production` (Backend)
**Location**: `/media/munen/muneneENT/newbaitech/.env.production`

Template for backend production environment variables:
- MongoDB Atlas connection
- SECRET_KEY configuration
- API settings
- CORS origins
- Logging configuration

**Action Required**: Copy to `.env` and update values (especially SECRET_KEY)

#### `.env.production` (Frontend)
**Location**: `/media/munen/muneneENT/newbaitech/baitech-frontend/.env.production`

Template for frontend production environment variables:
- API URL
- Site URL
- App configuration
- Analytics IDs (optional)

**Action Required**: Copy to `.env.production.local` and update with your domain

---

### 2. Nginx Configuration

#### `baitech.conf`
**Location**: `/media/munen/muneneENT/newbaitech/deployment/nginx/baitech.conf`

Complete Nginx reverse proxy configuration with:
- HTTP to HTTPS redirect
- SSL/TLS settings (TLS 1.2 & 1.3)
- Security headers (X-Frame-Options, HSTS, CSP, etc.)
- Gzip compression
- Backend proxy (FastAPI on port 8000) → `/api/`, `/admin/`, `/login`, `/register`, `/logout`
- Frontend proxy (Next.js on port 3000) → `/`
- Static file caching (Next.js assets, images)
- Client max body size: 10M (for image uploads)

**Deployment**: Will be copied to `/etc/nginx/sites-available/baitech` by deploy script

---

### 3. PM2 Process Manager

#### `ecosystem.config.js`
**Location**: `/media/munen/muneneENT/newbaitech/ecosystem.config.js`

PM2 configuration for managing both backend and frontend:

**Backend** (`baitech-backend`):
- 2 instances in cluster mode
- Uvicorn ASGI server
- Port 8000
- Max memory: 500MB
- Auto-restart on failure

**Frontend** (`baitech-frontend`):
- 1 instance in fork mode
- Next.js production server
- Port 3000
- Max memory: 1GB
- Auto-restart on failure

**Usage**: `pm2 start ecosystem.config.js`

---

### 4. Deployment Scripts

All scripts are executable (`chmod +x`) and located in `/media/munen/muneneENT/newbaitech/deployment/scripts/`

#### `setup.sh`
**Purpose**: Initial VPS server setup

**What it does**:
1. Updates system packages
2. Installs Python 3.11
3. Installs Node.js 20.x
4. Installs Nginx
5. Installs Certbot (Let's Encrypt)
6. Installs PM2 globally
7. Creates directories (`/var/www/baitech`, `/var/www/certbot`, logs)
8. Configures firewall (UFW)

**Usage**: `sudo bash deployment/scripts/setup.sh`

**Run Once**: On a fresh Ubuntu or Debian server before deployment

---

#### `deploy.sh`
**Purpose**: Deploy application to server

**What it does**:
1. Creates Python virtual environment
2. Installs Python dependencies (including pillow-heif)
3. Copies and configures backend `.env`
4. Installs frontend dependencies (npm install)
5. Builds Next.js production bundle (npm run build)
6. Configures Nginx with your domain
7. Creates Nginx symlink to sites-enabled
8. Starts PM2 with ecosystem config
9. Saves PM2 config and enables startup
10. Restarts Nginx

**Usage**: `sudo bash deployment/scripts/deploy.sh`

**Interactive**: Prompts for domain name and confirms environment file editing

**Run**: After setup.sh and after cloning repository to `/var/www/baitech`

---

#### `setup-ssl.sh`
**Purpose**: Setup SSL certificate with Let's Encrypt

**What it does**:
1. Prompts for domain and email
2. Stops Nginx temporarily
3. Obtains SSL certificate for domain and www subdomain
4. Updates Nginx config with actual domain
5. Tests Nginx configuration
6. Starts Nginx with SSL enabled
7. Enables auto-renewal timer

**Usage**: `sudo bash deployment/scripts/setup-ssl.sh`

**Run After**: deploy.sh and DNS propagation

**Requirements**:
- Domain must point to server IP
- Ports 80 and 443 must be accessible

---

#### `backup-db.sh`
**Purpose**: Backup MongoDB Atlas database

**What it does**:
1. Reads MongoDB connection string from `.env`
2. Installs MongoDB Database Tools if needed
3. Creates mongodump of entire database
4. Compresses to `.tar.gz`
5. Stores in `/var/www/baitech/backups/`
6. Keeps last 7 backups (deletes older ones)

**Usage**: `sudo bash deployment/scripts/backup-db.sh`

**Output**: `baitech_backup_YYYYMMDD_HHMMSS.tar.gz`

**Automation**: Setup cron job for daily backups:
```cron
0 2 * * * /var/www/baitech/deployment/scripts/backup-db.sh >> /var/www/baitech/logs/backup.log 2>&1
```

---

#### `restore-db.sh`
**Purpose**: Restore MongoDB from backup

**What it does**:
1. Lists available backups
2. Prompts for backup file to restore
3. Confirms restore operation (destructive!)
4. Extracts backup archive
5. Restores to MongoDB Atlas using mongorestore
6. Cleans up temporary files

**Usage**: `sudo bash deployment/scripts/restore-db.sh`

**Warning**: This OVERWRITES your current database!

---

### 5. Documentation

#### `DEPLOYMENT_GUIDE.md`
**Location**: `/media/munen/muneneENT/newbaitech/DEPLOYMENT_GUIDE.md`

**Comprehensive deployment guide** with:

- Prerequisites and requirements
- Step-by-step deployment instructions
- SSL certificate setup
- Database backup/restore procedures
- Monitoring and maintenance commands
- Troubleshooting common issues
- Security best practices
- Quick reference commands
- Architecture overview
- Performance optimization tips
- Deployment checklist

**Length**: ~600 lines covering everything needed for production deployment

---

## Deployment Workflow

### First-Time Deployment

```bash
# 1. Connect to server
ssh root@YOUR_SERVER_IP

# 2. Clone repository
cd /var/www
git clone YOUR_REPO_URL baitech

# 3. Run initial setup
cd baitech
sudo bash deployment/scripts/setup.sh

# 4. Edit environment files
nano .env
nano baitech-frontend/.env.production.local

# 5. Deploy application
sudo bash deployment/scripts/deploy.sh

# 6. Setup SSL (after DNS propagation)
sudo bash deployment/scripts/setup-ssl.sh

# 7. Setup automatic backups
sudo crontab -e
# Add: 0 2 * * * /var/www/baitech/deployment/scripts/backup-db.sh >> /var/www/baitech/logs/backup.log 2>&1

# 8. Verify deployment
pm2 status
pm2 logs
curl https://yourdomain.com
```

### Subsequent Updates

```bash
# 1. Connect to server
ssh root@YOUR_SERVER_IP

# 2. Pull latest code
cd /var/www/baitech
git pull origin main

# 3. Update backend
source venv/bin/activate
pip install -r requirements.txt

# 4. Update frontend
cd baitech-frontend
npm install
npm run build

# 5. Restart services
cd ..
pm2 restart all

# 6. Verify
pm2 logs
```

---

## File Structure

```
/media/munen/muneneENT/newbaitech/
│
├── .env.production                      # Backend environment template
├── ecosystem.config.js                  # PM2 configuration
│
├── baitech-frontend/
│   └── .env.production                  # Frontend environment template
│
├── deployment/
│   ├── nginx/
│   │   └── baitech.conf                 # Nginx configuration
│   │
│   └── scripts/
│       ├── setup.sh                     # Initial server setup
│       ├── deploy.sh                    # Application deployment
│       ├── setup-ssl.sh                 # SSL certificate setup
│       ├── backup-db.sh                 # Database backup
│       └── restore-db.sh                # Database restore
│
├── DEPLOYMENT_GUIDE.md                  # Comprehensive deployment docs
└── DEPLOYMENT_FILES.md                  # This file
```

---

## Server Directory Structure (After Deployment)

```
/var/www/baitech/                        # Application root
│
├── venv/                                # Python virtual environment
├── logs/                                # PM2 logs
│   ├── backend-error.log
│   ├── backend-out.log
│   ├── frontend-error.log
│   └── frontend-out.log
│
├── backups/                             # Database backups
│   ├── baitech_backup_20251112_020000.tar.gz
│   └── ...
│
├── baitech-frontend/
│   ├── .next/                           # Next.js build output
│   ├── public/
│   │   └── images/                      # Product images
│   └── .env.production.local            # Frontend env (production)
│
├── .env                                 # Backend env (production)
├── main.py                              # FastAPI entry point
├── ecosystem.config.js                  # PM2 config
├── requirements.txt                     # Python dependencies
└── deployment/
    ├── nginx/
    │   └── baitech.conf
    └── scripts/
        └── ...
```

---

## Environment Variables Reference

### Backend (.env)

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGO_URL` | MongoDB Atlas connection string | `mongodb+srv://...` |
| `MONGO_DB` | Database name | `baitekdb` |
| `SECRET_KEY` | JWT signing key | `YOUR_SECRET_KEY` |
| `API_HOST` | API bind address | `0.0.0.0` |
| `API_PORT` | API port | `8000` |
| `FRONTEND_URL` | Frontend domain | `https://yourdomain.com` |
| `CORS_ORIGINS` | Allowed CORS origins | `https://yourdomain.com,...` |
| `ENVIRONMENT` | Environment name | `production` |
| `LOG_LEVEL` | Logging level | `INFO` |

### Frontend (.env.production.local)

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `https://yourdomain.com/api` |
| `NEXT_PUBLIC_SITE_URL` | Site URL | `https://yourdomain.com` |
| `NEXT_PUBLIC_APP_ENV` | Environment | `production` |
| `NEXT_PUBLIC_APP_NAME` | App name | `Baitech` |
| `NEXT_PUBLIC_GA_ID` | Google Analytics ID (optional) | `G-XXXXXXXXXX` |
| `NEXT_PUBLIC_GTM_ID` | Google Tag Manager ID (optional) | `GTM-XXXXXXX` |

---

## Port Allocation

| Service | Port | Access |
|---------|------|--------|
| Nginx | 80 | Public (HTTP → HTTPS redirect) |
| Nginx | 443 | Public (HTTPS) |
| FastAPI | 8000 | Internal (via Nginx proxy) |
| Next.js | 3000 | Internal (via Nginx proxy) |

---

## Security Checklist

- [ ] New SECRET_KEY generated for production
- [ ] `.env` files not committed to git
- [ ] MongoDB Atlas IP whitelist configured
- [ ] Firewall enabled (UFW)
- [ ] SSH key authentication (disable password auth)
- [ ] SSL certificate installed
- [ ] Security headers configured (Nginx)
- [ ] Admin password changed
- [ ] Regular backups enabled
- [ ] Fail2Ban installed (optional)

---

## Monitoring Commands

```bash
# View application status
pm2 status

# View logs (all)
pm2 logs

# View logs (specific service)
pm2 logs baitech-backend
pm2 logs baitech-frontend

# Monitor resources
pm2 monit

# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# System resources
df -h        # Disk space
free -h      # Memory
top          # CPU & processes
```

---

## Backup & Restore

### Create Backup

```bash
sudo bash /var/www/baitech/deployment/scripts/backup-db.sh
```

### List Backups

```bash
ls -lh /var/www/baitech/backups/
```

### Restore Backup

```bash
sudo bash /var/www/baitech/deployment/scripts/restore-db.sh
```

### Download Backup to Local Machine

```bash
scp root@YOUR_SERVER_IP:/var/www/baitech/backups/baitech_backup_*.tar.gz ./
```

---

## Quick Troubleshooting

### Application Not Accessible

1. Check PM2 status: `pm2 status`
2. Check Nginx: `sudo systemctl status nginx`
3. Check firewall: `sudo ufw status`
4. Check logs: `pm2 logs`

### Backend Errors

1. Check logs: `pm2 logs baitech-backend`
2. Check MongoDB connection: MongoDB Atlas → Network Access
3. Restart: `pm2 restart baitech-backend`

### Frontend Errors

1. Check logs: `pm2 logs baitech-frontend`
2. Rebuild: `cd baitech-frontend && npm run build`
3. Restart: `pm2 restart baitech-frontend`

### 502 Bad Gateway

- Backend not running: `pm2 restart baitech-backend`
- Port conflict: `sudo lsof -i :8000`

### SSL Issues

1. Check certificate: `sudo certbot certificates`
2. Renew: `sudo certbot renew`
3. Check Nginx config: `sudo nginx -t`

---

## Additional Resources

- **PM2**: https://pm2.keymetrics.io/docs/
- **Nginx**: https://nginx.org/en/docs/
- **Certbot**: https://certbot.eff.org/
- **MongoDB Atlas**: https://docs.atlas.mongodb.com/
- **Next.js Deployment**: https://nextjs.org/docs/deployment

---

## Summary

All deployment files are ready for HostAfrica VPS deployment (Ubuntu/Debian):

✅ Environment configuration templates
✅ Nginx reverse proxy configuration
✅ PM2 process manager configuration
✅ Automated deployment scripts
✅ SSL/HTTPS setup script
✅ Database backup/restore scripts
✅ Comprehensive deployment documentation

**Next Step**: Follow the [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for step-by-step deployment instructions.

---

**Created**: November 12, 2025
**Status**: Ready for Production Deployment
