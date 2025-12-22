#!/usr/bin/env node

/**
 * Security Credentials Rotation Script
 *
 * This script helps rotate exposed security credentials and generates new secure values.
 *
 * Usage: node scripts/security/rotate-secrets.js [--dry-run]
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Generate cryptographically secure random secrets
function generateSecureSecret(length = 64) {
  return crypto.randomBytes(length).toString('base64').replace(/[+/=]/g, '').slice(0, length);
}

// Generate MongoDB secure password
function generateMongoPassword() {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return result;
}

// Main rotation function
function rotateSecrets(dryRun = false) {
  console.log('🔐 Security Credentials Rotation Script');
  console.log('=====================================\n');

  const newSecrets = {
    // Generate new secure secrets
    JWT_SECRET: generateSecureSecret(64),
    SESSION_SECRET: generateSecureSecret(64),
    NEXTAUTH_SECRET: generateSecureSecret(64),

    // Generate new MongoDB credentials
    MONGODB_PASSWORD: generateMongoPassword(),

    // Generate new Cloudinary credentials (note: these need to be updated in Cloudinary dashboard)
    CLOUDINARY_API_SECRET: generateSecureSecret(40),

    // Generate new email app password
    EMAIL_APP_PASSWORD: generateSecureSecret(32),
  };

  console.log('🔑 Generated New Secrets:');
  console.log('------------------------');

  Object.entries(newSecrets).forEach(([key, value]) => {
    console.log(`${key}: ${value}`);
  });

  console.log('\n📋 Required Manual Actions:');
  console.log('--------------------------');

  console.log('1. MongoDB Atlas:');
  console.log('   - Update database user password');
  console.log('   - Update connection string in environment files');

  console.log('\n2. Cloudinary Dashboard:');
  console.log('   - Regenerate API secret');
  console.log('   - Update environment variables');

  console.log('\n3. Email Provider:');
  console.log('   - Generate new app-specific password');
  console.log('   - Update SMTP credentials');

  console.log('\n4. Git Repository:');
  console.log('   - Remove current .env.local from version control');
  console.log('   - Add .env.local to .gitignore');
  console.log('   - Remove secrets from git history');

  if (!dryRun) {
    console.log('\n⚠️  AUTOMATIC ACTIONS:');
    console.log('--------------------');

    // Backup current .env.local
    const envPath = path.join(process.cwd(), '.env.local');
    const backupPath = path.join(process.cwd(), '.env.local.backup');

    if (fs.existsSync(envPath)) {
      fs.copyFileSync(envPath, backupPath);
      console.log('✓ Created backup of .env.local');
    }

    // Create new secure .env.local template
    const secureTemplate = `# Database Configuration (UPDATED - ROTATE IMMEDIATELY)
MONGODB_URI=mongodb+srv://baitech:${newSecrets.MONGODB_PASSWORD}@cluster0.nmtob1l.mongodb.net/baitekdb
MONGODB_URL=mongodb+srv://baitech:${newSecrets.MONGODB_PASSWORD}@cluster0.nmtob1l.mongodb.net/baitekdb

# Redis Configuration (optional)
REDIS_URL=redis://localhost:6379
REDIS_URI=redis://localhost:6379

# JWT Configuration (UPDATED - NEW SECURE SECRET)
JWT_SECRET=${newSecrets.JWT_SECRET}
JWT_EXPIRES_IN=24h  # Reduced for security
NEXTAUTH_SECRET=${newSecrets.NEXTAUTH_SECRET}

# Application Configuration
NODE_ENV=development
PORT=3000

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001,https://baitech.co.ke,https://www.baitech.co.ke

# Email Configuration (UPDATE WITH NEW APP PASSWORD)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=${newSecrets.EMAIL_APP_PASSWORD}
FROM_EMAIL=noreply@baitech.co.ke
FROM_NAME=EmenTech

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_DIR=uploads

# Cloudinary Configuration (UPDATE IN CLOUDINARY DASHBOARD)
CLOUDINARY_CLOUD_NAME=dzobbamlm
CLOUDINARY_API_KEY=325998585657877
CLOUDINARY_API_SECRET=${newSecrets.CLOUDINARY_API_SECRET}

# Rate Limiting Configuration (STRICTER LIMITS)
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=50   # Reduced for security

# API Configuration
API_BASE_URL=http://localhost:3000
API_VERSION=v1
NEXT_PUBLIC_API_URL=http://localhost:3000

# Security Configuration (UPDATED - NEW SECURE SECRET)
BCRYPT_ROUNDS=14  # Increased for security
SESSION_SECRET=${newSecrets.SESSION_SECRET}

# Cache Configuration
CACHE_TTL=1800
PRODUCTS_CACHE_TTL=900
HOMEPAGE_CACHE_TTL=1800`;

    fs.writeFileSync(path.join(process.cwd(), '.env.local.new'), secureTemplate);
    console.log('✓ Created new .env.local.new with secure secrets');

    console.log('\n📝 NEXT STEPS:');
    console.log('---------------');
    console.log('1. Update MongoDB password in Atlas dashboard');
    console.log('2. Update Cloudinary API secret in dashboard');
    console.log('3. Generate new email app password');
    console.log('4. Replace .env.local with .env.local.new');
    console.log('5. Remove .env.local from git history:');
    console.log('   git filter-branch --force --index-filter "git rm --cached --ignore-unmatch .env.local" --prune-empty --tag-name-filter cat -- --all');
    console.log('6. Add .env.local to .gitignore if not already there');
    console.log('7. Commit and push changes');

  } else {
    console.log('\n🔍 DRY RUN COMPLETED');
    console.log('No files were modified.');
    console.log('Run without --dry-run flag to apply changes.');
  }

  console.log('\n⚡ CRITICAL SECURITY NOTES:');
  console.log('----------------------------');
  console.log('• Rotate ALL passwords immediately');
  console.log('• Test application with new credentials');
  console.log('• Update all production environment files');
  console.log('• Review git history for other exposed secrets');
  console.log('• Consider enabling GitHub secret scanning');
}

// Command line interface
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');

if (args.includes('--help') || args.includes('-h')) {
  console.log('Security Credentials Rotation Script');
  console.log('');
  console.log('Usage: node scripts/security/rotate-secrets.js [options]');
  console.log('');
  console.log('Options:');
  console.log('  --dry-run    Show what would be done without making changes');
  console.log('  --help, -h   Show this help message');
  console.log('');
  console.log('This script generates new secure secrets and provides guidance');
  console.log('for rotating all exposed security credentials.');
  process.exit(0);
}

rotateSecrets(dryRun);