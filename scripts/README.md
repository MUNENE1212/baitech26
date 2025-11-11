# Scripts Directory

Organized collection of scripts for setup, development, and maintenance.

---

## 📁 Directory Structure

```
scripts/
├── setup/              # Initial setup and database seeding
├── dev/                # Development and testing utilities
├── utils/              # Maintenance and utility scripts
└── README.md           # This file
```

---

## 🚀 Setup Scripts (`setup/`)

Scripts for initial setup and database configuration.

### `setup_env.sh`
Quick environment file setup from templates.

```bash
bash scripts/setup/setup_env.sh
```

**What it does**:
- Copies `.env.example` to `.env`
- Copies frontend `.env.local.example` to `.env.local`
- Copies `setup_admin.py.example` to `setup_admin.py`
- Reminds to generate SECRET_KEY

**When to use**: First time setup on a new machine

---

### `create_admin.py`
Alternative admin user creation script.

```bash
python3 scripts/setup/create_admin.py
```

**When to use**: Creating admin users

---

### `setup_admin.py`
Main admin user setup (ignored by git).

```bash
python3 scripts/setup/setup_admin.py
```

**Note**: This file is created from `setup_admin.py.example` and contains your actual credentials.

---

### `seed_database.py`
Seed the database with sample products and services.

```bash
python3 scripts/setup/seed_database.py
```

**What it does**:
- Populates products collection
- Adds sample services
- Creates initial data for testing

**When to use**: Initial database setup or reset

---

### `seed_services.py`
Seed only services data.

```bash
python3 scripts/setup/seed_services.py
```

**When to use**: Adding/updating service offerings

---

### `migrate_to_atlas.py`
Migrate data from local MongoDB to MongoDB Atlas.

```bash
python3 scripts/setup/migrate_to_atlas.py
```

**What it does**:
- Exports data from local MongoDB
- Imports to MongoDB Atlas
- Verifies data integrity

**When to use**: Moving from development to production database

---

## 🔧 Utility Scripts (`utils/`)

Maintenance and optimization utilities.

### `optimize_images.py`
Batch optimize all product images.

```bash
python3 scripts/utils/optimize_images.py
```

**What it does**:
- Creates 3 size variants (thumbnail/medium/large)
- Generates WebP versions
- Backs up originals
- Processes all images in `baitech-frontend/public/images/`

**When to use**: After adding new product images

---

### `validate_product_images.py`
Validate and fix product image references.

```bash
python3 scripts/utils/validate_product_images.py
```

**What it does**:
- Checks all products for missing images
- Suggests alternative formats (jpg/webp/jpeg)
- Updates database with correct paths
- Reports missing files

**When to use**: Troubleshooting 404 image errors

---

### `process_avif_with_heif.py`
Process AVIF images and generate variants.

```bash
python3 scripts/utils/process_avif_with_heif.py /path/to/avif/files
```

**What it does**:
- Reads AVIF files
- Generates JPEG, WebP variants
- Creates all size variants
- Moves to public/images/

**When to use**: Adding new AVIF product images

---

### `fix_missing_images.py`
Fix missing WebP images by regenerating from source.

```bash
python3 scripts/utils/fix_missing_images.py
```

**What it does**:
- Identifies missing WebP files
- Regenerates from PNG/JPEG sources
- Updates database references

**When to use**: After image optimization errors

---

### `remove_secrets_from_git.sh`
Emergency cleanup for committed secrets.

```bash
bash scripts/utils/remove_secrets_from_git.sh
```

**What it does**:
- Removes `.env` files from git history
- Uses BFG Repo-Cleaner
- Cleans up repository
- Requires force push

**When to use**: If you accidentally committed secrets

⚠️ **WARNING**: Rewrites git history!

---

## 🛠️ Development Scripts (`dev/`)

Testing and development utilities.

### `insert_p.py`
Insert sample products for testing.

```bash
python3 scripts/dev/insert_p.py
```

**When to use**: Quick product data for development

---

### `featuredmark.py`
Mark products as featured for testing.

```bash
python3 scripts/dev/featuredmark.py
```

**When to use**: Testing featured products display

---

## 📋 Usage Examples

### Complete New Setup

```bash
# 1. Setup environment files
bash scripts/setup/setup_env.sh

# 2. Edit environment files
nano .env
nano baitech-frontend/.env.local

# 3. Create admin user
python3 scripts/setup/setup_admin.py

# 4. Seed database
python3 scripts/setup/seed_database.py

# 5. Optimize images
python3 scripts/utils/optimize_images.py

# 6. Start development
python3 main.py  # Backend
cd baitech-frontend && npm run dev  # Frontend
```

### After Adding New Images

```bash
# 1. Optimize images
python3 scripts/utils/optimize_images.py

# 2. Validate references
python3 scripts/utils/validate_product_images.py

# 3. Check frontend
npm run dev
```

### Database Reset

```bash
# 1. Drop collections (use MongoDB Compass or shell)
# 2. Re-seed
python3 scripts/setup/seed_database.py

# 3. Create admin
python3 scripts/setup/setup_admin.py
```

---

## 🔐 Security Notes

### Ignored Scripts

These scripts are in `.gitignore` and should NOT be committed:
- `scripts/setup/setup_admin.py` - Contains admin credentials

### Safe Scripts

These scripts are safe to commit:
- All scripts except `setup_admin.py`
- Always use `.example` versions as templates

---

## 📚 Related Documentation

- [Main README](../README.md) - Project overview
- [Security Guide](../docs/SECURITY.md) - Security best practices
- [Deployment Guide](../docs/DEPLOYMENT_GUIDE.md) - Production deployment

---

**Last Updated**: November 12, 2025
