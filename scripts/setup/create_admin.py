#!/usr/bin/env python3
"""
Script to create an admin user for Baitech Admin Panel
"""
import asyncio
from utils.database import db
from utils.security import hash_password
from getpass import getpass

async def create_admin():
    print("=" * 60)
    print("BAITECH ADMIN USER CREATION")
    print("=" * 60)

    # Get user input
    name = input("Admin Name: ").strip()
    email = input("Admin Email: ").strip()

    # Get password securely
    while True:
        password = getpass("Admin Password: ")
        confirm_password = getpass("Confirm Password: ")

        if password != confirm_password:
            print("❌ Passwords don't match. Try again.\n")
            continue

        if len(password) < 8:
            print("❌ Password must be at least 8 characters. Try again.\n")
            continue

        break

    # Check if admin already exists
    existing_admin = await db.users.find_one({"email": email})
    if existing_admin:
        print(f"\n⚠ User with email {email} already exists!")
        overwrite = input("Do you want to update this user to admin? (yes/no): ").lower()

        if overwrite == "yes":
            # Update existing user
            result = await db.users.update_one(
                {"email": email},
                {"$set": {
                    "name": name,
                    "hashed_password": hash_password(password),
                    "role": "admin"
                }}
            )

            if result.modified_count > 0:
                print("\n✓ User updated to admin successfully!")
            else:
                print("\n✓ User is already an admin with these credentials")
        else:
            print("\n❌ Operation cancelled")
            return
    else:
        # Create new admin user
        admin_data = {
            "name": name,
            "email": email,
            "hashed_password": hash_password(password),
            "role": "admin"
        }

        result = await db.users.insert_one(admin_data)
        print(f"\n✓ Admin user created successfully!")
        print(f"  User ID: {result.inserted_id}")

    print("\n" + "=" * 60)
    print("ADMIN CREDENTIALS")
    print("=" * 60)
    print(f"Email: {email}")
    print(f"Role: admin")
    print("\nYou can now login at: http://localhost:3000/login")
    print("=" * 60)

async def list_admins():
    """List all admin users"""
    print("\nCurrent Admin Users:")
    print("-" * 60)

    admins = await db.users.find({"role": "admin"}).to_list(100)

    if not admins:
        print("No admin users found")
    else:
        for i, admin in enumerate(admins, 1):
            print(f"{i}. {admin.get('name')} ({admin.get('email')})")

    print("-" * 60)

async def main():
    print("\n")

    # Show existing admins first
    await list_admins()

    print("\n")
    choice = input("Do you want to create/update an admin user? (yes/no): ").lower()

    if choice == "yes":
        await create_admin()
    else:
        print("\n❌ Operation cancelled")

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n\n❌ Operation cancelled by user")
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
