#!/usr/bin/env python3
"""
Image Optimization Script for Baitech E-commerce Platform
Resizes all product images to standard sizes and creates WebP variants for better performance
"""

import os
from pathlib import Path
from PIL import Image
import shutil

# Configuration
IMAGES_DIR = Path("baitech-frontend/public/images")
BACKUP_DIR = Path("baitech-frontend/public/images_backup")
OPTIMIZED_DIR = Path("baitech-frontend/public/images_optimized")

# Image size configurations (width x height in pixels)
SIZES = {
    "thumbnail": (150, 150),
    "medium": (600, 600),
    "large": (1200, 1200)
}

# Quality settings
JPEG_QUALITY = 85
WEBP_QUALITY = 80

def create_directories():
    """Create necessary directories for backup and optimized images"""
    BACKUP_DIR.mkdir(parents=True, exist_ok=True)
    for size in SIZES.keys():
        (OPTIMIZED_DIR / size).mkdir(parents=True, exist_ok=True)
    print(f"✓ Created directories: {BACKUP_DIR}, {OPTIMIZED_DIR}")

def backup_original_images():
    """Backup original images before processing"""
    if not IMAGES_DIR.exists():
        print(f"✗ Images directory not found: {IMAGES_DIR}")
        return False

    print(f"Backing up original images to {BACKUP_DIR}...")
    for img_file in IMAGES_DIR.glob("*"):
        if img_file.suffix.lower() in ['.jpg', '.jpeg', '.png', '.webp']:
            shutil.copy2(img_file, BACKUP_DIR / img_file.name)

    print(f"✓ Backed up {len(list(BACKUP_DIR.glob('*')))} images")
    return True

def optimize_image(image_path, size_name, target_size):
    """
    Optimize a single image by resizing and creating WebP variant

    Args:
        image_path: Path to the original image
        size_name: Name of the size variant (thumbnail, medium, large)
        target_size: Tuple of (width, height) for resizing
    """
    try:
        with Image.open(image_path) as img:
            # Convert RGBA to RGB if necessary
            if img.mode in ('RGBA', 'LA', 'P'):
                background = Image.new('RGB', img.size, (255, 255, 255))
                if img.mode == 'P':
                    img = img.convert('RGBA')
                background.paste(img, mask=img.split()[-1] if img.mode in ('RGBA', 'LA') else None)
                img = background

            # Calculate aspect ratio preserving dimensions
            img.thumbnail(target_size, Image.Resampling.LANCZOS)

            # Get output filename
            stem = image_path.stem
            output_dir = OPTIMIZED_DIR / size_name

            # Save as JPEG
            jpeg_path = output_dir / f"{stem}.jpg"
            img.save(jpeg_path, "JPEG", quality=JPEG_QUALITY, optimize=True)

            # Save as WebP
            webp_path = output_dir / f"{stem}.webp"
            img.save(webp_path, "WEBP", quality=WEBP_QUALITY)

            return True
    except Exception as e:
        print(f"✗ Error processing {image_path.name}: {e}")
        return False

def process_all_images():
    """Process all images in the images directory"""
    if not IMAGES_DIR.exists():
        print(f"✗ Images directory not found: {IMAGES_DIR}")
        return

    image_files = [f for f in IMAGES_DIR.glob("*")
                   if f.suffix.lower() in ['.jpg', '.jpeg', '.png', '.webp']]

    total_images = len(image_files)
    print(f"\nProcessing {total_images} images...")
    print("=" * 60)

    processed = 0
    for idx, img_file in enumerate(image_files, 1):
        print(f"[{idx}/{total_images}] Processing: {img_file.name}")

        success_count = 0
        for size_name, target_size in SIZES.items():
            if optimize_image(img_file, size_name, target_size):
                success_count += 1

        if success_count == len(SIZES):
            processed += 1
            print(f"  ✓ Created {success_count * 2} variants (JPEG + WebP)")
        else:
            print(f"  ⚠ Partial success: {success_count}/{len(SIZES)} sizes")

    print("=" * 60)
    print(f"\n✓ Successfully processed {processed}/{total_images} images")
    print(f"✓ Generated {processed * len(SIZES) * 2} optimized image variants")

def generate_summary():
    """Generate a summary of the optimization process"""
    print("\n" + "=" * 60)
    print("OPTIMIZATION SUMMARY")
    print("=" * 60)

    for size_name in SIZES.keys():
        size_dir = OPTIMIZED_DIR / size_name
        jpeg_count = len(list(size_dir.glob("*.jpg")))
        webp_count = len(list(size_dir.glob("*.webp")))
        print(f"{size_name.upper()}:")
        print(f"  - JPEG files: {jpeg_count}")
        print(f"  - WebP files: {webp_count}")

    print("\n" + "=" * 60)
    print("NEXT STEPS:")
    print("=" * 60)
    print("1. Review optimized images in:", OPTIMIZED_DIR)
    print("2. Update Next.js Image components to use optimized variants")
    print("3. Replace original images with medium size variants")
    print("4. Keep originals backed up in:", BACKUP_DIR)
    print("\nTo replace originals with medium variants, run:")
    print(f"  cp {OPTIMIZED_DIR}/medium/* {IMAGES_DIR}/")
    print("=" * 60)

def main():
    """Main execution function"""
    print("=" * 60)
    print("BAITECH IMAGE OPTIMIZATION SCRIPT")
    print("=" * 60)
    print(f"Source: {IMAGES_DIR}")
    print(f"Backup: {BACKUP_DIR}")
    print(f"Output: {OPTIMIZED_DIR}")
    print(f"Sizes: {', '.join(SIZES.keys())}")
    print("=" * 60)

    # Create necessary directories
    create_directories()

    # Backup original images
    if not backup_original_images():
        print("Failed to backup images. Exiting.")
        return

    # Process all images
    process_all_images()

    # Generate summary
    generate_summary()

if __name__ == "__main__":
    main()
