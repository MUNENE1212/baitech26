"""
Cloudinary image upload and management utility
Handles image uploads to Cloudinary CDN with automatic optimization
"""
import os
import cloudinary
import cloudinary.uploader
import cloudinary.api
from typing import Tuple, List, Optional
from pathlib import Path
import io

# Initialize Cloudinary with environment variables
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True
)

# Allowed file extensions
ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif'}

# Image transformation presets for automatic optimization
TRANSFORMATIONS = {
    "thumbnail": {
        "width": 150,
        "height": 150,
        "crop": "fill",
        "quality": "auto:good",
        "fetch_format": "auto"
    },
    "medium": {
        "width": 600,
        "height": 600,
        "crop": "limit",
        "quality": "auto:good",
        "fetch_format": "auto"
    },
    "large": {
        "width": 1200,
        "height": 1200,
        "crop": "limit",
        "quality": "auto:best",
        "fetch_format": "auto"
    },
    "hero": {
        "width": 1920,
        "height": 1080,
        "crop": "fill",
        "quality": "auto:best",
        "fetch_format": "auto"
    }
}


def is_allowed_file(filename: str) -> bool:
    """Check if file extension is allowed"""
    return Path(filename).suffix.lower() in ALLOWED_EXTENSIONS


def is_cloudinary_configured() -> bool:
    """Check if Cloudinary is properly configured"""
    config = cloudinary.config()
    return bool(
        config.cloud_name and
        config.api_key and
        config.api_secret
    )


def upload_image_to_cloudinary(
    image_bytes: bytes,
    filename: str,
    folder: str = "baitech/products",
    public_id: Optional[str] = None,
    eager_transformations: bool = True
) -> Tuple[bool, str, dict]:
    """
    Upload an image to Cloudinary with automatic optimization

    Args:
        image_bytes: Raw image bytes from upload
        filename: Original filename
        folder: Cloudinary folder path (e.g., 'baitech/products')
        public_id: Optional custom public ID (otherwise derived from filename)
        eager_transformations: Generate optimized versions immediately

    Returns:
        Tuple of (success, message, cloudinary_response)
    """
    try:
        # Check if Cloudinary is configured
        if not is_cloudinary_configured():
            return False, "Cloudinary is not configured. Please add credentials to .env", {}

        # Validate file type
        if not is_allowed_file(filename):
            return False, f"Invalid file type. Allowed: {', '.join(ALLOWED_EXTENSIONS)}", {}

        # Generate public_id from filename if not provided
        if not public_id:
            public_id = Path(filename).stem

        # Prepare upload options
        upload_options = {
            "folder": folder,
            "public_id": public_id,
            "overwrite": True,
            "resource_type": "image",
            "quality": "auto:best",
            "fetch_format": "auto",  # Automatically deliver best format (WebP, AVIF)
            "responsive_breakpoints": {
                "create_derived": True,
                "bytes_step": 20000,
                "min_width": 200,
                "max_width": 1200,
                "max_images": 5
            }
        }

        # Add eager transformations if requested
        if eager_transformations:
            upload_options["eager"] = [
                TRANSFORMATIONS["thumbnail"],
                TRANSFORMATIONS["medium"],
                TRANSFORMATIONS["large"]
            ]
            upload_options["eager_async"] = True

        # Upload to Cloudinary
        response = cloudinary.uploader.upload(
            io.BytesIO(image_bytes),
            **upload_options
        )

        # Build result with useful URLs
        result = {
            "public_id": response.get("public_id"),
            "secure_url": response.get("secure_url"),
            "url": response.get("url"),
            "format": response.get("format"),
            "width": response.get("width"),
            "height": response.get("height"),
            "bytes": response.get("bytes"),
            "thumbnail_url": cloudinary.CloudinaryImage(response["public_id"]).build_url(**TRANSFORMATIONS["thumbnail"]),
            "medium_url": cloudinary.CloudinaryImage(response["public_id"]).build_url(**TRANSFORMATIONS["medium"]),
            "large_url": cloudinary.CloudinaryImage(response["public_id"]).build_url(**TRANSFORMATIONS["large"]),
        }

        return True, f"Successfully uploaded {filename} to Cloudinary", result

    except Exception as e:
        return False, f"Error uploading to Cloudinary: {str(e)}", {}


def upload_multiple_images(
    images_data: List[Tuple[bytes, str]],
    folder: str = "baitech/products"
) -> Tuple[List[dict], List[str]]:
    """
    Upload multiple images to Cloudinary

    Args:
        images_data: List of (image_bytes, filename) tuples
        folder: Cloudinary folder path

    Returns:
        Tuple of (successful_uploads, error_messages)
    """
    successful_uploads = []
    errors = []

    for image_bytes, filename in images_data:
        success, message, result = upload_image_to_cloudinary(
            image_bytes,
            filename,
            folder
        )

        if success:
            successful_uploads.append(result)
        else:
            errors.append(f"{filename}: {message}")

    return successful_uploads, errors


def delete_image_from_cloudinary(public_id: str) -> Tuple[bool, str]:
    """
    Delete an image from Cloudinary

    Args:
        public_id: Cloudinary public ID (e.g., 'baitech/products/image-name')

    Returns:
        Tuple of (success, message)
    """
    try:
        if not is_cloudinary_configured():
            return False, "Cloudinary is not configured"

        result = cloudinary.uploader.destroy(public_id)

        if result.get("result") == "ok":
            return True, f"Successfully deleted {public_id}"
        else:
            return False, f"Failed to delete {public_id}: {result.get('result')}"

    except Exception as e:
        return False, f"Error deleting from Cloudinary: {str(e)}"


def get_cloudinary_image_url(
    public_id: str,
    transformation: str = "medium",
    format: Optional[str] = None
) -> str:
    """
    Get optimized Cloudinary URL for an image

    Args:
        public_id: Cloudinary public ID
        transformation: Preset transformation (thumbnail, medium, large, hero)
        format: Optional specific format (jpg, webp, avif, auto)

    Returns:
        Optimized Cloudinary URL
    """
    try:
        transform = TRANSFORMATIONS.get(transformation, TRANSFORMATIONS["medium"])

        if format:
            transform = transform.copy()
            transform["fetch_format"] = format

        return cloudinary.CloudinaryImage(public_id).build_url(**transform)

    except Exception as e:
        print(f"Error building Cloudinary URL: {e}")
        return ""


def extract_public_id_from_url(cloudinary_url: str) -> Optional[str]:
    """
    Extract public_id from a Cloudinary URL

    Args:
        cloudinary_url: Full Cloudinary URL

    Returns:
        Public ID or None
    """
    try:
        # Extract public_id from URL
        # Format: https://res.cloudinary.com/{cloud_name}/image/upload/v{version}/{public_id}.{format}
        parts = cloudinary_url.split("/upload/")
        if len(parts) == 2:
            # Remove version and extension
            public_id = parts[1].split("/", 1)[-1]
            public_id = public_id.rsplit(".", 1)[0]  # Remove extension
            return public_id
        return None
    except Exception:
        return None


def get_image_metadata(public_id: str) -> dict:
    """
    Get metadata for an image from Cloudinary

    Args:
        public_id: Cloudinary public ID

    Returns:
        Image metadata dictionary
    """
    try:
        if not is_cloudinary_configured():
            return {"error": "Cloudinary not configured"}

        result = cloudinary.api.resource(public_id)
        return {
            "public_id": result.get("public_id"),
            "format": result.get("format"),
            "width": result.get("width"),
            "height": result.get("height"),
            "bytes": result.get("bytes"),
            "created_at": result.get("created_at"),
            "secure_url": result.get("secure_url")
        }
    except Exception as e:
        return {"error": str(e)}


def list_images_in_folder(folder: str = "baitech/products", max_results: int = 100) -> List[dict]:
    """
    List all images in a Cloudinary folder

    Args:
        folder: Cloudinary folder path
        max_results: Maximum number of results to return

    Returns:
        List of image metadata dictionaries
    """
    try:
        if not is_cloudinary_configured():
            return []

        result = cloudinary.api.resources(
            type="upload",
            prefix=folder,
            max_results=max_results
        )

        return result.get("resources", [])

    except Exception as e:
        print(f"Error listing Cloudinary images: {e}")
        return []
