# Project Structure

Professional organization of the Baitech e-commerce platform.

---

## 📁 Directory Structure

```
newbaitech/
│
├── baitech-frontend/           # Next.js 16 Frontend Application
│   ├── app/                    # Next.js App Router
│   │   ├── admin/              # Admin panel pages
│   │   ├── login/              # Authentication pages
│   │   ├── products/           # Product pages
│   │   └── services/           # Service pages
│   ├── components/             # React Components
│   │   ├── admin/              # Admin-specific components
│   │   ├── products/           # Product display components
│   │   ├── services/           # Service components
│   │   └── ui/                 # Reusable UI components
│   ├── public/                 # Static assets
│   │   └── images/             # Optimized product images
│   ├── .env.local.example      # Frontend environment template
│   ├── .env.production.example # Frontend production template
│   ├── next.config.ts          # Next.js configuration
│   └── package.json            # Frontend dependencies
│
├── routes/                     # FastAPI Route Handlers
│   ├── auth_routes.py          # Authentication (login/register)
│   ├── products_routes.py      # Product CRUD operations
│   ├── services_routes.py      # Service management
│   └── admin_routes.py         # Admin-only endpoints
│
├── utils/                      # Backend Utilities
│   ├── database.py             # MongoDB connection & setup
│   ├── security.py             # Password hashing (bcrypt)
│   ├── auth.py                 # JWT authentication
│   └── image_optimizer.py      # Image processing (Pillow)
│
├── deployment/                 # Production Deployment Files
│   ├── nginx/                  # Web Server Configuration
│   │   └── baitech.conf        # Nginx reverse proxy config
│   └── scripts/                # Deployment Automation
│       ├── setup.sh            # Initial VPS setup
│       ├── deploy.sh           # Application deployment
│       ├── setup-ssl.sh        # SSL certificate setup
│       ├── backup-db.sh        # Database backup
│       └── restore-db.sh       # Database restore
│
├── scripts/                    # Development & Maintenance Scripts
│   ├── setup/                  # Initial Setup Scripts
│   │   ├── setup_env.sh        # Environment file setup
│   │   ├── create_admin.py     # Admin user creation
│   │   ├── setup_admin.py.example  # Admin setup template
│   │   ├── seed_database.py    # Database seeding
│   │   ├── seed_services.py    # Service data seeding
│   │   └── migrate_to_atlas.py # MongoDB Atlas migration
│   ├── utils/                  # Utility Scripts
│   │   ├── optimize_images.py  # Batch image optimization
│   │   ├── validate_product_images.py  # Image validation
│   │   ├── process_avif_with_heif.py  # AVIF processing
│   │   ├── fix_missing_images.py      # Image repair
│   │   └── remove_secrets_from_git.sh # Git cleanup
│   ├── dev/                    # Development Scripts
│   │   ├── insert_p.py         # Test product insertion
│   │   └── featuredmark.py     # Mark featured products
│   └── README.md               # Scripts documentation
│
├── docs/                       # Project Documentation
│   ├── README.md               # Documentation index
│   ├── SECURITY.md             # Security guide (730 lines)
│   ├── PRE_PUSH_CHECKLIST.md  # Pre-commit verification
│   ├── DEPLOYMENT_GUIDE.md    # Production deployment (600+ lines)
│   ├── DEPLOYMENT_FILES.md    # Deployment reference
│   ├── ADMIN_PANEL_GUIDE.md   # Admin features
│   ├── NEXTJS_WARNINGS_FIXED.md   # Image optimization
│   ├── PERFORMANCE_IMPROVEMENTS.md # Performance guide
│   ├── AVIF_IMAGES_ADDED.md   # AVIF support
│   ├── SEEDING_GUIDE.md       # Database seeding
│   └── SEEDING_OVERVIEW.md    # Seeding process
│
├── seed_data/                  # Seed Data Files
│   └── (JSON/Python seed data)
│
├── exported_data/              # Data Export Directory
│   └── (Database exports)
│
├── .env.example                # Backend environment template
├── .env.production.example     # Backend production template
├── .gitignore                  # Git ignore rules
├── ecosystem.config.js         # PM2 process manager config
├── main.py                     # FastAPI application entry point
├── requirements.txt            # Python dependencies
├── README.md                   # Main project README
├── READY_TO_PUSH.md           # Push instructions
└── PROJECT_STRUCTURE.md       # This file
```

---

## 🎯 Key Files

### Root Level

| File | Purpose |
|------|---------|
| `main.py` | FastAPI application entry point |
| `requirements.txt` | Python package dependencies |
| `ecosystem.config.js` | PM2 process manager configuration |
| `.env.example` | Backend environment template (development) |
| `.env.production.example` | Backend environment template (production) |
| `.gitignore` | Git ignore rules (protects secrets) |
| `README.md` | Main project documentation |

### Configuration Files

| File | Purpose |
|------|---------|
| `baitech-frontend/next.config.ts` | Next.js configuration (image optimization, etc.) |
| `baitech-frontend/package.json` | Frontend dependencies and scripts |
| `baitech-frontend/tsconfig.json` | TypeScript configuration |
| `deployment/nginx/baitech.conf` | Nginx reverse proxy configuration |
| `ecosystem.config.js` | PM2 process manager (backend + frontend) |

### Environment Files

| File | Purpose | Committed? |
|------|---------|-----------|
| `.env.example` | Backend development template | ✅ Yes |
| `.env.production.example` | Backend production template | ✅ Yes |
| `.env` | Actual backend secrets | ❌ No (.gitignore) |
| `.env.production` | Actual production secrets | ❌ No (.gitignore) |
| `baitech-frontend/.env.local.example` | Frontend dev template | ✅ Yes |
| `baitech-frontend/.env.production.example` | Frontend prod template | ✅ Yes |
| `baitech-frontend/.env.local` | Actual frontend secrets | ❌ No (.gitignore) |

---

## 📂 Directory Purposes

### `/baitech-frontend`
Next.js 16 frontend with TypeScript and React 19.

**Contains**:
- App Router pages (`app/`)
- React components (`components/`)
- Optimized images (`public/images/`)
- Client-side state management (Zustand)
- Tailwind CSS styling

**Entry Point**: `npm run dev` or `npm start`

---

### `/routes`
FastAPI route handlers (backend API).

**Endpoints**:
- `/api/products` - Product catalog
- `/api/services` - Service offerings
- `/login`, `/register` - Authentication
- `/admin/*` - Admin operations

**Security**: JWT authentication with role-based access control

---

### `/utils`
Backend utility modules.

| File | Purpose |
|------|---------|
| `database.py` | MongoDB connection (Motor async driver) |
| `security.py` | Password hashing (bcrypt via passlib) |
| `auth.py` | JWT token generation & validation |
| `image_optimizer.py` | Image processing (Pillow, WebP, AVIF) |

---

### `/deployment`
Production deployment automation.

**Nginx Configuration**:
- Reverse proxy (FastAPI + Next.js)
- SSL/TLS (Let's Encrypt)
- Security headers (HSTS, CSP, etc.)
- Gzip compression
- Static file caching

**Scripts**:
- Initial server setup (Python, Node.js, Nginx)
- Application deployment
- SSL certificate automation
- Database backup/restore

---

### `/scripts`
Development and maintenance scripts organized by purpose.

#### `/scripts/setup`
Initial setup and database configuration.

- Environment file creation
- Admin user setup
- Database seeding
- MongoDB Atlas migration

#### `/scripts/utils`
Maintenance and optimization utilities.

- Image optimization (batch processing)
- Image validation and repair
- AVIF format processing
- Git secret cleanup

#### `/scripts/dev`
Development and testing utilities.

- Test data insertion
- Feature flags
- Development helpers

---

### `/docs`
Comprehensive project documentation (12 guides).

**Main Guides**:
- Security best practices
- Deployment instructions
- Pre-push verification
- Performance optimization

**Total**: ~3000 lines of documentation

---

## 🗃️ Database Structure

### MongoDB Collections

| Collection | Purpose | Key Fields |
|------------|---------|------------|
| `products` | Product catalog | product_id, name, price, images[], category |
| `services_offered` | Service offerings | service_id, title, description, pricing |
| `users` | User accounts | email, hashed_password, role (admin/customer) |
| `reviews` | Product reviews | product_id, user_id, rating, comment |
| `orders` | Customer orders | order_id, user_id, items[], total, status |

---

## 🔐 Security Files

### Protected Files (Never Commit)

Located in `.gitignore`:
- `.env`, `.env.production` - MongoDB credentials, SECRET_KEY
- `scripts/setup/setup_admin.py` - Admin password
- `baitech-frontend/.env.local` - Frontend secrets
- `backups/` - Database backups
- `*.pem`, `*.key` - SSL certificates

### Safe Template Files (Do Commit)

- `*.example` files - All config templates with placeholders
- Documentation - All `docs/` content
- Deployment scripts - Automation scripts

---

## 📊 Technology Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **UI Library**: React 19
- **Styling**: Tailwind CSS
- **State**: Zustand
- **Image Optimization**: Next.js Image (AVIF/WebP)

### Backend
- **Framework**: FastAPI (Python 3.11)
- **Database**: MongoDB Atlas (Motor async driver)
- **Authentication**: JWT (python-jose)
- **Password Hashing**: bcrypt (passlib)
- **Image Processing**: Pillow + pillow-heif

### Deployment
- **Web Server**: Nginx (reverse proxy)
- **Process Manager**: PM2 (backend + frontend)
- **SSL**: Let's Encrypt (Certbot)
- **Server**: Ubuntu 20.04+ VPS (HostAfrica)

---

## 🚀 Workflow

### Development

```bash
# 1. Setup environment
bash scripts/setup/setup_env.sh

# 2. Create admin
python3 scripts/setup/create_admin.py

# 3. Seed database
python3 scripts/setup/seed_database.py

# 4. Start backend (Terminal 1)
python3 main.py

# 5. Start frontend (Terminal 2)
cd baitech-frontend && npm run dev
```

### Adding Images

```bash
# 1. Add images to baitech-frontend/public/images/
# 2. Optimize
python3 scripts/utils/optimize_images.py

# 3. Validate
python3 scripts/utils/validate_product_images.py
```

### Deployment

```bash
# On VPS
sudo bash deployment/scripts/setup.sh
sudo bash deployment/scripts/deploy.sh
sudo bash deployment/scripts/setup-ssl.sh
```

---

## 📏 Code Organization Principles

1. **Separation of Concerns**: Frontend, backend, scripts, docs clearly separated
2. **Logical Grouping**: Related files in same directory
3. **Security First**: Sensitive files properly excluded
4. **Documentation**: Every directory has README or guide
5. **Professional Structure**: Industry-standard layout

---

## 🔍 Finding Files

| I need to... | Look in... |
|--------------|-----------|
| Add a new API endpoint | `routes/` |
| Create a React component | `baitech-frontend/components/` |
| Optimize images | `scripts/utils/optimize_images.py` |
| Setup environment | `scripts/setup/setup_env.sh` |
| Deploy to production | `deployment/scripts/` |
| Read documentation | `docs/` |
| Configure database | `utils/database.py` |
| Configure Nginx | `deployment/nginx/baitech.conf` |

---

## ✅ Professional Standards Met

- [x] Clear directory structure
- [x] Logical file organization
- [x] Comprehensive documentation
- [x] Security best practices
- [x] Deployment automation
- [x] Development workflow
- [x] Git hygiene (.gitignore)
- [x] README files in key directories
- [x] Scalable architecture

---

**Last Updated**: November 12, 2025
**Status**: Production-Ready Professional Structure
