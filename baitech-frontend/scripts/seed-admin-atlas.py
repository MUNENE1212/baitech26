#!/usr/bin/env python3
"""
Direct Atlas Admin Seeder
Connects directly to MongoDB Atlas and creates an admin user

Usage: python scripts/seed-admin-atlas.py
"""

import getpass
from pymongo import MongoClient
import bcrypt
from datetime import datetime

# ANSI color codes
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

def hash_password(password):
    """Hash password using bcrypt"""
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def main():
    log("\n🚀 Atlas Admin User Seeder", 'BOLD')
    log("=" * 50, 'BOLD')
    log("This script will create an admin user directly in MongoDB Atlas\n", 'CYAN')

    # Get MongoDB URI
    log("Step 1: MongoDB Connection", 'BLUE')
    log("-" * 50, 'BLUE')
    mongodb_uri = input(f"{Colors.CYAN}Enter your MongoDB Atlas URI: {Colors.RESET}").strip()

    if not mongodb_uri:
        log("\n❌ ERROR: MongoDB URI is required!", 'RED')
        return

    # Get admin credentials
    log("\n🔐 Step 2: Admin User Details", 'BLUE')
    log("-" * 50, 'BLUE')

    name = input(f"{Colors.CYAN}Admin Name: {Colors.RESET}").strip()
    email = input(f"{Colors.CYAN}Admin Email: {Colors.RESET}").strip()
    password = getpass.getpass(f"{Colors.CYAN}Admin Password: {Colors.RESET}")
    confirm_password = getpass.getpass(f"{Colors.CYAN}Confirm Password: {Colors.RESET}")
    phone = input(f"{Colors.CYAN}Admin Phone: {Colors.RESET}").strip()

    # Validate inputs
    if not all([name, email, password, phone]):
        log("\n❌ ERROR: All fields are required!", 'RED')
        return

    if password != confirm_password:
        log("\n❌ ERROR: Passwords do not match!", 'RED')
        return

    if len(password) < 6:
        log("\n❌ ERROR: Password must be at least 6 characters!", 'RED')
        return

    if '@' not in email:
        log("\n❌ ERROR: Invalid email format!", 'RED')
        return

    # Review details
    log("\n📋 Step 3: Review Admin Details", 'YELLOW')
    log("-" * 50, 'YELLOW')
    log(f"  Name:  {name}")
    log(f"  Email: {email}")
    log(f"  Phone: {phone}")
    log(f"  Role:  admin\n")

    confirm = input(f"{Colors.YELLOW}Proceed with creating this admin user? (yes/no): {Colors.RESET}").strip().lower()

    if confirm not in ['yes', 'y']:
        log("\n❌ Operation cancelled.", 'RED')
        return

    # Connect to MongoDB and insert admin
    try:
        log("\n📤 Step 4: Connecting to MongoDB Atlas...", 'BLUE')

        # Connect to MongoDB
        client = MongoClient(mongodb_uri)

        # Test connection
        client.admin.command('ping')
        log("✓ Connected to MongoDB Atlas successfully!", 'GREEN')

        # Get database (extract from URI or use default)
        db_name = "baitech_db"  # Default database name
        if '/' in mongodb_uri:
            parts = mongodb_uri.split('/')
            if len(parts) > 3 and '?' in parts[-1]:
                db_name = parts[-1].split('?')[0]
            elif len(parts) > 3 and parts[-1] and not parts[-1].startswith('?'):
                db_name = parts[-1].split('?')[0] if '?' in parts[-1] else parts[-1]

        db = client[db_name]
        log(f"✓ Using database: {db_name}", 'GREEN')

        # Check if admin already exists
        existing_admin = db.users.find_one({"email": email})
        if existing_admin:
            log(f"\n❌ ERROR: Admin user already exists with email: {email}", 'RED')
            log("💡 Try logging in instead, or use a different email.", 'YELLOW')
            client.close()
            return

        # Hash password
        log("✓ Hashing password...", 'GREEN')
        hashed_password = hash_password(password)

        # Create admin user document
        admin_user = {
            "name": name,
            "email": email,
            "password": hashed_password,
            "phone": phone,
            "role": "admin",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }

        # Insert into database
        log("✓ Inserting admin user into database...", 'GREEN')
        result = db.users.insert_one(admin_user)

        log("\n✅ SUCCESS!", 'GREEN')
        log("=" * 50, 'GREEN')
        log("Admin user created successfully!\n", 'GREEN')
        log("Admin Details:", 'BOLD')
        log(f"  ID:    {result.inserted_id}", 'CYAN')
        log(f"  Name:  {name}", 'CYAN')
        log(f"  Email: {email}", 'CYAN')
        log(f"  Phone: {phone}", 'CYAN')
        log(f"  Role:  admin", 'CYAN')
        log(f"\n🎉 You can now log in to the admin panel!", 'GREEN')
        log(f"   URL: http://localhost:3000/admin\n", 'BLUE')

        # Close connection
        client.close()

    except Exception as e:
        log(f"\n❌ ERROR!", 'RED')
        log("=" * 50, 'RED')

        error_msg = str(e)
        if "authentication failed" in error_msg.lower():
            log("Authentication failed. Check your MongoDB URI credentials.", 'RED')
        elif "connection" in error_msg.lower() or "timeout" in error_msg.lower():
            log("Cannot connect to MongoDB Atlas.", 'RED')
            log("\n💡 Check:", 'YELLOW')
            log("   - Your MongoDB URI is correct", 'YELLOW')
            log("   - Your IP address is whitelisted in Atlas", 'YELLOW')
            log("   - Your internet connection is stable", 'YELLOW')
        else:
            log(f"Failed to create admin user: {error_msg}", 'RED')

        return

if __name__ == "__main__":
    try:
        main()
        log("\n✨ Done!\n", 'GREEN')
    except KeyboardInterrupt:
        log("\n\n❌ Operation cancelled by user.\n", 'RED')
    except Exception as e:
        log(f"\n💥 Unexpected error: {str(e)}\n", 'RED')
