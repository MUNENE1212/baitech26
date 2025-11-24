# Cloudinary Setup Guide

## 📸 What is Cloudinary?

Cloudinary is a cloud-based image and video management service that provides:
- **CDN Delivery**: Fast global content delivery
- **Automatic Optimization**: WebP, AVIF format conversion
- **Responsive Images**: Multiple sizes generated automatically
- **Image Transformations**: Resize, crop, effects on-the-fly
- **25GB Free Tier**: Perfect for getting started

---

## 🚀 Quick Setup (5 minutes)

### Step 1: Create Cloudinary Account

1. Go to: https://cloudinary.com/users/register/free
2. Sign up with your email
3. Verify your email address
4. You'll be redirected to the Dashboard

### Step 2: Get Your Credentials

From the Cloudinary Dashboard, you'll see:

```
Cloud Name: your-cloud-name
API Key: 123456789012345
API Secret: abcdefghijklmnopqrstuvwxyz
```

### Step 3: Add Credentials to Environment Files

#### For Development (.env):
```bash
cd /media/munen/muneneENT/newbaitech
nano .env
```

Update these lines:
```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz
```

#### For Production (VPS):
```bash
# On your VPS
cd /var/www/baitech
nano .env
```

Add the same Cloudinary credentials.

### Step 4: Restart Backend

**Development:**
```bash
# Stop current backend
pkill -f uvicorn

# Start fresh
cd /media/munen/muneneENT/newbaitech
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Production (VPS):**
```bash
pm2 restart baitech-backend
# or
sudo systemctl restart baitech-backend
```

---

## ✅ Verify Setup

### Check Configuration:
```bash
cd /media/munen/muneneENT/newbaitech
python3 -c "from utils.cloudinary_uploader import is_cloudinary_configured; print('✅ Configured' if is_cloudinary_configured() else '❌ Not Configured')"
```

### Test Upload:
1. Go to: http://localhost:8000/docs
2. Login as admin
3. Try `/api/admin/upload-image` endpoint
4. Upload a test image
5. Check response - should see `"storage": "cloudinary"`

---

## 🎯 How It Works

### Automatic Fallback System

The system is smart:

1. **With Cloudinary Configured**:
   - Images upload to Cloudinary
   - Returns CDN URLs
   - Automatic format optimization (WebP, AVIF)
   - Multiple sizes generated (thumbnail, medium, large)

2. **Without Cloudinary**:
   - Falls back to local storage
   - Saves to `baitech-frontend/public/images/`
   - Still works, just not CDN-backed

### Upload Response Format

**With Cloudinary:**
```json
{
  "success": true,
  "storage": "cloudinary",
  "url": "https://res.cloudinary.com/your-cloud/image/upload/v123/baitech/products/image.jpg",
  "thumbnail_url": "https://res.cloudinary.com/.../w_150,h_150.../image.jpg",
  "medium_url": "https://res.cloudinary.com/.../w_600,h_600.../image.jpg",
  "large_url": "https://res.cloudinary.com/.../w_1200,h_1200.../image.jpg",
  "public_id": "baitech/products/image"
}
```

**Without Cloudinary (Fallback):**
```json
{
  "success": true,
  "storage": "local",
  "url": "/images/image.jpg",
  "paths": ["/images/image.jpg", "/images/image.webp"]
}
```

---

## 📁 Folder Structure in Cloudinary

Images are organized as:
```
your-cloudinary-account/
├── baitech/
│   ├── products/          # Product images
│   ├── services/          # Service images
│   └── banners/           # Banner/hero images
```

---

## 🔧 Advanced Configuration

### Custom Transformations

Edit `utils/cloudinary_uploader.py` to customize image transformations:

```python
TRANSFORMATIONS = {
    "thumbnail": {
        "width": 150,
        "height": 150,
        "crop": "fill",
        "quality": "auto:good"
    },
    # Add your own presets
}
```

### Upload to Different Folders

When uploading from admin panel, specify folder:

```python
upload_image_to_cloudinary(
    image_bytes,
    filename,
    folder="baitech/banners"  # Custom folder
)
```

---

## 🚨 Troubleshooting

### "Cloudinary not configured" Error

**Check 1:** Verify .env file has correct values
```bash
cat .env | grep CLOUDINARY
```

**Check 2:** Restart backend after adding credentials
```bash
pm2 restart baitech-backend
```

**Check 3:** Test credentials manually
```python
python3
>>> import cloudinary
>>> cloudinary.config(cloud_name="your-cloud", api_key="...", api_secret="...")
>>> cloudinary.api.ping()
```

### Images Still Saving Locally

This means Cloudinary isn't configured or failed. Check logs:
```bash
pm2 logs baitech-backend --lines 50
```

Look for messages like:
- "Cloudinary upload failed: ..."
- "Falling back to local storage"

---

## 💰 Pricing (Free Tier Limits)

Cloudinary Free Tier includes:
- ✅ 25 GB storage
- ✅ 25 GB bandwidth/month
- ✅ Unlimited transformations
- ✅ 1000 transformation operations/month

**For BAITECH**, this is plenty for:
- ~5000-10000 product images
- Multiple sizes and formats per image
- Global CDN delivery

---

## 🎓 Next Steps

### 1. **Migrate Existing Images** (Optional)

If you have existing local images:
```python
# Run migration script (create one if needed)
python3 scripts/migrate_to_cloudinary.py
```

### 2. **Update Admin Panel**

Frontend admin panel already supports both local and Cloudinary URLs.
No changes needed!

### 3. **Set Up Backups**

Cloudinary has built-in backups, but you can also:
```bash
# Download all images from Cloudinary
python3 scripts/backup_cloudinary.py
```

---

## 📞 Support

- **Cloudinary Docs**: https://cloudinary.com/documentation
- **Community Forum**: https://community.cloudinary.com
- **Support Email**: support@cloudinary.com

---

## ✨ Benefits Summary

### Before Cloudinary:
- ❌ Images stored on VPS (limited space)
- ❌ Slow image loading (no CDN)
- ❌ Manual image optimization
- ❌ No responsive images
- ❌ Server bandwidth consumed

### After Cloudinary:
- ✅ Images on cloud (unlimited scale)
- ✅ Fast loading worldwide (CDN)
- ✅ Automatic optimization (WebP, AVIF)
- ✅ Multiple sizes auto-generated
- ✅ Bandwidth offloaded to Cloudinary

---

**Setup Time**: 5 minutes
**Cost**: FREE (25GB tier)
**Difficulty**: Easy ⭐⭐☆☆☆

🎉 **You're all set!** Start uploading images through the admin panel and they'll automatically use Cloudinary!
