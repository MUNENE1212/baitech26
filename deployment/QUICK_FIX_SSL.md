# Quick Fix: Assets Not Loading After SSL Setup

## The Problem
After enabling SSL, your styles and data stopped loading. This is caused by:
1. Nginx trying to serve images from disk instead of proxying to Next.js
2. Mixed content errors (HTTP resources on HTTPS page)

## Immediate Fix (Run on Your VPS)

### Step 1: Update Nginx Configuration

```bash
# Copy the fixed config from this repo to your VPS
sudo cp deployment/nginx/baitech.conf /etc/nginx/sites-available/baitech

# Or manually edit the config
sudo nano /etc/nginx/sites-available/baitech
```

Find the `/images/` location block and change from:
```nginx
location /images/ {
    alias /var/www/baitech/baitech-frontend/public/images/;
    expires 30d;
    add_header Cache-Control "public, max-age=2592000";
}
```

To:
```nginx
location /images/ {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    add_header Cache-Control "public, max-age=2592000";
}
```

**ALSO CRITICAL:** Find the `/api/` location block (around line 59) and change from:
```nginx
location /api/ {
    proxy_pass http://localhost:8000/;  # ❌ This strips /api prefix!
```

To:
```nginx
location /api/ {
    proxy_pass http://localhost:8000/api/;  # ✅ Preserves /api prefix
```

This is critical because your backend uses `/api/v1/` routes, so the `/api` prefix must be preserved.

### Step 2: Update Frontend Environment Variables

```bash
# Edit or create the production env file
nano /var/www/baitech/baitech-frontend/.env.production.local
```

Make sure it has HTTPS URLs (replace yourdomain.com with your actual domain):
```bash
NEXT_PUBLIC_API_URL=https://yourdomain.com/api/v1
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_APP_NAME=Baitech
NEXT_PUBLIC_APP_DESCRIPTION=Premium technology products and professional tech services in Kenya
```

**Note:** The API URL should be `https://yourdomain.com/api/v1` (with `/v1`) because your backend routes use the `/api/v1/` prefix.

### Step 3: Update Backend Environment Variables

```bash
# Edit backend env file
nano /var/www/baitech/.env
```

Ensure CORS origins use HTTPS:
```bash
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
FRONTEND_URL=https://yourdomain.com
```

### Step 4: Test and Restart

```bash
# Test Nginx config
sudo nginx -t

# If test passes, reload Nginx
sudo systemctl reload nginx

# Rebuild frontend with new env variables
cd /var/www/baitech/baitech-frontend
npm run build

# Restart both services
pm2 restart baitech-frontend
pm2 restart baitech-backend

# Check status
pm2 status
```

### Step 5: Verify the Fix

1. Clear your browser cache (Ctrl+Shift+Delete)
2. Open your site in an incognito/private window
3. Open browser DevTools (F12) and check the Console tab
4. Look for:
   - ✅ No "Mixed Content" errors
   - ✅ All assets loading successfully
   - ✅ Green padlock icon in address bar

## Still Having Issues?

### Check Logs
```bash
# Frontend logs
pm2 logs baitech-frontend --lines 50

# Backend logs
pm2 logs baitech-backend --lines 50

# Nginx error log
sudo tail -f /var/log/nginx/error.log
```

### Browser Console Checks
Open DevTools (F12) and look for:
- Red errors in Console tab
- Failed requests in Network tab
- Any URLs still using `http://` instead of `https://`

### Common Issues

**Mixed Content Errors?**
- Ensure all env files use `https://`
- Rebuild frontend after env changes
- Hard refresh browser (Ctrl+Shift+R)

**404 on Assets?**
- Verify Nginx config is correct
- Check that Next.js is running: `curl http://localhost:3000`
- Restart PM2: `pm2 restart all`

**CORS Errors?**
- Update backend `.env` with HTTPS origins
- Restart backend: `pm2 restart baitech-backend`

For more detailed troubleshooting, see [SSL_TROUBLESHOOTING.md](./SSL_TROUBLESHOOTING.md)
