"""
Image optimization utility for automatic image processing on upload
"""
from pathlib import Path
from PIL import Image
import io
import os
from typing import Tuple, List

# Image size configurations (width x height in pixels)
SIZES = {
    "thumbnail": (150, 150),
    "medium": (600, 600),
    "large": (1200, 1200)
}

# Quality settings
JPEG_QUALITY = 85
WEBP_QUALITY = 80
AVIF_QUALITY = 75

# Allowed extensions
ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp', '.avif'}

def is_allowed_file(filename: str) -> bool:
    """Check if file extension is allowed"""
    return Path(filename).suffix.lower() in ALLOWED_EXTENSIONS

def optimize_uploaded_image(
    image_bytes: bytes,
    filename: str,
    output_dir: Path = Path("baitech-frontend/public/images")
) -> Tuple[bool, str, List[str]]:
    """
    Optimize an uploaded image and save in multiple formats

    Args:
        image_bytes: Raw image bytes from upload
        filename: Original filename
        output_dir: Directory to save optimized images

    Returns:
        Tuple of (success, message, generated_filenames)
    """
    try:
        # Validate extension
        if not is_allowed_file(filename):
            return False, f"Invalid file type. Allowed: {', '.join(ALLOWED_EXTENSIONS)}", []

        # Create output directories
        output_dir.mkdir(parents=True, exist_ok=True)
        optimized_dir = output_dir.parent / "images_optimized"

        for size_name in SIZES.keys():
            (optimized_dir / size_name).mkdir(parents=True, exist_ok=True)

        # Open and process image
        with Image.open(io.BytesIO(image_bytes)) as img:
            # Convert RGBA to RGB if necessary
            if img.mode in ('RGBA', 'LA', 'P'):
                background = Image.new('RGB', img.size, (255, 255, 255))
                if img.mode == 'P':
                    img = img.convert('RGBA')
                background.paste(img, mask=img.split()[-1] if img.mode in ('RGBA', 'LA') else None)
                img = background

            # Generate filename without extension
            stem = Path(filename).stem
            generated_files = []

            # Save medium size to active images folder
            img_copy = img.copy()
            img_copy.thumbnail(SIZES["medium"], Image.Resampling.LANCZOS)

            # Save as JPEG in main images folder
            jpeg_path = output_dir / f"{stem}.jpg"
            img_copy.save(jpeg_path, "JPEG", quality=JPEG_QUALITY, optimize=True)
            generated_files.append(f"/images/{stem}.jpg")

            # Save as WebP in main images folder
            webp_path = output_dir / f"{stem}.webp"
            img_copy.save(webp_path, "WEBP", quality=WEBP_QUALITY)
            generated_files.append(f"/images/{stem}.webp")

            # Save as AVIF in main images folder (modern format)
            try:
                avif_path = output_dir / f"{stem}.avif"
                img_copy.save(avif_path, "AVIF", quality=AVIF_QUALITY)
                generated_files.append(f"/images/{stem}.avif")
            except Exception as e:
                # AVIF might not be supported by Pillow version
                print(f"AVIF generation skipped: {e}")

            # Generate all size variants in optimized folder
            for size_name, target_size in SIZES.items():
                img_variant = img.copy()
                img_variant.thumbnail(target_size, Image.Resampling.LANCZOS)

                size_dir = optimized_dir / size_name

                # Save JPEG variant
                jpeg_variant_path = size_dir / f"{stem}.jpg"
                img_variant.save(jpeg_variant_path, "JPEG", quality=JPEG_QUALITY, optimize=True)

                # Save WebP variant
                webp_variant_path = size_dir / f"{stem}.webp"
                img_variant.save(webp_variant_path, "WEBP", quality=WEBP_QUALITY)

                # Save AVIF variant (if supported)
                try:
                    avif_variant_path = size_dir / f"{stem}.avif"
                    img_variant.save(avif_variant_path, "AVIF", quality=AVIF_QUALITY)
                except Exception:
                    pass  # Skip if not supported

            return True, f"Successfully optimized {filename}", generated_files

    except Exception as e:
        return False, f"Error optimizing image: {str(e)}", []

def delete_image_variants(filename: str, base_dir: Path = Path("baitech-frontend/public")) -> bool:
    """
    Delete an image and all its variants

    Args:
        filename: Filename (with or without extension)
        base_dir: Base directory containing images

    Returns:
        True if successful
    """
    try:
        stem = Path(filename).stem
        images_dir = base_dir / "images"
        optimized_dir = base_dir / "images_optimized"

        # Delete from main images folder
        for ext in ['.jpg', '.jpeg', '.png', '.webp', '.avif']:
            img_path = images_dir / f"{stem}{ext}"
            if img_path.exists():
                img_path.unlink()

        # Delete from optimized variants
        for size_name in SIZES.keys():
            size_dir = optimized_dir / size_name
            for ext in ['.jpg', '.jpeg', '.png', '.webp', '.avif']:
                variant_path = size_dir / f"{stem}{ext}"
                if variant_path.exists():
                    variant_path.unlink()

        return True
    except Exception as e:
        print(f"Error deleting image variants: {e}")
        return False

def get_image_info(filepath: Path) -> dict:
    """
    Get information about an image file

    Args:
        filepath: Path to image file

    Returns:
        Dictionary with image info
    """
    try:
        with Image.open(filepath) as img:
            return {
                "format": img.format,
                "mode": img.mode,
                "size": img.size,
                "width": img.width,
                "height": img.height,
                "file_size": filepath.stat().st_size
            }
    except Exception as e:
        return {"error": str(e)}
