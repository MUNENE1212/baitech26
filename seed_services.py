# insert_featured_services.py
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def insert_featured_services():
    client = AsyncIOMotorClient("mongodb://localhost:27017")  # Use your actual URI
    db = client["baitekdb"]  # Replace with your actual DB name

    service = {
        "name": "Surveillance & Security System Installation",
        "description": "Professional setup of CCTV, alarms, and remote monitoring systems for homes and businesses.",
        "category": "Security",
        "is_active": True,
        "featured": True
    }

    await db.services_offered.insert_one(service)
    print("✅ Featured service inserted.")

asyncio.run(insert_featured_services())
