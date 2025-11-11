#!/usr/bin/env python3
"""
Process AVIF files using pillow-heif
"""
from pathlib import Path
from PIL import Image
import shutil

# Register AVIF support
try:
    from pillow_heif import register_heif_opener
    register_heif_opener()
    print("✓ AVIF support registered")
except ImportError:
    print("⚠ pillow-heif not available, AVIF files will be skipped")

SOURCE_DIR = Path("/home/munen/Downloads/ecomassets")
DEST_DIR = Path("baitech-frontend/public/images")
OPTIMIZED_DIR = Path("baitech-frontend/public/images_optimized")

JPEG_QUALITY = 85
WEBP_QUALITY = 80

SIZES = {
    "thumbnail": (150, 150),
    "medium": (600, 600),
    "large": (1200, 1200)
}

def process_avif_files():
    """Process AVIF files and generate all variants"""
    processed = []
    errors = []

    # Create directories
    DEST_DIR.mkdir(parents=True, exist_ok=True)
    for size in SIZES.keys():
        (OPTIMIZED_DIR / size).mkdir(parents=True, exist_ok=True)

    # Get all AVIF files
    avif_files = list(SOURCE_DIR.glob("*.avif"))
    print(f"\nProcessing {len(avif_files)} AVIF files")
    print("=" * 60)

    for avif_file in avif_files:
        stem = avif_file.stem
        print(f"\n{avif_file.name}")

        try:
            # Open AVIF file
            with Image.open(avif_file) as img:
                print(f"  Format: {img.format}, Mode: {img.mode}, Size: {img.size}")

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

                # Save medium size to main images folder
                img_copy = img.copy()
                img_copy.thumbnail(SIZES["medium"], Image.Resampling.LANCZOS)

                # Save as JPEG in main folder
                jpeg_path = DEST_DIR / f"{stem}.jpg"
                img_copy.save(jpeg_path, "JPEG", quality=JPEG_QUALITY, optimize=True)
                print(f"  ✓ {jpeg_path.name}")

                # Save as WebP in main folder
                webp_path = DEST_DIR / f"{stem}.webp"
                img_copy.save(webp_path, "WEBP", quality=WEBP_QUALITY)
                print(f"  ✓ {webp_path.name}")

                # Copy original AVIF to main folder
                avif_dest = DEST_DIR / avif_file.name
                shutil.copy2(avif_file, avif_dest)
                print(f"  ✓ {avif_dest.name}")

                # Generate all size variants
                for size_name, target_size in SIZES.items():
                    img_variant = img.copy()
                    img_variant.thumbnail(target_size, Image.Resampling.LANCZOS)

                    size_dir = OPTIMIZED_DIR / size_name

                    # JPEG variant
                    jpeg_variant = size_dir / f"{stem}.jpg"
                    img_variant.save(jpeg_variant, "JPEG", quality=JPEG_QUALITY, optimize=True)

                    # WebP variant
                    webp_variant = size_dir / f"{stem}.webp"
                    img_variant.save(webp_variant, "WEBP", quality=WEBP_QUALITY)

                print(f"  ✓ All variants generated")
                processed.append(stem)

        except Exception as e:
            errors.append((avif_file.name, str(e)))
            print(f"  ✗ Error: {e}")

    print("\n" + "=" * 60)
    print(f"✓ Processed: {len(processed)} files")
    if errors:
        print(f"✗ Errors: {len(errors)} files")
        for filename, error in errors:
            print(f"  - {filename}: {error}")

    return processed

if __name__ == "__main__":
    print("PROCESSING AVIF FILES WITH HEIF SUPPORT")
    print("=" * 60)
    process_avif_files()
    print("\n✓ Done!")
