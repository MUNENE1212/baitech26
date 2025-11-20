# Deployment Instructions for Admin Panel Fixes

## Overview
This deployment includes critical fixes for the admin panel and new functionality:

1. ✅ **Services Page Fix** - Fixed pricing type error (TypeError: service.pricing.toLocaleString is not a function)
2. ✅ **Product Edit Fix** - Changed from JSON to FormData to match backend expectations
3. ✅ **Settings Backend** - Added full backend implementation with MongoDB persistence
4. ✅ **User Management CRUD** - Added delete user and change role functionality

## Changes Summary

### Backend Changes

#### New Files:
- `routes/settings_routes.py` - Settings API endpoints for storing site configuration

#### Modified Files:
- `main.py` - Added settings_router import and registration
- `routes/admin_routes.py` - Added user management endpoints (delete, change role)

### Frontend Changes

#### Modified Files:
- `baitech-frontend/app/admin/products/page.tsx` - Fixed edit to use FormData
- `baitech-frontend/app/admin/services/page.tsx` - No changes needed (already correct)
- `baitech-frontend/app/admin/settings/page.tsx` - Added backend integration (fetch/save)
- `baitech-frontend/app/admin/users/page.tsx` - Added delete and role change buttons
- `baitech-frontend/types/index.ts` - Changed Service.pricing from string to number

## Deployment Steps for VPS

### 1. Connect to VPS
```bash
ssh root@your-vps-ip
cd /var/www/baitech
```

### 2. Pull Latest Code
```bash
# Stash any local changes
git stash

# Pull from master
git pull origin master

# If on wrong branch, switch to master first
git checkout master
git pull origin master
```

### 3. Restart Backend
```bash
# Backend will automatically pick up new routes
pm2 restart baitech-backend

# Check logs for any errors
pm2 logs baitech-backend --lines 50
```

### 4. Rebuild and Restart Frontend
```bash
cd baitech-frontend

# Install any new dependencies (if needed)
npm install

# Build production version
npm run build

# Restart frontend
cd ..
pm2 restart baitech-frontend

# Check logs
pm2 logs baitech-frontend --lines 50
```

### 5. Verify Deployment
```bash
# Check PM2 status
pm2 status

# Check Nginx is running
systemctl status nginx

# Test backend API
curl http://localhost:8000/api/settings/
```

### 6. Browser Testing

Test each fixed feature:

1. **Settings Page** (http://baitech.co.ke/admin/settings)
   - ✅ Page loads without errors
   - ✅ Settings are fetched from database
   - ✅ Can edit and save settings
   - ✅ Changes persist after page refresh

2. **Products Page** (http://baitech.co.ke/admin/products)
   - ✅ Products list loads
   - ✅ Can create new product
   - ✅ Can edit existing product (FormData fix)
   - ✅ Can delete product

3. **Services Page** (http://baitech.co.ke/admin/services)
   - ✅ Services list loads without errors
   - ✅ Pricing displays correctly (no toLocaleString error)
   - ✅ Can create new service
   - ✅ Can edit existing service

4. **Users Page** (http://baitech.co.ke/admin/users)
   - ✅ Users list loads
   - ✅ Delete button appears (disabled for your own account)
   - ✅ Role change button appears (disabled for your own account)
   - ✅ Can delete other users
   - ✅ Can change other users' roles

## Troubleshooting

### If Backend Fails to Start
```bash
cd /var/www/baitech
source env/bin/activate
python -c "from routes.settings_routes import router; print('Settings routes OK')"
python -c "from routes.admin_routes import router; print('Admin routes OK')"

# Check for import errors
pm2 logs baitech-backend --err --lines 100
```

### If Frontend Build Fails
```bash
cd /var/www/baitech/baitech-frontend

# Check for TypeScript errors
npm run build 2>&1 | grep -i "error"

# Check Node version
node --version  # Should be >= 18

# Clear cache and rebuild
rm -rf .next
npm run build
```

### If Settings Don't Save
```bash
# Test settings endpoint directly
curl -X GET http://localhost:8000/api/settings/

# Test with authentication (replace TOKEN)
curl -X PUT http://localhost:8000/api/settings/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"siteName":"Test","siteDescription":"Test","contactEmail":"test@test.com","contactPhone":"123","whatsappNumber":"123","address":"Test","businessHours":"Test","facebookUrl":"","twitterUrl":"","instagramUrl":"","linkedinUrl":""}'
```

### If Products Not Loading
```bash
# Check if products exist in database
cd /var/www/baitech
source env/bin/activate
python3 -c "
from pymongo import MongoClient
import os
from dotenv import load_dotenv
load_dotenv()

client = MongoClient(os.getenv('MONGO_URL'))
db = client[os.getenv('MONGO_DB', 'baitekdb')]
products = list(db.products.find().limit(5))
print(f'Found {len(products)} products')
for p in products:
    print(f\"  - {p.get('name', 'Unknown')}\")
"
```

## Rollback Plan

If something goes wrong:

```bash
cd /var/www/baitech

# Find previous commit
git log --oneline -5

# Rollback to previous version (replace COMMIT_HASH)
git checkout COMMIT_HASH

# Restart services
pm2 restart baitech-backend
cd baitech-frontend && npm run build && cd ..
pm2 restart baitech-frontend
```

## Expected Results

After successful deployment:

1. All admin pages load without errors
2. Settings can be saved and persist in database
3. Products can be edited using the form
4. Services display pricing correctly
5. Users can be deleted and roles can be changed
6. No console errors in browser developer tools

## Support

If you encounter any issues:

1. Check PM2 logs: `pm2 logs`
2. Check Nginx error log: `tail -f /var/log/nginx/error.log`
3. Check browser console for frontend errors
4. Refer to ADMIN_ISSUES_FIX_GUIDE.md for detailed troubleshooting

## Next Steps (Optional)

After successful deployment, consider:

1. Seed some products if database is empty (see ADMIN_SEEDING_GUIDE.md)
2. Configure site settings via admin panel
3. Test user registration and authentication flow
4. Set up automated backups for MongoDB

---

**Deployed:** [Date]
**Commit:** [Commit Hash]
**Status:** Ready for deployment
