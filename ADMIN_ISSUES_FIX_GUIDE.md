# Admin Issues Fix Guide

## Issues Identified:

1. ✅ **Images Page Build Error** - FIXED
2. ⚠️ **Products Not Loading** - Needs investigation
3. ⚠️ **Product Edit Not Working** - Needs investigation
4. ⚠️ **Services Page Blank/Error** - Needs investigation
5. ⚠️ **Settings Not Saving** - Needs backend implementation
6. ⚠️ **User Management CRUD Missing** - Needs implementation

---

## 1. ✅ Images Page - FIXED

**Problem:** TypeScript build error with `onUploadComplete` prop
**Solution:** Changed to `onImagesUploaded` to match component interface
**Status:** Committed and pushed

---

## 2. Products Not Loading - Debugging Steps

The admin products page fetches from `/api/v1/products`. On your VPS:

```bash
# Test if products API is working
curl http://localhost:8000/api/v1/products

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

**If no products found:** You need to seed some products using the admin panel or seed script.

---

## 3. Product Edit Not Working - Check

The edit function should:
1. Populate the form with product data
2. Send PUT request to `/api/admin/products/{product_id}`

**Debug in browser console:**
```javascript
// When you click edit, check console for errors
// Check Network tab for API calls
```

---

## 4. Services Page Error - Investigation

**Check browser console for exact error**

Common issues:
- Missing `toast` import
- API endpoint not responding
- Data format mismatch

**Test services API:**
```bash
curl http://localhost:8000/api/v1/services
```

---

## 5. Settings Not Saving - Implementation Needed

### Backend: Add Settings Endpoints

Create `/var/www/baitech/routes/settings_routes.py`:

```python
from fastapi import APIRouter, HTTPException, Depends
from utils.auth import get_current_user
from utils.database import db
from pydantic import BaseModel

router = APIRouter(prefix="/api/settings", tags=["settings"])

class Settings(BaseModel):
    siteName: str
    siteDescription: str
    contactEmail: str
    contactPhone: str
    whatsappNumber: str
    address: str
    businessHours: str
    facebookUrl: str = ""
    twitterUrl: str = ""
    instagramUrl: str = ""
    linkedinUrl: str = ""

@router.get("/")
async def get_settings():
    """Get site settings"""
    settings = await db.settings.find_one({"type": "site"})
    if not settings:
        # Return defaults
        return {
            "siteName": "Baitech",
            "siteDescription": "Your trusted technology partner",
            "contactEmail": "info@baitech.co.ke",
            "contactPhone": "+254 700 000 000",
            "whatsappNumber": "+254 700 000 000",
            "address": "Nairobi, Kenya",
            "businessHours": "Mon-Fri: 8:00 AM - 6:00 PM",
            "facebookUrl": "",
            "twitterUrl": "",
            "instagramUrl": "",
            "linkedinUrl": ""
        }
    return settings

@router.put("/")
async def update_settings(
    settings: Settings,
    current_user: dict = Depends(get_current_user)
):
    """Update site settings (admin only)"""
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    settings_dict = settings.dict()
    settings_dict["type"] = "site"

    await db.settings.update_one(
        {"type": "site"},
        {"$set": settings_dict},
        upsert=True
    )

    return {"success": True, "message": "Settings updated successfully"}
```

Then in `main.py`, add:
```python
from routes.settings_routes import router as settings_router
app.include_router(settings_router)
```

### Frontend: Update Settings Page

Update `/var/www/baitech/baitech-frontend/app/admin/settings/page.tsx`:

```typescript
// Add at top with other useEffect
useEffect(() => {
  fetchSettings()
}, [])

const fetchSettings = async () => {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    const response = await fetch(`${apiUrl}/api/settings/`)
    if (response.ok) {
      const data = await response.json()
      setSettings(data)
    }
  } catch (err) {
    console.error('Error fetching settings:', err)
  }
}

// Update handleSave
const handleSave = async () => {
  setSaving(true)
  try {
    const token = localStorage.getItem('token')
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

    const response = await fetch(`${apiUrl}/api/settings/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(settings)
    })

    if (!response.ok) throw new Error('Failed to save settings')

    toast.success('Settings saved successfully!')
  } catch (err) {
    toast.error('Failed to save settings')
  } finally {
    setSaving(false)
  }
}
```

---

## 6. User Management CRUD - Implementation

### Backend: Add User Management Endpoints

In `main.py` or create new `routes/user_routes.py`:

```python
# Add to existing user routes or create new file

@app.delete("/api/admin/users/{user_id}")
async def delete_user(
    user_id: str,
    current_user: dict = Depends(require_role("admin"))
):
    """Delete a user (admin only)"""
    from bson import ObjectId

    # Prevent deleting yourself
    if str(current_user.get("_id")) == user_id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")

    result = await db.users.delete_one({"_id": ObjectId(user_id)})

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")

    return {"success": True, "message": "User deleted successfully"}

@app.put("/api/admin/users/{user_id}/role")
async def update_user_role(
    user_id: str,
    role: str,
    current_user: dict = Depends(require_role("admin"))
):
    """Update user role (admin only)"""
    from bson import ObjectId

    if role not in ["admin", "customer"]:
        raise HTTPException(status_code=400, detail="Invalid role")

    result = await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"role": role}}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")

    return {"success": True, "message": f"User role updated to {role}"}
```

### Frontend: Update Users Page

Add delete and role change functionality to `app/admin/users/page.tsx`.

---

## Deployment Steps

1. **Pull latest code:**
```bash
cd /var/www/baitech
git pull
```

2. **Restart backend:**
```bash
pm2 restart baitech-backend
```

3. **Rebuild frontend:**
```bash
cd baitech-frontend
npm run build
cd ..
pm2 restart baitech-frontend
```

4. **Check logs if issues:**
```bash
pm2 logs
```

---

## Immediate Actions

1. Deploy the images page fix (already pushed)
2. Check browser console for Services page error
3. Test if products API returns data
4. Implement settings backend if needed
5. Add user management endpoints if needed

Let me know what errors you see in the browser console for the services page, and whether products are in the database!
