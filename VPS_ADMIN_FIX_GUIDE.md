# VPS Admin Login Fix Guide

## Problem Summary

The admin cannot log in to the management panel due to a database field naming mismatch:
- Admin creation scripts were using the field name `"password"`
- Authentication functions were looking for `"hashed_password"`
- Database connection was hardcoded to localhost instead of using environment variables

## What Was Fixed

### 1. Database Configuration (`utils/database.py`)
- ✅ Now reads `MONGO_URL` and `MONGO_DB` from environment variables
- ✅ Falls back to localhost for local development

### 2. Admin Creation Scripts
- ✅ `scripts/setup/create_admin.py` - Now uses `hashed_password` field
- ✅ `scripts/setup/create_atlas_admin.py` - Now uses `hashed_password` field

### 3. Authentication Functions
- ✅ `main.py` - Updated login/register endpoints to use `hashed_password`

### 4. Migration Script
- ✅ `scripts/setup/fix_admin_password_field.py` - Fixes existing users with wrong field name

## Deployment Steps on VPS

### Step 1: Connect to VPS
```bash
ssh your-user@your-vps-ip
cd /path/to/newbaitech
```

### Step 2: Pull Latest Changes
```bash
git pull origin master
```

### Step 3: Activate Virtual Environment
```bash
source env/bin/activate
# or
source venv/bin/activate
```

### Step 4: Ensure .env File is Configured
```bash
# Check if .env file exists
ls -la .env

# If not, copy from production example
cp .env.production .env

# Edit if needed
nano .env
```

Make sure `.env` contains:
```env
MONGO_URL=mongodb+srv://baitech:ix5YYaOLtX0r2LTe@cluster0.nmtob1l.mongodb.net/baitekdb?appName=Cluster0
MONGO_DB=baitekdb
SECRET_KEY=your-secret-key-here
```

### Step 5: Fix Existing Admin Users (IMPORTANT!)
This script will rename the `password` field to `hashed_password` for all existing users:

```bash
cd /path/to/newbaitech
python3 scripts/setup/fix_admin_password_field.py
```

Expected output:
```
🔧 Baitech Admin Password Field Fixer
============================================================
Database: baitekdb
MongoDB URL: mongodb+srv://baitech:ix5YYaOLtX0r2LTe@cluster...

📤 Connecting to MongoDB...
✓ Connected successfully!

🔍 Searching for users with old password field...
⚠ Found 1 user(s) that need fixing:
  1. Baitech Admin - admin@baitech.co.ke (Role: admin)

🔄 Fixing password field for 1 user(s)...
  ✓ Fixed: admin@baitech.co.ke

✅ Successfully fixed 1 user(s)!

📋 Current Admin Users:
------------------------------------------------------------
  1. ✓ Baitech Admin (admin@baitech.co.ke) - Field: hashed_password
------------------------------------------------------------

✨ Done!
```

### Step 6: Verify/Create Admin User (if needed)
If no admin exists after Step 5, create one:

```bash
python3 scripts/setup/create_atlas_admin.py
```

This will create:
- **Email:** admin@baitech.co.ke
- **Password:** Wincers#1
- **Role:** admin

### Step 7: Restart the Backend Service

```bash
# If using systemd
sudo systemctl restart baitech-api

# If using PM2
pm2 restart baitech-api

# If running manually
# Kill the old process first, then:
uvicorn main:app --host 0.0.0.0 --port 8000
```

### Step 8: Test Admin Login

1. Open your browser and go to: `http://your-domain.com/login`
2. Use credentials:
   - Email: `admin@baitech.co.ke`
   - Password: `Wincers#1`

3. You should now be able to log in successfully!

## Verification Commands

### Check Database Connection
```bash
cd /path/to/newbaitech
source env/bin/activate
python3 -c "
from dotenv import load_dotenv
import os
load_dotenv()
print('MONGO_URL:', os.getenv('MONGO_URL')[:50] + '...')
print('MONGO_DB:', os.getenv('MONGO_DB'))
"
```

### List All Admin Users
```bash
python3 scripts/setup/fix_admin_password_field.py
```

### Test API Health
```bash
curl http://localhost:8000/
```

Expected response:
```json
{
  "message": "Welcome to EmenTech API",
  "version": "2.0.0",
  "api_docs": "/docs"
}
```

### Test Admin Login via API
```bash
curl -X POST http://localhost:8000/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@baitech.co.ke",
    "password": "Wincers#1"
  }'
```

Expected response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

## Troubleshooting

### Issue: "Invalid credentials" error
**Solution:** Run the fix script again:
```bash
python3 scripts/setup/fix_admin_password_field.py
```

### Issue: "MONGO_URL not found in environment"
**Solution:** Make sure .env file exists and is loaded:
```bash
cat .env | grep MONGO_URL
```

### Issue: "Connection timeout" or "Connection refused"
**Solution:** Check if:
1. MongoDB Atlas IP whitelist includes your VPS IP (or use 0.0.0.0/0 for testing)
2. Internet connection is working on VPS
3. MongoDB credentials are correct

### Issue: Backend not responding
**Solution:** Check if the service is running:
```bash
# If using systemd
sudo systemctl status baitech-api

# If using PM2
pm2 status

# Check logs
pm2 logs baitech-api
# or
sudo journalctl -u baitech-api -f
```

## Security Notes

⚠️ **IMPORTANT:** After successfully logging in, you should:

1. Change the default admin password immediately
2. Update the `SECRET_KEY` in `.env` to a secure random value:
   ```bash
   python3 -c "import secrets; print(secrets.token_urlsafe(32))"
   ```
3. Restart the backend service after changing the SECRET_KEY

## Admin Credentials

**Default Credentials:**
- Email: `admin@baitech.co.ke`
- Password: `Wincers#1`

**⚠️ CHANGE THESE AFTER FIRST LOGIN!**

## Files Modified

- ✅ `utils/database.py` - Database configuration
- ✅ `scripts/setup/create_admin.py` - Admin creation script
- ✅ `scripts/setup/create_atlas_admin.py` - Atlas admin creation
- ✅ `main.py` - Login/register endpoints
- ✅ `scripts/setup/fix_admin_password_field.py` - NEW migration script

## Next Steps

1. Follow the deployment steps above
2. Test admin login
3. Change default password
4. Update SECRET_KEY
5. Consider setting up automated backups for MongoDB Atlas
