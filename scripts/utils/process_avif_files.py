#!/usr/bin/env python3
"""
Process AVIF files from downloads folder
"""
from pathlib import Path
from PIL import Image
import shutil

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

    # Create directories
    DEST_DIR.mkdir(parents=True, exist_ok=True)
    for size in SIZES.keys():
        (OPTIMIZED_DIR / size).mkdir(parents=True, exist_ok=True)

    # Get all AVIF files
    avif_files = list(SOURCE_DIR.glob("*.avif"))
    print(f"Found {len(avif_files)} AVIF files\n")
    print("=" * 60)

    for avif_file in avif_files:
        stem = avif_file.stem
        print(f"Processing: {avif_file.name}")

        try:
            with Image.open(avif_file) as img:
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
                print(f"  ✓ Created: {jpeg_path.name}")

                # Save as WebP in main folder
                webp_path = DEST_DIR / f"{stem}.webp"
                img_copy.save(webp_path, "WEBP", quality=WEBP_QUALITY)
                print(f"  ✓ Created: {webp_path.name}")

                # Copy original AVIF to main folder
                avif_dest = DEST_DIR / avif_file.name
                shutil.copy2(avif_file, avif_dest)
                print(f"  ✓ Copied: {avif_dest.name}")

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

                print(f"  ✓ Generated all size variants")
                processed.append(stem)

        except Exception as e:
            print(f"  ✗ Error: {e}")

    print("=" * 60)
    print(f"\n✓ Successfully processed {len(processed)} AVIF files")
    return processed

def process_webp_files():
    """Copy WebP files and generate JPEG variants"""
    processed = []

    webp_files = list(SOURCE_DIR.glob("*.webp"))
    print(f"\nFound {len(webp_files)} WebP files\n")
    print("=" * 60)

    for webp_file in webp_files:
        stem = webp_file.stem
        print(f"Processing: {webp_file.name}")

        try:
            # Copy WebP to main folder
            webp_dest = DEST_DIR / webp_file.name
            shutil.copy2(webp_file, webp_dest)
            print(f"  ✓ Copied: {webp_dest.name}")

            # Generate JPEG version
            with Image.open(webp_file) as img:
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

                # Save medium size
                img.thumbnail(SIZES["medium"], Image.Resampling.LANCZOS)

                # Save as JPEG
                jpeg_path = DEST_DIR / f"{stem}.jpg"
                img.save(jpeg_path, "JPEG", quality=JPEG_QUALITY, optimize=True)
                print(f"  ✓ Created: {jpeg_path.name}")

                # Generate all size variants
                for size_name, target_size in SIZES.items():
                    img_variant = img.copy()
                    img_variant.thumbnail(target_size, Image.Resampling.LANCZOS)

                    size_dir = OPTIMIZED_DIR / size_name

                    # JPEG variant
                    jpeg_variant = size_dir / f"{stem}.jpg"
                    img_variant.save(jpeg_variant, "JPEG", quality=JPEG_QUALITY, optimize=True)

                    # WebP variant (copy from source)
                    webp_variant = size_dir / f"{stem}.webp"
                    shutil.copy2(webp_file, webp_variant)

                print(f"  ✓ Generated all variants")
                processed.append(stem)

        except Exception as e:
            print(f"  ✗ Error: {e}")

    print("=" * 60)
    print(f"\n✓ Successfully processed {len(processed)} WebP files")
    return processed

if __name__ == "__main__":
    print("PROCESSING ECOM ASSETS")
    print("=" * 60)

    avif_processed = process_avif_files()
    webp_processed = process_webp_files()

    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"AVIF files processed: {len(avif_processed)}")
    print(f"WebP files processed: {len(webp_processed)}")
    print(f"Total files added: {len(avif_processed) + len(webp_processed)}")
    print("\n✓ All files ready to use!")
