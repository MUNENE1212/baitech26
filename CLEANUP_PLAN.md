# Cleanup Plan - BAITECH VPS Deployment

## Overview
This document outlines the cleanup process to prepare the application for clean VPS deployment.

## Files and Folders to Remove

### 1. Old Documentation Files (Can be archived or deleted)
- ADMIN_ISSUES_FIX_GUIDE.md
- ADMIN_PAGE_ENHANCEMENTS.md
- ADMIN_SEEDING_GUIDE.md
- ADMIN_USER_GUIDE.md
- CLOUDINARY_SETUP.md
- DEBUGGING_REPORT.md
- DEPLOYMENT_CHECKLIST.md
- DEPLOYMENT_INSTRUCTIONS.md
- FASTAPI_BACKEND_BACKUP_README.md
- FASTAPI_TO_NEXTJS_ROUTES_ANALYSIS.md
- HOMEPAGE_API_INVESTIGATION_REPORT.md
- IMAGE_MIGRATION_REPORT.md
- LINKEDIN_POST.md
- MIGRATION_FINAL_SUMMARY.md
- MIGRATION_PLAN.md
- MIGRATION_SUCCESS.md
- MIGRATION_SUMMARY_NEXTJS_ONLY.md
- NEXTJS_MIGRATION_IMPLEMENTATION_PLAN.md
- PRODUCT_DETAIL_PAGE.md
- PRODUCT_PAGE_FIXES.md
- PYTHON_BACKEND_CLEANUP_GUIDE.md
- PYTHON_BACKEND_ISOLATION_PLAN.md
- REBRANDING_SUMMARY.md
- SECURITY_EMERGENCY_RESPONSE.md
- SECURITY_IMPLEMENTATION_REPORT.md
- VPS_ADMIN_FIX_GUIDE.md

### 2. Old/Unused Scripts
- create-admin.js (use scripts/seed-admin-simple.js instead)
- debug-images.js (development only)

### 3. Backup and Development Folders
- backup-before-migration/ (entire folder)
- baitech-frontend/ (old deleted version, should be completely removed)
- exported_data/ (if exists)
- .agent-workpace/ and .agent-workspace/ (development artifacts)

### 4. Test and Coverage Files (Keep for CI/CD)
- __tests__/ (keep)
- coverage/ (can be generated, remove from repo)
- jest.config.js (keep)
- jest.setup.js (keep)

### 5. Old Configuration Files
- next.config.production.ts.disabled (already disabled, can remove)

## Files to Keep

### Essential Documentation
- README.md (update for production)
- README-NEXTJS.md (merge into README.md)
- README-REDIS.md (merge into README.md)
- PROJECT_STRUCTURE.md (update if needed)

### Production Configuration Files
- Dockerfile
- Dockerfile.dev
- docker-compose.yml
- docker-compose.redis.yml
- .dockerignore
- .env.local.example (update)
- next.config.ts
- package.json
- tsconfig.json
- tailwind.config.ts
- postcss.config.mjs
- eslint.config.mjs

### Essential Scripts
- scripts/setup-redis.sh
- scripts/seed-admin-simple.js
- scripts/security/ (all security-related scripts)

## Deployment Structure

The final structure should be:
```
/
├── app/                    # Next.js app directory
├── components/             # React components
├── lib/                    # Utilities and libraries
├── public/                 # Static assets (with new logos)
├── hooks/                  # React hooks
├── types/                  # TypeScript types
├── scripts/                # Production scripts
│   ├── setup-redis.sh
│   ├── seed-admin-simple.js
│   └── security/
├── __tests__/              # Test files
├── deployment/             # Deployment configurations
│   ├── nginx/
│   └── scripts/
├── .env.local.example      # Environment template
├── Dockerfile              # Production Dockerfile
├── docker-compose.yml      # Docker Compose config
├── next.config.ts          # Next.js config with PWA
├── package.json            # Dependencies
└── README.md               # Updated documentation
```

## Cleanup Steps

1. Create cleanup script
2. Test cleanup in staging
3. Commit changes
4. Push to new repository
5. Deploy to VPS

## New Repository Setup

Target repository: git@github.com:MUNENE1212/baitech26.git

Steps:
1. Initialize new git repo
2. Add only necessary files
3. Create production-ready README
4. Setup deployment workflow
