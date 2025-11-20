#!/usr/bin/env python3
"""
Script to fix the password field name in existing admin users
Changes 'password' field to 'hashed_password' for all users
"""

import os
import sys
from pymongo import MongoClient
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

def main():
    log("\n🔧 Baitech Admin Password Field Fixer", 'BOLD')
    log("=" * 60, 'BOLD')

    # Get MongoDB connection from environment
    mongo_url = os.getenv('MONGO_URL')
    mongo_db = os.getenv('MONGO_DB', 'baitekdb')

    if not mongo_url:
        log("\n❌ ERROR: MONGO_URL not found in environment", 'RED')
        log("💡 Make sure .env file is loaded", 'YELLOW')
        return 1

    log(f"Database: {mongo_db}", 'CYAN')
    log(f"MongoDB URL: {mongo_url[:50]}...\n", 'CYAN')

    try:
        log("📤 Connecting to MongoDB...", 'BLUE')
        client = MongoClient(mongo_url)

        # Test connection
        client.admin.command('ping')
        log("✓ Connected successfully!\n", 'GREEN')

        # Get database
        db = client[mongo_db]

        # Find users with 'password' field but no 'hashed_password' field
        log("🔍 Searching for users with old password field...", 'BLUE')
        users_to_fix = list(db.users.find({
            "password": {"$exists": True},
            "hashed_password": {"$exists": False}
        }))

        if not users_to_fix:
            log("✓ No users need fixing! All users have correct field names.", 'GREEN')
        else:
            log(f"\n⚠ Found {len(users_to_fix)} user(s) that need fixing:", 'YELLOW')
            for i, user in enumerate(users_to_fix, 1):
                log(f"  {i}. {user.get('name', 'Unknown')} - {user.get('email', 'N/A')} (Role: {user.get('role', 'customer')})", 'CYAN')

            log(f"\n🔄 Fixing password field for {len(users_to_fix)} user(s)...", 'BLUE')

            fixed_count = 0
            for user in users_to_fix:
                # Rename 'password' field to 'hashed_password'
                result = db.users.update_one(
                    {"_id": user["_id"]},
                    {
                        "$rename": {"password": "hashed_password"},
                        "$set": {"updated_at": datetime.utcnow()}
                    }
                )

                if result.modified_count > 0:
                    fixed_count += 1
                    log(f"  ✓ Fixed: {user.get('email')}", 'GREEN')

            log(f"\n✅ Successfully fixed {fixed_count} user(s)!", 'GREEN')

        # Display all admin users
        log("\n📋 Current Admin Users:", 'BLUE')
        log("-" * 60, 'BOLD')
        admins = list(db.users.find({"role": "admin"}))

        if not admins:
            log("❌ No admin users found!", 'RED')
            log("\n💡 Run the create_atlas_admin.py script to create an admin user", 'YELLOW')
        else:
            for i, admin in enumerate(admins, 1):
                has_hashed_pwd = "hashed_password" in admin
                status = "✓" if has_hashed_pwd else "❌"
                log(f"  {i}. {status} {admin.get('name')} ({admin.get('email')}) - Field: {'hashed_password' if has_hashed_pwd else 'password'}",
                    'GREEN' if has_hashed_pwd else 'RED')

        log("-" * 60, 'BOLD')

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
