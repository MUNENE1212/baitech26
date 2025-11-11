import asyncio
from database import db  # assumes your db instance is accessible from here

async def mark_featured():
    # Set featured = True for the first 4 products
    products = await db.products.find().limit(4).to_list(4)
    for product in products:
        await db.products.update_one(
            {"_id": product["_id"]},
            {"$set": {"featured": True}}
        )

    # Set featured = True for the first 3 services offered
    services = await db.services_offered.find().limit(4).to_list(4)
    for service in services:
        await db.services_offered.update_one(
            {"_id": service["_id"]},
            {"$set": {"featured": True}}
        )

    print("✅ Marked featured products and services.")

# Run it
if __name__ == "__main__":
    asyncio.run(mark_featured())
