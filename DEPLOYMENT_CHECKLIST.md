# Server Deployment Checklist for baitech.co.ke

This checklist ensures the backend and frontend are properly deployed on the production server (102.68.86.184).

## Prerequisites
- Server: Debian 12, IP: 102.68.86.184
- Domain: baitech.co.ke
- Python: 3.11
- Node.js: 18+
- PM2 installed globally
- Nginx installed and configured

---

## Step 1: Pull Latest Changes

```bash
cd /var/www/baitech
git pull origin master
```

**Verify**: Check that latest commits are pulled
```bash
git log -1
```

---

## Step 2: Fix .env File (CRITICAL)

The .env file MUST have exactly these three lines with NO duplicates:

```bash
cat > /var/www/baitech/.env <<'EOF'
MONGO_URL=mongodb+srv://baitech:ix5YYaOLtX0r2LTe@cluster0.nmtob1l.mongodb.net/baitekdb?retryWrites=true&w=majority
MONGO_DB=baitekdb
SECRET_KEY=D8LqbGKChHXuXNU6ddQUQGu6xeg6gkyQ6bd9axNsnzc
EOF
```

**Verify**: Confirm the file has exactly 3 lines
```bash
cat /var/www/baitech/.env
wc -l /var/www/baitech/.env  # Should output: 3
```

**Common Issues**:
- Duplicate MONGO_URL lines will cause crashes
- Missing MONGO_DB will cause: `TypeError: name must be an instance of str, not <class 'NoneType'>`
- Extra blank lines are OK but keep it clean

---

## Step 3: Update Python Dependencies

```bash
cd /var/www/baitech
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

**Verify**: Check that python-multipart is installed
```bash
pip list | grep multipart
# Should show: python-multipart  0.0.20
```

**New Dependencies Added**:
- `python-multipart==0.0.20` - Required for file upload endpoints
- Removed `bson==0.5.10` - Conflicts with pymongo's built-in bson

---

## Step 4: Restart Backend (PM2)

```bash
pm2 restart baitech-backend
```

**Verify**: Check PM2 status and logs
```bash
pm2 status
pm2 logs baitech-backend --lines 20
```

**Expected Output**: Should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Started parent process [XXXX]
INFO:     Application startup complete.
```

**No Errors**: Should NOT see:
- `TypeError: name must be an instance of str, not <class 'NoneType'>`
- `RuntimeError: Form data requires "python-multipart"`
- `ImportError: cannot import name 'SON' from 'bson'`

---

## Step 5: Test Backend API Locally on Server

```bash
# Test root endpoint
curl http://localhost:8000

# Test products API
curl http://localhost:8000/api/v1/products

# Test services API
curl http://localhost:8000/api/v1/services
```

**Expected**: Should return JSON data, NOT error messages

---

## Step 6: Update Frontend Dependencies

```bash
cd /var/www/baitech/baitech-frontend
npm install
```

---

## Step 7: Build Frontend (Production)

```bash
cd /var/www/baitech/baitech-frontend
npm run build
```

**Verify**: Check build completed successfully
```bash
ls -la /var/www/baitech/baitech-frontend/.next
```

---

## Step 8: Restart Frontend (PM2)

```bash
pm2 restart baitech-frontend
```

**Verify**: Check PM2 status
```bash
pm2 status
pm2 logs baitech-frontend --lines 20
```

**Expected Output**:
```
Ready in XXXms
Local: http://localhost:3000
```

---

## Step 9: Verify Nginx Configuration

```bash
# Test nginx config
sudo nginx -t

# Reload nginx if config changed
sudo systemctl reload nginx
```

**Expected**:
```
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

---

## Step 10: Test Production Site

### Test from Server:
```bash
# Test backend through nginx
curl http://localhost/api/v1/products

# Test frontend
curl http://localhost
```

### Test from Browser:
1. Open https://baitech.co.ke
2. Check homepage loads
3. Check products page shows data
4. Check services page shows data
5. Open browser console - verify NO CORS errors
6. Test navigation between pages

---

## Step 11: Monitor PM2 Processes

```bash
# View all processes
pm2 status

# Monitor in real-time
pm2 monit

# View logs
pm2 logs --lines 50

# View specific process logs
pm2 logs baitech-backend --lines 30
pm2 logs baitech-frontend --lines 30
```

---

## Step 12: Setup PM2 Auto-Start (One-time Setup)

```bash
# Save current PM2 processes
pm2 save

# Generate startup script
pm2 startup systemd

# Copy and run the command shown
# (PM2 will display a command starting with sudo)
```

**Verify**: Reboot server and check processes restart automatically
```bash
sudo reboot
# After reboot:
pm2 status
```

---

## Troubleshooting Guide

### Backend Won't Start - MONGO_DB Error

**Error**: `TypeError: name must be an instance of str, not <class 'NoneType'>`

**Solution**: Your .env file is missing `MONGO_DB=baitekdb`. Run Step 2 again.

### Backend Won't Start - python-multipart Error

**Error**: `RuntimeError: Form data requires "python-multipart"`

**Solution**: Run Step 3 to reinstall dependencies.

### CORS Errors in Browser

**Error**: Browser console shows CORS policy blocking requests

**Solution**:
1. Verify `main.py` includes baitech.co.ke in CORS origins (already fixed)
2. Restart backend: `pm2 restart baitech-backend`
3. Clear browser cache

### Frontend Shows 502 Bad Gateway

**Cause**: Backend is down or not responding

**Solution**:
1. Check backend PM2 status: `pm2 status`
2. Check backend logs: `pm2 logs baitech-backend`
3. Restart backend: `pm2 restart baitech-backend`

### Frontend API Calls Return 404

**Cause**: Incorrect API URL in frontend

**Solution**: Check frontend .env.local has:
```bash
NEXT_PUBLIC_API_URL=https://baitech.co.ke/api/v1
```

---

## Post-Deployment Verification Checklist

- [ ] Backend PM2 process is running (status: online)
- [ ] Frontend PM2 process is running (status: online)
- [ ] Backend logs show no errors
- [ ] Frontend logs show no errors
- [ ] https://baitech.co.ke loads successfully
- [ ] Products page displays data from MongoDB
- [ ] Services page displays data from MongoDB
- [ ] No CORS errors in browser console
- [ ] Navigation works between pages
- [ ] SSL certificate is valid (https://)
- [ ] PM2 auto-start is configured

---

## Quick Command Reference

```bash
# Pull changes
cd /var/www/baitech && git pull

# Fix .env (use heredoc from Step 2)

# Update backend
source venv/bin/activate && pip install -r requirements.txt
pm2 restart baitech-backend

# Update frontend
cd baitech-frontend && npm install && npm run build
pm2 restart baitech-frontend

# View all logs
pm2 logs --lines 50

# Check status
pm2 status

# Restart all
pm2 restart all
```

---

## Local Testing Summary (Already Completed)

We successfully tested the backend locally and confirmed:
- ✅ Python 3.11 venv created
- ✅ All dependencies installed (including python-multipart)
- ✅ .env file configured correctly
- ✅ Backend starts without errors on port 8000
- ✅ MongoDB Atlas connection successful
- ✅ API endpoints return data: `/api/v1/products`, `/api/v1/services`
- ✅ CORS includes baitech.co.ke domain

All local tests passed! Now these same fixes need to be applied on the production server.
