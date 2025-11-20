#!/usr/bin/env python3
"""
Simple standalone script to create admin user directly in MongoDB Atlas
No complex dependencies - just pymongo and bcrypt
"""

import os
import sys
from pymongo import MongoClient
import bcrypt
from datetime import datetime

# ANSI colors
class Colors:
    GREEN = '\033[32m'
    RED = '\033[31m'
    YELLOW = '\033[33m'
    BLUE = '\033[34m'
    CYAN = '\033[36m'
    BOLD = '\033[1m'
    RESET = '\033[0m'

def log(message, color='RESET'):
    color_code = getattr(Colors, color, Colors.RESET)
    print(f"{color_code}{message}{Colors.RESET}")

def hash_password(password: str) -> str:
    """Hash password using bcrypt"""
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def main():
    log("\n🚀 Baitech Admin User Creator", 'BOLD')
    log("=" * 60, 'BOLD')

    # Get MongoDB connection from environment
    mongo_url = os.getenv('MONGO_URL')
    mongo_db = os.getenv('MONGO_DB', 'baitekdb')

    if not mongo_url:
        log("\n❌ ERROR: MONGO_URL not found in environment", 'RED')
        log("💡 Make sure .env file is loaded", 'YELLOW')
        return 1

    log(f"Database: {mongo_db}", 'CYAN')
    log(f"Atlas URL: {mongo_url[:50]}...\n", 'CYAN')

    # Admin credentials
    admin_email = "admin@baitech.co.ke"
    admin_password = "Wincers#1"

    try:
        log("📤 Connecting to MongoDB Atlas...", 'BLUE')
        client = MongoClient(mongo_url)

        # Test connection
        client.admin.command('ping')
        log("✓ Connected successfully!\n", 'GREEN')

        # Get database
        db = client[mongo_db]

        # Check if admin exists
        log(f"🔍 Checking for existing admin: {admin_email}", 'BLUE')
        existing = db.users.find_one({"email": admin_email})

        if existing:
            log(f"\n⚠ Admin already exists!", 'YELLOW')
            log(f"   Name:  {existing.get('name')}", 'CYAN')
            log(f"   Email: {existing.get('email')}", 'CYAN')
            log(f"   Role:  {existing.get('role')}", 'CYAN')

            # Ensure admin role
            log("\n🔄 Ensuring admin role is set...", 'BLUE')
            db.users.update_one(
                {"email": admin_email},
                {"$set": {"role": "admin"}}
            )
            log("✓ Admin role confirmed", 'GREEN')
        else:
            # Create new admin
            log("\n📝 Creating new admin user...", 'BLUE')
            hashed_pwd = hash_password(admin_password)

            admin_data = {
                "name": "Baitech Admin",
                "email": admin_email,
                "hashed_password": hashed_pwd,
                "phone": "+254700000000",
                "role": "admin",
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }

            result = db.users.insert_one(admin_data)
            log(f"✓ Admin created! ID: {result.inserted_id}", 'GREEN')

        # Display credentials
        log("\n" + "=" * 60, 'BOLD')
        log("ADMIN LOGIN CREDENTIALS", 'BOLD')
        log("=" * 60, 'BOLD')
        log(f"Email:    {admin_email}", 'CYAN')
        log(f"Password: {admin_password}", 'CYAN')
        log(f"Role:     admin", 'CYAN')
        log("\n⚠ IMPORTANT: Change the password after first login!", 'YELLOW')
        log("\nLogin at: http://localhost:3000/login", 'BLUE')
        log("=" * 60, 'BOLD')

        # List all admins
        log("\n📋 All Admin Users:", 'BLUE')
        admins = list(db.users.find({"role": "admin"}))
        for i, admin in enumerate(admins, 1):
            log(f"  {i}. {admin.get('name')} - {admin.get('email')}", 'CYAN')

        client.close()
        log("\n✨ Done!\n", 'GREEN')
        return 0

    except Exception as e:
        log(f"\n❌ ERROR: {str(e)}", 'RED')

        if "authentication failed" in str(e).lower():
            log("💡 Check your MongoDB credentials", 'YELLOW')
        elif "timeout" in str(e).lower() or "connection" in str(e).lower():
            log("💡 Check:", 'YELLOW')
            log("   - Internet connection", 'YELLOW')
            log("   - MongoDB Atlas IP whitelist", 'YELLOW')
            log("   - Firewall settings", 'YELLOW')

        return 1

if __name__ == "__main__":
    # Load .env file
    try:
        from dotenv import load_dotenv
        load_dotenv()
    except ImportError:
        log("⚠ python-dotenv not found, using system environment", 'YELLOW')

    sys.exit(main())
