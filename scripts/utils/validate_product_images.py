#!/usr/bin/env python3
"""
Utility to validate and fix product image references
"""
import asyncio
from utils.database import db
from pathlib import Path

IMAGES_DIR = Path("baitech-frontend/public/images")

async def validate_and_fix_images():
    """Check all products and fix missing image references"""
    products = await db.products.find({}).to_list(1000)

    fixed = 0
    errors = []

    print("Validating product images...")
    print("=" * 60)

    for product in products:
        product_id = product.get('product_id')
        product_name = product.get('name')
        images = product.get('images', [])

        if not images:
            continue

        valid_images = []
        fixed_any = False

        for img_path in images:
            # Convert /static/images/ or /images/ to filename
            filename = img_path.replace('/static/images/', '').replace('/images/', '')
            file_path = IMAGES_DIR / filename

            if file_path.exists():
                # Keep as-is
                valid_images.append(img_path)
            else:
                # Try to find alternative
                stem = Path(filename).stem

                # Check for .jpg version
                jpg_path = IMAGES_DIR / f"{stem}.jpg"
                if jpg_path.exists():
                    new_path = f"/static/images/{stem}.jpg"
                    valid_images.append(new_path)
                    fixed_any = True
                    print(f"✓ Fixed: {product_name}")
                    print(f"  {filename} → {stem}.jpg")
                    continue

                # Check for .webp version
                webp_path = IMAGES_DIR / f"{stem}.webp"
                if webp_path.exists():
                    new_path = f"/static/images/{stem}.webp"
                    valid_images.append(new_path)
                    fixed_any = True
                    print(f"✓ Fixed: {product_name}")
                    print(f"  {filename} → {stem}.webp")
                    continue

                # Check for .jpeg version
                jpeg_path = IMAGES_DIR / f"{stem}.jpeg"
                if jpeg_path.exists():
                    new_path = f"/static/images/{stem}.jpeg"
                    valid_images.append(new_path)
                    fixed_any = True
                    print(f"✓ Fixed: {product_name}")
                    print(f"  {filename} → {stem}.jpeg")
                    continue

                # No alternative found
                errors.append({
                    'product': product_name,
                    'product_id': product_id,
                    'missing': filename
                })
                print(f"✗ Missing: {product_name} - {filename}")

        # Update database if we fixed anything
        if fixed_any and valid_images:
            await db.products.update_one(
                {'product_id': product_id},
                {'$set': {'images': valid_images}}
            )
            fixed += 1

    print("=" * 60)
    print(f"\nResults:")
    print(f"  ✓ Fixed: {fixed} products")
    print(f"  ✗ Errors: {len(errors)} missing images")

    if errors:
        print("\nProducts with missing images:")
        for error in errors:
            print(f"  - {error['product']} ({error['product_id']})")
            print(f"    Missing: {error['missing']}")

async def list_all_images():
    """List all available images for reference"""
    print("\nAvailable images:")
    print("=" * 60)

    images = sorted(IMAGES_DIR.glob("*"))
    for img in images[:50]:  # Show first 50
        size = img.stat().st_size / 1024  # KB
        print(f"  {img.name} ({size:.1f}KB)")

    total = len(list(IMAGES_DIR.glob("*")))
    if total > 50:
        print(f"  ... and {total - 50} more files")

if __name__ == "__main__":
    print("PRODUCT IMAGE VALIDATOR")
    print("=" * 60)
    asyncio.run(validate_and_fix_images())
    # asyncio.run(list_all_images())  # Uncomment to see all images
