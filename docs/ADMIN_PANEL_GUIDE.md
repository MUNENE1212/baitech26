# Baitech Admin Panel Guide

## Overview
A comprehensive admin panel for managing products, services, and images with automatic image optimization built-in.

---

## Features

### 🎯 Core Features
- ✅ **Product Management**: Add, edit, delete products with multiple images
- ✅ **Service Management**: Manage service offerings and pricing
- ✅ **Automatic Image Optimization**: Upload images that are automatically resized and optimized
- ✅ **Dashboard Analytics**: View stats, recent products, and low stock alerts
- ✅ **Admin Authentication**: Secure access with JWT token authentication
- ✅ **Responsive Design**: Works on desktop, tablet, and mobile devices

### 📊 Dashboard Features
- Total products, services, orders, users, and reviews count
- Recent products list
- Low stock alerts (products with <10 items)
- Quick action buttons for common tasks

### 🖼️ Image Optimization
- Automatic resizing to 3 variants: thumbnail (150x150), medium (600x600), large (1200x1200)
- WebP format generation for better compression (~30% smaller)
- Real-time upload progress with previews
- Support for JPG, PNG, and WebP formats
- Maximum 5 images per product

---

## Setup Instructions

### 1. Backend Setup

#### Create Admin User
You need an admin user to access the admin panel. Create one via MongoDB or API:

```python
# Example: Create admin user via Python
import asyncio
from utils.database import db
from utils.security import hash_password

async def create_admin():
    admin_data = {
        "name": "Admin User",
        "email": "admin@baitech.com",
        "password": hash_password("YourSecurePassword123!"),
        "role": "admin"
    }

    await db.users.insert_one(admin_data)
    print("Admin user created successfully")

asyncio.run(create_admin())
```

Or via MongoDB directly:
```javascript
db.users.insertOne({
  name: "Admin User",
  email: "admin@baitech.com",
  password: "$2b$12$...", // Use bcrypt to hash the password
  role: "admin"
})
```

#### Start Backend Server
```bash
# From project root
cd /media/munen/muneneENT/newbaitech

# Start FastAPI server
uvicorn main:app --reload --port 8000
```

The admin API endpoints will be available at:
- Image Upload: `POST /admin/upload-image`
- Multiple Upload: `POST /admin/upload-images`
- Products: `/admin/products`
- Services: `/admin/services`
- Stats: `GET /admin/stats`

### 2. Frontend Setup

#### Install Dependencies (if needed)
```bash
cd baitech-frontend
npm install
```

#### Configure Environment Variables
Create/update `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

#### Start Frontend
```bash
npm run dev
```

The admin panel will be available at: `http://localhost:3000/admin`

---

## Usage Guide

### Logging In

1. Navigate to `http://localhost:3000/login`
2. Enter admin credentials:
   - Email: `admin@baitech.com`
   - Password: Your admin password
3. You'll be redirected to `/admin` dashboard

**Note**: Only users with `role: "admin"` can access the admin panel.

### Dashboard

**Location**: `/admin`

**Features**:
- View total counts for products, services, orders, users, reviews
- See recent products
- Monitor low stock items (highlighted in red)
- Quick action buttons to add products/services or upload images

**Quick Actions**:
- Click "Add Product" to create a new product
- Click "Add Service" to create a new service
- Click "Upload Images" to batch upload images
- Click "Manage Users" to view/manage users

---

### Managing Products

**Location**: `/admin/products`

#### Add a New Product

1. Click "Add Product" button (top right)
2. Fill in the product form:
   - **Product Name**: Full product name (e.g., "65W USB-C Charger")
   - **Category**: Product category (e.g., "Chargers", "Cables", "Audio")
   - **Price**: Price in Kenyan Shillings
   - **Stock**: Number of items available
   - **Description**: Detailed product description
   - **Features**: Click "+ Add Feature" to add bullet points (e.g., "Fast Charging", "Universal Compatibility")
   - **Images**: Upload 1-5 product images
3. Check "Feature this product" to show on homepage
4. Click "Add Product"

#### Upload Product Images

The image upload component handles:
- **Automatic optimization**: Images are resized to 3 sizes and converted to WebP
- **Real-time previews**: See images before they're uploaded
- **Progress indicators**: Visual feedback during upload
- **Drag & drop** (coming soon): Simply drag images into the upload area

**Supported Formats**: JPG, JPEG, PNG, WebP
**Maximum Files**: 5 images per product
**Automatic Processing**:
- Thumbnail: 150x150px
- Medium: 600x600px (used in main images folder)
- Large: 1200x1200px
- WebP variants for all sizes

#### Edit a Product

1. Click the "Edit" (pencil) icon on any product
2. Modify the fields you want to change
3. Add/remove images as needed
4. Click "Update Product"

#### Delete a Product

1. Click the "Delete" (trash) icon on any product
2. Confirm deletion in the popup
3. Product will be permanently removed

#### Search Products

Use the search bar to filter products by:
- Product name
- Category
- Product ID

---

### Managing Services

**Location**: `/admin/services`

#### Add a New Service

1. Click "Add Service" button (top right)
2. Fill in the service form:
   - **Service Name**: Full service name (e.g., "Laptop Screen Replacement")
   - **Category**: Service category (e.g., "Hardware Repair", "Software Installation")
   - **Starting Price**: Base price in Kenyan Shillings
   - **Estimated Duration**: How long it takes (e.g., "1-2 hours", "3-5 days")
   - **Description**: Detailed description of what's involved
   - **What's Included**: Click "+ Add Feature" to list what the service includes
     - Example: "Free diagnostics"
     - Example: "30-day warranty"
     - Example: "Parts included"
3. Click "Add Service"

#### Edit a Service

1. Click "Edit" button on any service card
2. Modify the fields
3. Click "Update Service"

#### Delete a Service

1. Click "Delete" button on any service card
2. Confirm deletion
3. Service will be permanently removed

#### Search Services

Use the search bar to filter services by:
- Service name
- Category
- Service ID

---

## API Endpoints Reference

### Authentication
All admin endpoints require authentication via JWT token in the header:
```
Authorization: Bearer <your_jwt_token>
```

### Image Upload Endpoints

#### Upload Single Image
```http
POST /admin/upload-image
Content-Type: multipart/form-data
Authorization: Bearer <token>

file: <image_file>
```

**Response**:
```json
{
  "success": true,
  "message": "Successfully optimized image.jpg",
  "filename": "image.jpg",
  "paths": [
    "/images/image.jpg",
    "/images/image.webp"
  ],
  "primary_path": "/images/image.jpg"
}
```

#### Upload Multiple Images
```http
POST /admin/upload-images
Content-Type: multipart/form-data
Authorization: Bearer <token>

files: [<image_file1>, <image_file2>, ...]
```

**Response**:
```json
{
  "success": true,
  "uploaded": 3,
  "failed": 0,
  "results": [
    {
      "filename": "image1.jpg",
      "paths": ["/images/image1.jpg", "/images/image1.webp"],
      "primary_path": "/images/image1.jpg"
    }
  ]
}
```

### Product Endpoints

#### Create Product
```http
POST /admin/products
Content-Type: multipart/form-data
Authorization: Bearer <token>

name: Product Name
price: 5000
description: Product description
category: Category Name
stock: 50
featured: true
features: ["Feature 1", "Feature 2"]  (JSON string)
images: ["/images/img1.jpg", "/images/img2.jpg"]  (JSON string)
```

#### Update Product
```http
PUT /admin/products/{product_id}
Content-Type: multipart/form-data
Authorization: Bearer <token>

[Same fields as create, all optional]
```

#### Delete Product
```http
DELETE /admin/products/{product_id}
Authorization: Bearer <token>
```

### Service Endpoints

#### Create Service
```http
POST /admin/services
Content-Type: multipart/form-data
Authorization: Bearer <token>

name: Service Name
description: Service description
category: Category Name
pricing: 3000
estimated_duration: 1-2 hours
features: ["Feature 1", "Feature 2"]  (JSON string)
```

#### Update Service
```http
PUT /admin/services/{service_id}
Content-Type: multipart/form-data
Authorization: Bearer <token>

[Same fields as create, all optional]
```

#### Delete Service
```http
DELETE /admin/services/{service_id}
Authorization: Bearer <token>
```

### Dashboard Stats
```http
GET /admin/stats
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "stats": {
    "total_products": 45,
    "total_services": 12,
    "total_orders": 156,
    "total_users": 234,
    "total_reviews": 89,
    "low_stock_count": 5
  },
  "recent_products": [...],
  "low_stock_items": [...]
}
```

---

## File Structure

### Backend Files
```
/media/munen/muneneENT/newbaitech/
├── routes/
│   └── admin_routes.py           # Admin API endpoints
├── utils/
│   └── image_optimizer.py        # Image optimization utility
└── main.py                       # FastAPI app (admin router included)
```

### Frontend Files
```
baitech-frontend/
├── app/
│   └── admin/
│       ├── layout.tsx            # Admin layout with sidebar
│       ├── page.tsx              # Dashboard
│       ├── products/
│       │   └── page.tsx          # Products management
│       └── services/
│           └── page.tsx          # Services management
└── components/
    └── admin/
        └── ImageUpload.tsx       # Reusable image upload component
```

---

## Security Considerations

### Authentication
- Admin access requires JWT token
- Tokens stored in localStorage
- Tokens include user role and are verified on each request

### Authorization
- All `/admin` routes check for `role: "admin"`
- Non-admin users receive 403 Forbidden
- Frontend redirects non-admins to login page

### File Upload Security
- Only image files allowed (JPG, PNG, WebP)
- File type validation on both frontend and backend
- Files sanitized and renamed during processing
- Maximum file count enforced (5 per product)

### Best Practices
1. **Use strong admin passwords** (min 12 characters, mixed case, numbers, symbols)
2. **Change default admin credentials** immediately
3. **Use HTTPS in production**
4. **Keep JWT secret secure** (use environment variables)
5. **Regular security audits** of admin actions
6. **Implement rate limiting** for upload endpoints (recommended)

---

## Troubleshooting

### "Admin access required" Error
**Problem**: Getting 403 Forbidden when accessing admin panel
**Solution**:
1. Check if you're logged in as admin
2. Verify `localStorage.getItem('userRole')` returns `"admin"`
3. Check token is valid and not expired

### Images Not Uploading
**Problem**: Image upload fails or returns error
**Solution**:
1. Check file format (must be JPG, PNG, or WebP)
2. Verify backend is running on port 8000
3. Check `NEXT_PUBLIC_API_URL` in `.env.local`
4. Ensure images directory exists: `baitech-frontend/public/images/`
5. Check Pillow is installed: `pip install Pillow`

### Products Not Appearing on Frontend
**Problem**: Products added in admin don't show on website
**Solution**:
1. Verify product was saved (check MongoDB)
2. Ensure `featured: true` if expecting it on homepage
3. Check API endpoint returns products: `http://localhost:8000/api/v1/products`
4. Clear browser cache or do hard refresh

### Dashboard Stats Not Loading
**Problem**: Dashboard shows loading spinner forever
**Solution**:
1. Check browser console for errors
2. Verify authentication token is present
3. Check backend is running: `http://localhost:8000/admin/stats`
4. Ensure all database collections exist (products, services, orders, users, reviews)

---

## Performance Tips

### Image Optimization
- **Upload images once**: Images are automatically optimized, no need to pre-resize
- **Original images backed up**: Check `baitech-frontend/public/images_backup/`
- **Use WebP when possible**: Automatically generated for supported browsers
- **Lazy load images**: Frontend components automatically lazy load images

### Database
- **Index frequently queried fields**: product_id, service_id, category
- **Monitor collection sizes**: Products and services should be indexed
- **Regular backups**: Backup MongoDB regularly

---

## Future Enhancements

Potential features to add:
1. **Bulk product import** from CSV/Excel
2. **Image crop/resize tool** in the upload component
3. **Order management** section
4. **User management** with role assignment
5. **Analytics dashboard** with charts and graphs
6. **Inventory alerts** via email/SMS for low stock
7. **Product categories management**
8. **Discount/promotion management**
9. **SEO metadata editor** for products
10. **Activity log** for admin actions

---

## Support

For issues or questions:
1. Check this guide first
2. Review `PERFORMANCE_IMPROVEMENTS.md` for image optimization details
3. Check browser console and backend logs for errors
4. Verify all environment variables are set correctly

---

## Summary

The Baitech Admin Panel provides:
- ✅ Easy product and service management
- ✅ Automatic image optimization on upload
- ✅ Real-time dashboard statistics
- ✅ Secure admin authentication
- ✅ Mobile-responsive design
- ✅ Intuitive user interface

Get started by logging in with your admin credentials at `/admin`!
