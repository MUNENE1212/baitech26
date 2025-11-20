"""
API routes for Next.js frontend integration
Returns JSON data instead of HTML templates
"""

from fastapi import APIRouter, Depends
from utils.database import db
from random import sample
from utils.auth import get_current_user, require_role
from datetime import datetime

router = APIRouter(prefix="/api/v1", tags=["api"])


@router.get("/home")
async def get_home_data():
    """
    Get homepage data including featured products, services, and reviews
    """
    # Fetch all active services
    all_services = await db.services_offered.find({"is_active": True}).to_list(50)

    # Randomly pick 4 services
    featured_services = sample(all_services, min(len(all_services), 4))

    # Get featured products
    featured_products = await db.products.find({"featured": True}).to_list(6)

    # Get recent reviews
    reviews = await db.reviews.find().sort("date", -1).to_list(5)

    # Convert ObjectId to string and fix image paths for JSON serialization
    for item in featured_products:
        item["_id"] = str(item["_id"])
        # Update image paths from /static/images/ to /images/ for Next.js
        if "images" in item and item["images"]:
            item["images"] = [img.replace("/static/images/", "/images/") for img in item["images"]]

    for item in featured_services:
        item["_id"] = str(item["_id"])

    for item in reviews:
        item["_id"] = str(item["_id"])

    return {
        "featured_products": featured_products,
        "featured_services": featured_services,
        "reviews": reviews,
    }


@router.get("/products")
async def get_products(search: str = "", category: str = "", limit: int = 100):
    """
    Get products with optional filtering
    """
    query = {}
    if search:
        query["name"] = {"$regex": search, "$options": "i"}
    if category:
        query["category"] = category

    products = await db.products.find(query).limit(limit).to_list(limit)

    # Convert ObjectId to string and fix image paths
    for product in products:
        product["_id"] = str(product["_id"])
        # Update image paths from /static/images/ to /images/ for Next.js
        if "images" in product and product["images"]:
            product["images"] = [img.replace("/static/images/", "/images/") for img in product["images"]]

    return {
        "products": products,
        "total": len(products)
    }


@router.get("/products/{product_id}")
async def get_product(product_id: str):
    """
    Get single product by ID (MongoDB _id or product_id field)
    """
    from bson import ObjectId
    from bson.errors import InvalidId

    # Try to find by MongoDB _id first
    try:
        product = await db.products.find_one({"_id": ObjectId(product_id)})
    except InvalidId:
        # If not a valid ObjectId, try product_id field
        product = await db.products.find_one({"product_id": product_id})

    if product:
        product["_id"] = str(product["_id"])
        # Update image paths from /static/images/ to /images/ for Next.js
        if "images" in product and product["images"]:
            product["images"] = [img.replace("/static/images/", "/images/") for img in product["images"]]
    return product


@router.get("/services")
async def get_services():
    """
    Get all active services
    """
    services = await db.services_offered.find().to_list(100)

    for service in services:
        service["_id"] = str(service["_id"])

    return services


@router.get("/dashboard/admin")
async def get_admin_dashboard_data(user=Depends(require_role("admin"))):
    """
    Get admin dashboard statistics and data
    """
    total_users = await db.users.count_documents({})
    total_requests = await db.services.count_documents({})
    total_applications = await db.technician_applications.count_documents({})
    total_orders = await db.orders.count_documents({})

    service_requests = await db.services.find().sort("request_date", -1).limit(50).to_list(50)
    technicians = await db.technicians.find().limit(20).to_list(20)
    leaderboard = await db.technicians.find().sort("completed_jobs", -1).limit(10).to_list(10)
    orders = await db.orders.find().sort("order_date", -1).limit(50).to_list(50)

    # Convert ObjectIds
    for item in service_requests:
        item["_id"] = str(item["_id"])
    for item in technicians:
        item["_id"] = str(item["_id"])
    for item in orders:
        item["_id"] = str(item["_id"])

    return {
        "stats": {
            "total_users": total_users,
            "total_requests": total_requests,
            "total_applications": total_applications,
            "total_orders": total_orders,
        },
        "service_requests": service_requests,
        "technicians": technicians,
        "leaderboard": leaderboard,
        "orders": orders,
    }
