import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from fastapi import FastAPI

app = FastAPI()

load_dotenv()

# Read from environment variables, fallback to localhost for development
MONGO_URI = os.getenv("MONGO_URL", "mongodb://localhost:27017")
MONGO_DB = os.getenv("MONGO_DB", "baitekdb")

# Simplify the connection string to work with OpenSSL 3.x
# Remove conflicting TLS parameters from the URI if they exist
if "mongodb+srv://" in MONGO_URI or "tls=true" in MONGO_URI:
    # For MongoDB Atlas with OpenSSL 3.x, use minimal configuration
    # Remove tls parameters from URI and add them as connection options
    base_uri = MONGO_URI.split('?')[0]  # Get base URI without parameters

    client = AsyncIOMotorClient(
        base_uri,
        serverSelectionTimeoutMS=30000,
        connectTimeoutMS=20000,
        socketTimeoutMS=20000,
    )
else:
    # Local MongoDB connection
    client = AsyncIOMotorClient(MONGO_URI)

db = client[MONGO_DB]

@app.on_event("startup")
async def startup_db():
    # Create unique index for product_id
    await db.products.create_index("product_id", unique=True)
    await db.services.create_index("service_id", unique=True)
