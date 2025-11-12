# SSL Deployment Troubleshooting Guide

## Common Issues After SSL Setup

This guide addresses the most common problems encountered after enabling SSL/HTTPS on your VPS deployment.

---

## Issue 1: Styles and Assets Not Loading

### Symptoms:
- Page loads but no styling
- Images don't display
- JavaScript files fail to load
- Browser console shows "Mixed Content" errors

### Root Causes:
1. **Mixed Content Errors**: Your site is served over HTTPS but tries to load resources over HTTP
2. **Incorrect Nginx Configuration**: Static files not properly proxied to Next.js
3. **Wrong Environment Variables**: API URLs still using `http://` instead of `https://`

### Solutions:

#### Step 1: Update Production Environment Variables

On your VPS, update the production environment file:

```bash
# Edit frontend environment file
nano /var/www/baitech/baitech-frontend/.env.production.local
```

Ensure all URLs use HTTPS:
```bash
NEXT_PUBLIC_API_URL=https://yourdomain.com/api
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
NEXT_PUBLIC_APP_ENV=production
```

**CRITICAL**: Never use `http://` in production environment variables!

#### Step 2: Verify Nginx Configuration

Your Nginx config should be at `/etc/nginx/sites-available/baitech`

Key points to check:
1. All static assets are proxied to Next.js (not served from disk)
2. The `/images/` location block proxies to Next.js
3. `X-Forwarded-Proto` header is set to `$scheme`

Example correct configuration:
```nginx
# All static files should proxy to Next.js
location /images/ {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

#### Step 3: Update Nginx Config on VPS

```bash
# Copy the updated config to your VPS
sudo cp /path/to/updated/baitech.conf /etc/nginx/sites-available/baitech

# Test nginx configuration
sudo nginx -t

# If test passes, reload nginx
sudo systemctl reload nginx
```

#### Step 4: Rebuild and Restart Next.js

```bash
# Navigate to frontend directory
cd /var/www/baitech/baitech-frontend

# Rebuild with production environment
npm run build

# Restart with PM2
pm2 restart baitech-frontend
```

---

## Issue 2: API Calls Failing

### Symptoms:
- Data not loading from backend
- Console errors like "Failed to fetch"
- CORS errors in browser console

### Solutions:

#### Step 1: Check Backend CORS Configuration

Ensure backend allows HTTPS origins:

```bash
# Edit backend .env file
nano /var/www/baitech/.env
```

Update CORS_ORIGINS:
```bash
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
FRONTEND_URL=https://yourdomain.com
```

#### Step 2: Restart Backend

```bash
pm2 restart baitech-backend
```

---

## Issue 3: Browser Shows "Not Secure" Warning

### Symptoms:
- Padlock icon shows as insecure
- Certificate errors

### Solutions:

#### Check Certificate Status

```bash
# Check if certificates exist
sudo ls -la /etc/letsencrypt/live/yourdomain.com/

# Test certificate renewal
sudo certbot renew --dry-run
```

#### Verify Nginx SSL Configuration

Ensure these lines point to valid certificates:
```nginx
ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
```

---

## Issue 4: Infinite Redirect Loop

### Symptoms:
- Browser shows "Too many redirects"
- Site never loads

### Solutions:

#### Check for Duplicate Redirects

Ensure only the HTTP server block (port 80) redirects to HTTPS:

```nginx
# Port 80 - HTTP (should redirect)
server {
    listen 80;
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# Port 443 - HTTPS (should NOT redirect)
server {
    listen 443 ssl http2;
    # ... no redirect here!
}
```

---

## Quick Diagnostic Commands

Run these on your VPS to diagnose issues:

```bash
# 1. Check if services are running
pm2 status

# 2. View logs
pm2 logs baitech-frontend --lines 50
pm2 logs baitech-backend --lines 50

# 3. Check Nginx error logs
sudo tail -f /var/log/nginx/error.log

# 4. Test Nginx config
sudo nginx -t

# 5. Check SSL certificate
sudo certbot certificates

# 6. Test HTTPS connection
curl -I https://yourdomain.com

# 7. Check if ports are listening
sudo netstat -tlnp | grep -E ':80|:443|:3000|:8000'
```

---

## Complete Restart Procedure

If all else fails, perform a complete restart:

```bash
# 1. Stop all services
pm2 stop all

# 2. Rebuild frontend
cd /var/www/baitech/baitech-frontend
npm run build

# 3. Restart services
pm2 restart all

# 4. Reload Nginx
sudo systemctl reload nginx

# 5. Check status
pm2 status
sudo systemctl status nginx
```

---

## Browser Console Debugging

Open browser Developer Tools (F12) and check:

1. **Console Tab**: Look for:
   - Mixed Content warnings
   - 404 errors on assets
   - CORS errors

2. **Network Tab**: Check:
   - Failed requests (red status)
   - Response headers
   - Request URLs (should all be HTTPS)

3. **Security Tab**: Verify:
   - SSL certificate is valid
   - No mixed content issues

---

## Prevention Checklist

Before deploying SSL, ensure:

- [ ] All environment variables use HTTPS
- [ ] Nginx config properly proxies all routes
- [ ] Backend CORS allows HTTPS origins
- [ ] Frontend is rebuilt after env changes
- [ ] SSL certificates are valid and not expired
- [ ] No hardcoded HTTP URLs in code

---

## Need More Help?

If issues persist after following this guide:

1. Check the main deployment logs: `pm2 logs`
2. Review Nginx error log: `/var/log/nginx/error.log`
3. Verify your domain DNS points to the VPS
4. Ensure firewall allows ports 80 and 443
5. Check if your VPS provider blocks any ports

## Common VPS Provider Issues

### Firewall/Security Groups
```bash
# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw reload
```

### SELinux (if enabled)
```bash
# Check if SELinux is blocking
sudo ausearch -m avc -ts recent

# Allow Nginx network connections
sudo setsebool -P httpd_can_network_connect 1
```
