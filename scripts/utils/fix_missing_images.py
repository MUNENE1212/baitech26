#!/usr/bin/env python3
"""
Script to regenerate missing WebP/AVIF images for existing PNG/JPG files
"""
from pathlib import Path
from PIL import Image

IMAGES_DIR = Path("baitech-frontend/public/images")
WEBP_QUALITY = 80
AVIF_QUALITY = 75

def fix_missing_webp():
    """Generate missing WebP files for PNG/JPG images"""
    fixed = []
    errors = []

    # Find all source images
    source_images = []
    for ext in ['*.png', '*.jpg', '*.jpeg']:
        source_images.extend(IMAGES_DIR.glob(ext))

    print(f"Found {len(source_images)} source images")
    print("=" * 60)

    for img_path in source_images:
        stem = img_path.stem
        webp_path = IMAGES_DIR / f"{stem}.webp"
        avif_path = IMAGES_DIR / f"{stem}.avif"

        # Check if WebP is missing
        if not webp_path.exists():
            try:
                print(f"Generating WebP for: {img_path.name}")
                with Image.open(img_path) as img:
                    # Convert RGBA to RGB if necessary
                    if img.mode in ('RGBA', 'LA', 'P'):
                        background = Image.new('RGB', img.size, (255, 255, 255))
                        if img.mode == 'P':
                            img = img.convert('RGBA')
                        if img.mode in ('RGBA', 'LA'):
                            background.paste(img, mask=img.split()[-1])
                        else:
                            background.paste(img)
                        img = background

                    # Resize to medium size (600x600)
                    img.thumbnail((600, 600), Image.Resampling.LANCZOS)

                    # Save as WebP
                    img.save(webp_path, "WEBP", quality=WEBP_QUALITY)
                    fixed.append(f"{stem}.webp")
                    print(f"  ✓ Created: {webp_path.name}")

                    # Try to save as AVIF (if supported)
                    try:
                        img.save(avif_path, "AVIF", quality=AVIF_QUALITY)
                        fixed.append(f"{stem}.avif")
                        print(f"  ✓ Created: {avif_path.name}")
                    except Exception as e:
                        print(f"  ⚠ AVIF skipped: {e}")

            except Exception as e:
                errors.append((img_path.name, str(e)))
                print(f"  ✗ Error: {e}")

    print("=" * 60)
    print(f"\nResults:")
    print(f"  ✓ Fixed: {len(fixed)} images")
    print(f"  ✗ Errors: {len(errors)} images")

    if errors:
        print("\nFailed images:")
        for filename, error in errors:
            print(f"  - {filename}: {error}")

    if fixed:
        print("\nFixed images:")
        for filename in fixed:
            print(f"  - {filename}")

if __name__ == "__main__":
    print("Fixing missing WebP/AVIF images...\n")
    fix_missing_webp()
