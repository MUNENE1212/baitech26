"""
Settings routes for site configuration
"""
from fastapi import APIRouter, HTTPException, Depends
from utils.auth import get_current_user
from utils.database import db
from pydantic import BaseModel

router = APIRouter(prefix="/api/settings", tags=["settings"])


class Settings(BaseModel):
    siteName: str
    siteDescription: str
    contactEmail: str
    contactPhone: str
    whatsappNumber: str
    address: str
    businessHours: str
    facebookUrl: str = ""
    twitterUrl: str = ""
    instagramUrl: str = ""
    linkedinUrl: str = ""


@router.get("/")
async def get_settings():
    """Get site settings"""
    settings = await db.settings.find_one({"type": "site"})
    if not settings:
        # Return defaults
        return {
            "siteName": "Baitech",
            "siteDescription": "Your trusted technology partner",
            "contactEmail": "info@baitech.co.ke",
            "contactPhone": "+254 700 000 000",
            "whatsappNumber": "+254 700 000 000",
            "address": "Nairobi, Kenya",
            "businessHours": "Mon-Fri: 8:00 AM - 6:00 PM",
            "facebookUrl": "",
            "twitterUrl": "",
            "instagramUrl": "",
            "linkedinUrl": ""
        }

    # Remove MongoDB _id from response
    settings.pop('_id', None)
    return settings


@router.put("/")
async def update_settings(
    settings: Settings,
    current_user: dict = Depends(get_current_user)
):
    """Update site settings (admin only)"""
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    settings_dict = settings.dict()
    settings_dict["type"] = "site"

    await db.settings.update_one(
        {"type": "site"},
        {"$set": settings_dict},
        upsert=True
    )

    return {"success": True, "message": "Settings updated successfully"}
