"""
Admin routes for managing products, services, and uploads
"""
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from fastapi.responses import JSONResponse
from typing import List, Optional
from utils.auth import get_current_user
from utils.database import db
from utils.image_optimizer import optimize_uploaded_image, delete_image_variants, is_allowed_file
from bson import ObjectId
from datetime import datetime
import json

router = APIRouter(prefix="/api/admin", tags=["admin"])

# Admin check middleware
async def require_admin(current_user: dict = Depends(get_current_user)):
    """Verify user is admin"""
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

# ============================================================================
# IMAGE UPLOAD ENDPOINTS
# ============================================================================

@router.post("/upload-image")
async def upload_image(
    file: UploadFile = File(...),
    admin_user: dict = Depends(require_admin)
):
    """
    Upload and optimize an image
    Returns the path to the optimized image
    """
    # Validate file type
    if not is_allowed_file(file.filename):
        raise HTTPException(
            status_code=400,
            detail="Invalid file type. Allowed: jpg, jpeg, png, webp"
        )

    # Read file content
    contents = await file.read()

    # Optimize and save
    success, message, generated_files = optimize_uploaded_image(
        contents,
        file.filename
    )

    if not success:
        raise HTTPException(status_code=400, detail=message)

    return {
        "success": True,
        "message": message,
        "filename": file.filename,
        "paths": generated_files,
        "primary_path": generated_files[0] if generated_files else None
    }

@router.post("/upload-images")
async def upload_multiple_images(
    files: List[UploadFile] = File(...),
    admin_user: dict = Depends(require_admin)
):
    """
    Upload and optimize multiple images
    Returns paths to all optimized images
    """
    results = []
    errors = []

    for file in files:
        # Validate file type
        if not is_allowed_file(file.filename):
            errors.append({
                "filename": file.filename,
                "error": "Invalid file type"
            })
            continue

        # Read and optimize
        contents = await file.read()
        success, message, generated_files = optimize_uploaded_image(
            contents,
            file.filename
        )

        if success:
            results.append({
                "filename": file.filename,
                "paths": generated_files,
                "primary_path": generated_files[0] if generated_files else None
            })
        else:
            errors.append({
                "filename": file.filename,
                "error": message
            })

    return {
        "success": len(results) > 0,
        "uploaded": len(results),
        "failed": len(errors),
        "results": results,
        "errors": errors if errors else None
    }

@router.delete("/delete-image/{filename}")
async def delete_image(
    filename: str,
    admin_user: dict = Depends(require_admin)
):
    """Delete an image and all its variants"""
    success = delete_image_variants(filename)

    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete image")

    return {
        "success": True,
        "message": f"Deleted {filename} and all variants"
    }

# ============================================================================
# PRODUCT MANAGEMENT ENDPOINTS
# ============================================================================

@router.post("/products")
async def create_product(
    name: str = Form(...),
    price: float = Form(...),
    description: str = Form(...),
    category: str = Form(...),
    stock: int = Form(...),
    featured: bool = Form(False),
    features: str = Form("[]"),  # JSON string
    images: str = Form("[]"),  # JSON string
    admin_user: dict = Depends(require_admin)
):
    """Create a new product"""
    try:
        # Parse JSON fields
        features_list = json.loads(features) if features else []
        images_list = json.loads(images) if images else []

        # Generate product_id
        product_count = await db.products.count_documents({})
        product_id = f"PROD{str(product_count + 1).zfill(4)}"

        product_data = {
            "product_id": product_id,
            "name": name,
            "price": price,
            "description": description,
            "category": category,
            "images": images_list,
            "features": features_list,
            "stock": stock,
            "featured": featured,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }

        result = await db.products.insert_one(product_data)

        return {
            "success": True,
            "message": "Product created successfully",
            "product_id": product_id,
            "_id": str(result.inserted_id)
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/products/{product_id}")
async def update_product(
    product_id: str,
    name: Optional[str] = Form(None),
    price: Optional[float] = Form(None),
    description: Optional[str] = Form(None),
    category: Optional[str] = Form(None),
    stock: Optional[int] = Form(None),
    featured: Optional[bool] = Form(None),
    features: Optional[str] = Form(None),  # JSON string
    images: Optional[str] = Form(None),  # JSON string
    admin_user: dict = Depends(require_admin)
):
    """Update an existing product"""
    try:
        update_data = {"updated_at": datetime.utcnow().isoformat()}

        if name is not None:
            update_data["name"] = name
        if price is not None:
            update_data["price"] = price
        if description is not None:
            update_data["description"] = description
        if category is not None:
            update_data["category"] = category
        if stock is not None:
            update_data["stock"] = stock
        if featured is not None:
            update_data["featured"] = featured
        if features is not None:
            update_data["features"] = json.loads(features)
        if images is not None:
            update_data["images"] = json.loads(images)

        result = await db.products.update_one(
            {"product_id": product_id},
            {"$set": update_data}
        )

        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Product not found")

        return {
            "success": True,
            "message": "Product updated successfully",
            "modified": result.modified_count > 0
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/products/{product_id}")
async def delete_product(
    product_id: str,
    admin_user: dict = Depends(require_admin)
):
    """Delete a product"""
    result = await db.products.delete_one({"product_id": product_id})

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")

    return {
        "success": True,
        "message": "Product deleted successfully"
    }

# ============================================================================
# SERVICE MANAGEMENT ENDPOINTS
# ============================================================================

@router.post("/services")
async def create_service(
    name: str = Form(...),
    description: str = Form(...),
    category: str = Form(...),
    pricing: float = Form(...),
    estimated_duration: str = Form("1-2 hours"),
    features: str = Form("[]"),  # JSON string
    admin_user: dict = Depends(require_admin)
):
    """Create a new service"""
    try:
        features_list = json.loads(features) if features else []

        # Generate service_id
        service_count = await db.services_offered.count_documents({})
        service_id = f"SRV{str(service_count + 1).zfill(4)}"

        service_data = {
            "service_id": service_id,
            "name": name,
            "description": description,
            "category": category,
            "pricing": pricing,
            "estimated_duration": estimated_duration,
            "features": features_list,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }

        result = await db.services_offered.insert_one(service_data)

        return {
            "success": True,
            "message": "Service created successfully",
            "service_id": service_id,
            "_id": str(result.inserted_id)
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/services/{service_id}")
async def update_service(
    service_id: str,
    name: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    category: Optional[str] = Form(None),
    pricing: Optional[float] = Form(None),
    estimated_duration: Optional[str] = Form(None),
    features: Optional[str] = Form(None),  # JSON string
    admin_user: dict = Depends(require_admin)
):
    """Update an existing service"""
    try:
        update_data = {"updated_at": datetime.utcnow().isoformat()}

        if name is not None:
            update_data["name"] = name
        if description is not None:
            update_data["description"] = description
        if category is not None:
            update_data["category"] = category
        if pricing is not None:
            update_data["pricing"] = pricing
        if estimated_duration is not None:
            update_data["estimated_duration"] = estimated_duration
        if features is not None:
            update_data["features"] = json.loads(features)

        result = await db.services_offered.update_one(
            {"service_id": service_id},
            {"$set": update_data}
        )

        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Service not found")

        return {
            "success": True,
            "message": "Service updated successfully",
            "modified": result.modified_count > 0
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/services/{service_id}")
async def delete_service(
    service_id: str,
    admin_user: dict = Depends(require_admin)
):
    """Delete a service"""
    result = await db.services_offered.delete_one({"service_id": service_id})

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Service not found")

    return {
        "success": True,
        "message": "Service deleted successfully"
    }

# ============================================================================
# DASHBOARD STATS
# ============================================================================

@router.get("/stats")
async def get_admin_stats(admin_user: dict = Depends(require_admin)):
    """Get dashboard statistics"""
    try:
        total_products = await db.products.count_documents({})
        total_services = await db.services_offered.count_documents({})
        total_orders = await db.orders.count_documents({})
        total_users = await db.users.count_documents({})
        total_reviews = await db.reviews.count_documents({})

        # Get recent products
        recent_products = await db.products.find().sort("created_at", -1).limit(5).to_list(5)

        # Get low stock products
        low_stock = await db.products.find({"stock": {"$lt": 10}}).to_list(10)

        return {
            "success": True,
            "stats": {
                "total_products": total_products,
                "total_services": total_services,
                "total_orders": total_orders,
                "total_users": total_users,
                "total_reviews": total_reviews,
                "low_stock_count": len(low_stock)
            },
            "recent_products": [
                {
                    "product_id": p.get("product_id"),
                    "name": p.get("name"),
                    "price": p.get("price"),
                    "stock": p.get("stock"),
                    "created_at": p.get("created_at")
                }
                for p in recent_products
            ],
            "low_stock_items": [
                {
                    "product_id": p.get("product_id"),
                    "name": p.get("name"),
                    "stock": p.get("stock")
                }
                for p in low_stock
            ]
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
