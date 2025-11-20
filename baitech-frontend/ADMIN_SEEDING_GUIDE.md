# Admin User Seeding Guide

## 🎯 Overview
This guide explains how to create an admin user in your remote database.

---

## 🚀 Quick Start

### Option 1: Simple JavaScript Script (Recommended)

**Easiest method - works immediately:**

```bash
node scripts/seed-admin-simple.js
```

### Option 2: TypeScript Script

**Requires tsx:**

```bash
# Install tsx if needed
npm install -D tsx

# Run the script
npx tsx scripts/seed-admin.ts
```

---

## 📋 Step-by-Step Instructions

### Step 1: Update Your Environment

Make sure your `.env` or `.env.production` has the correct API URL:

```bash
# For remote production database
NEXT_PUBLIC_API_URL=https://your-backend-url.com

# For local testing
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Step 2: Run the Seeding Script

```bash
node scripts/seed-admin-simple.js
```

### Step 3: Follow the Prompts

The script will ask you for:

```
🔐 Admin User Setup
==================

Admin Name: John Doe
Admin Email: admin@baitech.com
Admin Password: ********
Confirm Password: ********
Admin Phone: +254712345678
```

### Step 4: Review and Confirm

```
📋 Review Admin Details:
========================

  Name:  John Doe
  Email: admin@baitech.com
  Phone: +254712345678
  Role:  admin

Proceed with creating this admin user? (yes/no): yes
```

### Step 5: Success!

```
✅ SUCCESS!
==========

Admin user created successfully!

Admin Details:
  Name:  John Doe
  Email: admin@baitech.com
  Phone: +254712345678
  Role:  admin

🔑 Access Token:
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

💡 Save this token - you'll need it for admin operations!

🎉 You can now log in to the admin panel!
   URL: http://localhost:3000/admin
```

---

## 🔒 Security Best Practices

### Strong Password Requirements
- ✅ Minimum 8 characters
- ✅ Include uppercase and lowercase
- ✅ Include numbers
- ✅ Include special characters

**Example good passwords:**
- `Admin@2024!Secure`
- `Baitech$Admin123`
- `P@ssw0rd!Strong`

### Email Format
- ✅ Use company email: `admin@baitech.com`
- ✅ Valid email format required
- ❌ Avoid personal emails for admin

### Phone Number
- ✅ Include country code: `+254712345678`
- ✅ Valid Kenyan number format

---

## 🛠️ Troubleshooting

### Error: "Cannot connect to backend"

**Problem:** Script can't reach your backend server

**Solution:**
```bash
# Check your API URL
echo $NEXT_PUBLIC_API_URL

# Make sure backend is running
curl https://your-backend-url.com/health

# Update .env with correct URL
NEXT_PUBLIC_API_URL=https://your-actual-backend.com
```

### Error: "Admin already exists"

**Problem:** An admin with this email already exists

**Solutions:**
1. **Use the existing admin** - Just log in with existing credentials
2. **Use different email** - Create admin with new email
3. **Delete old admin** - Remove from database first (requires DB access)

### Error: "Passwords do not match"

**Problem:** Password and confirmation don't match

**Solution:** Type carefully and ensure both match exactly

### Error: "Invalid email format"

**Problem:** Email doesn't contain `@`

**Solution:** Use valid email: `admin@baitech.com`

### Error: "Password too short"

**Problem:** Password less than 6 characters

**Solution:** Use at least 6 characters (8+ recommended)

---

## 🔄 Alternative Methods

### Method 1: Direct API Call (cURL)

```bash
curl -X POST https://your-backend-url.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@baitech.com",
    "password": "SecurePassword123!",
    "phone": "+254712345678",
    "role": "admin"
  }'
```

### Method 2: Postman/Insomnia

**URL:** `POST https://your-backend-url.com/api/v1/auth/register`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Admin User",
  "email": "admin@baitech.com",
  "password": "SecurePassword123!",
  "phone": "+254712345678",
  "role": "admin"
}
```

### Method 3: Direct Database Insert (MongoDB)

**Only if you have direct DB access:**

```javascript
// Connect to MongoDB
use baitech_db

// Hash password first (use bcrypt)
// Then insert
db.users.insertOne({
  name: "Admin User",
  email: "admin@baitech.com",
  password: "$2b$10$hashed_password_here",
  phone: "+254712345678",
  role: "admin",
  created_at: new Date()
})
```

---

## 📝 What the Script Does

1. ✅ Prompts for admin details
2. ✅ Validates input (email, password, etc.)
3. ✅ Confirms details with you
4. ✅ Sends POST request to `/api/v1/auth/register`
5. ✅ Creates admin user with `role: "admin"`
6. ✅ Returns access token
7. ✅ Shows success message

---

## 🎯 After Seeding

### 1. Save Your Credentials

**Create a secure note:**
```
Baitech Admin Credentials
========================
Email: admin@baitech.com
Password: [your-secure-password]
Token: [save-the-token]
Created: [date]
```

**Store in:**
- Password manager (1Password, LastPass, etc.)
- Secure note
- Encrypted file

**⚠️ NEVER commit credentials to Git!**

### 2. Test Login

```bash
# Start your frontend
npm run dev

# Visit admin page
open http://localhost:3000/admin

# Log in with your credentials
```

### 3. Verify Admin Access

After logging in, you should be able to:
- ✅ View `/admin/products`
- ✅ Add new products
- ✅ Edit products
- ✅ Delete products
- ✅ View `/admin/services`

---

## 🔐 Multiple Admins

### Creating Additional Admins

**Option 1: Run script again with different email**
```bash
node scripts/seed-admin-simple.js
# Use different email: admin2@baitech.com
```

**Option 2: Create from admin panel** (if implemented)
- Log in as existing admin
- Go to user management
- Create new admin user

---

## 🌍 Remote Database Setup

### For Production Server

**1. SSH into your server:**
```bash
ssh user@your-server.com
```

**2. Navigate to project:**
```bash
cd /path/to/baitech-frontend
```

**3. Run seeder:**
```bash
node scripts/seed-admin-simple.js
```

### For Cloud Database (MongoDB Atlas)

**1. Ensure backend can access database:**
```
Backend → MongoDB Atlas (connection string in backend .env)
```

**2. Run seeder from anywhere:**
```bash
# Point to your backend API
NEXT_PUBLIC_API_URL=https://api.baitech.com node scripts/seed-admin-simple.js
```

---

## ✅ Verification Checklist

After seeding, verify:

- [ ] Admin user created in database
- [ ] Can log in to admin panel
- [ ] Can access `/admin/products`
- [ ] Can create new products
- [ ] Can edit products
- [ ] Can delete products
- [ ] Access token works
- [ ] Credentials saved securely

---

## 🆘 Need Help?

### Check Backend Logs

```bash
# If backend is running locally
tail -f backend/logs/app.log

# Check for errors during registration
```

### Check Database

```bash
# MongoDB
mongo
use baitech_db
db.users.find({ role: "admin" })
```

### Verify API Endpoint

```bash
# Test if registration endpoint exists
curl -X POST https://your-backend.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"test":"data"}'
```

---

## 📞 Support

If you encounter issues:

1. **Check this guide** - Most solutions are here
2. **Check backend logs** - Errors often show there
3. **Verify API URL** - Make sure it's correct
4. **Test backend** - Ensure it's running and accessible
5. **Check database** - Verify connection works

---

## 🎉 Success!

Once you see:
```
✅ SUCCESS!
Admin user created successfully!
```

**You're ready to:**
- Log in to admin panel
- Start adding products
- Manage your e-commerce store

**Happy selling! 🚀**
