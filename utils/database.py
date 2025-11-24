import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from fastapi import FastAPI

app = FastAPI()

load_dotenv()

# Read from environment variables, fallback to localhost for development
MONGO_URI = os.getenv("MONGO_URL", "mongodb://localhost:27017")
MONGO_DB = os.getenv("MONGO_DB", "baitekdb")

# Connect to MongoDB (local or Atlas)
client = AsyncIOMotorClient(MONGO_URI)
db = client[MONGO_DB]

@app.on_event("startup")
async def startup_db():
    # Create unique index for product_id
    await db.products.create_index("product_id", unique=True)
    await db.services.create_index("service_id", unique=True)
