# Deployment Files for Baitech

This directory contains all deployment-related configuration files and scripts for the Baitech platform.

## Quick Start on Server

If the backend is crashing with `.env` or dependency errors, run the quick fix script:

```bash
cd /var/www/baitech
bash deployment/server_quickfix.sh
```

This script will:
1. Pull latest code changes
2. Create correct .env file with all required variables
3. Update Python dependencies
4. Restart PM2 processes
5. Show status and logs

## Files in this Directory

### Scripts

- **server_quickfix.sh** - Automated fix script for common deployment issues
  - Fixes .env file configuration
  - Updates dependencies
  - Restarts services
  - Validates installation

### Configuration Files

- **nginx/baitech.conf** - Nginx reverse proxy configuration
  - HTTP to HTTPS redirect
  - SSL/TLS configuration
  - Backend proxy (FastAPI on port 8000)
  - Frontend proxy (Next.js on port 3000)
  - Security headers
  - Gzip compression

### Documentation

- **DEPLOYMENT_CHECKLIST.md** (in project root) - Complete step-by-step deployment guide
  - Prerequisites
  - 12-step deployment process
  - Troubleshooting guide
  - Verification checklist

## Common Deployment Tasks

### Fix Backend Crashes

If backend shows `TypeError: name must be an instance of str, not <class 'NoneType'>`:

```bash
# Quick fix
cd /var/www/baitech
bash deployment/server_quickfix.sh
```

Or manually:

```bash
cd /var/www/baitech

# Create correct .env
cat > .env <<'EOF'
MONGO_URL=mongodb+srv://baitech:ix5YYaOLtX0r2LTe@cluster0.nmtob1l.mongodb.net/baitekdb?retryWrites=true&w=majority
MONGO_DB=baitekdb
SECRET_KEY=D8LqbGKChHXuXNU6ddQUQGu6xeg6gkyQ6bd9axNsnzc
EOF

# Restart backend
pm2 restart baitech-backend
pm2 logs baitech-backend --lines 20
```

### Update After Code Changes

```bash
cd /var/www/baitech
git pull origin master

# Update backend
source venv/bin/activate
pip install -r requirements.txt
pm2 restart baitech-backend

# Update frontend
cd baitech-frontend
npm install
npm run build
pm2 restart baitech-frontend
```

### View Logs

```bash
# All processes
pm2 logs --lines 50

# Backend only
pm2 logs baitech-backend --lines 30

# Frontend only
pm2 logs baitech-frontend --lines 30

# Real-time monitoring
pm2 monit
```

### Check Status

```bash
pm2 status
pm2 describe baitech-backend
pm2 describe baitech-frontend
```

### Restart Services

```bash
# Restart all
pm2 restart all

# Restart specific service
pm2 restart baitech-backend
pm2 restart baitech-frontend

# Reload without downtime (0-downtime restart)
pm2 reload all
```

## Environment Variables Required

The `.env` file MUST contain these three lines:

```bash
MONGO_URL=mongodb+srv://baitech:ix5YYaOLtX0r2LTe@cluster0.nmtob1l.mongodb.net/baitekdb?retryWrites=true&w=majority
MONGO_DB=baitekdb
SECRET_KEY=D8LqbGKChHXuXNU6ddQUQGu6xeg6gkyQ6bd9axNsnzc
```

Common `.env` mistakes:
- Duplicate `MONGO_URL` entries (causes parsing errors)
- Missing `MONGO_DB` line (causes TypeError: NoneType)
- Extra whitespace or quotes around values
- Wrong MongoDB connection string format

## Server Information

- **Domain**: baitech.co.ke
- **IP**: 102.68.86.184
- **OS**: Debian 12
- **Python**: 3.11
- **Node.js**: 18+
- **Web Server**: Nginx
- **Process Manager**: PM2
- **Database**: MongoDB Atlas

## Port Configuration

- **80** - HTTP (redirects to 443)
- **443** - HTTPS (Nginx)
- **3000** - Next.js frontend (internal, proxied by Nginx)
- **8000** - FastAPI backend (internal, proxied by Nginx)

## Nginx Configuration

The Nginx config handles:
- SSL/TLS termination
- HTTP to HTTPS redirect
- API routes (`/api/*`) → Backend (port 8000)
- Admin routes (`/admin/*`) → Backend (port 8000)
- Auth routes (`/login`, `/register`, `/logout`) → Backend (port 8000)
- Everything else (`/`) → Frontend (port 3000)

To apply Nginx changes:

```bash
# Test config
sudo nginx -t

# Reload
sudo systemctl reload nginx

# Restart (only if reload doesn't work)
sudo systemctl restart nginx
```

## SSL Certificates (Let's Encrypt)

Certificates should be located at:
- Certificate: `/etc/letsencrypt/live/baitech.co.ke/fullchain.pem`
- Private Key: `/etc/letsencrypt/live/baitech.co.ke/privkey.pem`

To renew certificates:

```bash
sudo certbot renew
sudo systemctl reload nginx
```

## Troubleshooting

### Backend won't start
1. Check `.env` file has all 3 required lines
2. Check MongoDB connection (test with `ping cluster0.nmtob1l.mongodb.net`)
3. Check all dependencies installed: `pip list | grep -E "fastapi|motor|pymongo|python-multipart"`
4. Check logs: `pm2 logs baitech-backend --lines 50`

### Frontend shows 502 Bad Gateway
1. Backend is down - check backend status
2. Nginx can't connect - check Nginx config
3. Wrong port - verify backend runs on 8000, frontend on 3000

### CORS errors in browser
1. Verify `main.py` includes your domain in CORS origins
2. Restart backend after CORS changes
3. Clear browser cache

### PM2 processes don't auto-restart after server reboot
```bash
# Save current PM2 config
pm2 save

# Setup startup script
pm2 startup systemd
# Copy and run the command shown

# Verify
sudo reboot
# After reboot:
pm2 status
```

## Getting Help

For detailed step-by-step instructions, see:
- `/DEPLOYMENT_CHECKLIST.md` in project root
- PM2 documentation: https://pm2.keymetrics.io/
- Nginx documentation: https://nginx.org/en/docs/

## Security Notes

- Keep `.env` file secure (never commit to git)
- `.env` is in `.gitignore` by default
- Rotate `SECRET_KEY` periodically
- Monitor MongoDB Atlas for suspicious activity
- Keep SSL certificates up to date
- Review Nginx security headers regularly
