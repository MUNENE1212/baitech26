"""
Script to migrate existing product images to Cloudinary
Run this once after setting up Cloudinary credentials
"""
import asyncio
import os
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from utils.database import db
from utils.cloudinary_uploader import upload_image_to_cloudinary, is_cloudinary_configured
from motor.motor_asyncio import AsyncIOMotorClient


async def migrate_images():
    """Migrate all product images to Cloudinary"""

    # Check Cloudinary config
    if not is_cloudinary_configured():
        print("❌ Cloudinary is not configured!")
        print("Please add CLOUDINARY credentials to .env file")
        return

    print("✅ Cloudinary configured")
    print("🔄 Starting image migration...")
    print()

    # Get all products
    products = await db.products.find({}).to_list(None)

    total_products = len(products)
    migrated_count = 0
    skipped_count = 0
    error_count = 0

    for i, product in enumerate(products, 1):
        product_name = product.get("name", "Unknown")
        images = product.get("images", [])

        print(f"[{i}/{total_products}] Processing: {product_name}")

        if not images:
            print(f"  ⏭️  No images to migrate")
            skipped_count += 1
            continue

        # Check if already using Cloudinary
        if any(img and img.startswith("https://res.cloudinary.com") for img in images):
            print(f"  ✅ Already using Cloudinary")
            skipped_count += 1
            continue

        # Migrate images
        new_images = []
        local_images_found = False

        for img_path in images:
            if not img_path:
                continue

            # Skip if already Cloudinary URL
            if img_path.startswith("https://res.cloudinary.com"):
                new_images.append(img_path)
                continue

            # Convert local path to file path
            # /images/product.jpg -> baitech-frontend/public/images/product.jpg
            local_path = Path("baitech-frontend/public") / img_path.lstrip("/")

            if not local_path.exists():
                print(f"  ⚠️  Local file not found: {local_path}")
                # Keep the original path
                new_images.append(img_path)
                continue

            local_images_found = True

            # Read file
            with open(local_path, "rb") as f:
                file_bytes = f.read()

            # Upload to Cloudinary
            success, message, result = upload_image_to_cloudinary(
                file_bytes,
                local_path.name,
                folder="baitech/products"
            )

            if success:
                cloudinary_url = result.get("secure_url")
                new_images.append(cloudinary_url)
                print(f"  ✅ Uploaded: {local_path.name} -> Cloudinary")
            else:
                print(f"  ❌ Failed: {local_path.name} - {message}")
                # Keep the original path on failure
                new_images.append(img_path)
                error_count += 1

        # Update product if any images were migrated
        if local_images_found and new_images:
            await db.products.update_one(
                {"_id": product["_id"]},
                {"$set": {"images": new_images}}
            )
            migrated_count += 1
            print(f"  💾 Updated product in database")

        print()

    # Summary
    print("=" * 60)
    print("✨ Migration Complete!")
    print(f"Total products: {total_products}")
    print(f"✅ Migrated: {migrated_count}")
    print(f"⏭️  Skipped: {skipped_count}")
    print(f"❌ Errors: {error_count}")
    print("=" * 60)

    if migrated_count > 0:
        print()
        print("🎉 Your product images are now on Cloudinary!")
        print("💡 You can now delete local images to save space:")
        print("   rm -rf baitech-frontend/public/images/*")
        print("   rm -rf baitech-frontend/public/images_optimized/*")


if __name__ == "__main__":
    asyncio.run(migrate_images())
