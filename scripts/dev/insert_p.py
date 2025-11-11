import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URI = "mongodb://localhost:27017"
DB_NAME = "baitekdb"  # Replace with your actual DB name
COLLECTION_NAME = "products"

products = [
  {
    "product_id": "ANYCASTM9",
    "name": "AnyCast M9 WiFi Display Dongle",
    "description": "Wireless display dongle that mirrors your phone/tablet/PC screen to TV via WiFi. Supports 1080p HD streaming.",
    "features": ["Wireless screen mirroring", "Supports Android/iOS/Windows", "1080p Full HD", "Plug-and-play"],
    "price": 1999,
    "stock": 35,
    "category": "Streaming Devices",
    "images": ["/static/images/anycast_1.png"],
    "featured": False
  },
  {
    "product_id": "RX08BTSPK",
    "name": "RX08 Portable Wireless Bluetooth Speaker",
    "description": "Compact waterproof Bluetooth speaker with LED lights and 12-24h playtime.",
    "features": ["Bluetooth 5.0", "IPX5 waterproof", "360° sound", "LED lights"],
    "price": 1499,
    "stock": 120,
    "category": "Portable Audio",
    "images": ["/static/images/rx08_1.png", "/static/images/rx08_2.png"],
    "featured": True
  },
  {
    "product_id": "RX09BTSPK",
    "name": "RX09 15W Portable Bluetooth Speaker",
    "description": "High-power 15W speaker with RGB lighting, IPX6 rating, and TWS pairing.",
    "features": ["15W output", "Bluetooth 5.1", "IPX6 waterproof", "RGB lights", "TWS pairing"],
    "price": 1899,
    "stock": 85,
    "category": "Portable Audio",
    "images": ["/static/images/rx09_1.png", "/static/images/rx09_2.png","/static/images/rx09_2.png"],
    "featured": True
  },
  {
    "product_id": "3IN1HDTV-KE",
    "name": "3-in-1 HDTV Cable (HDMI+VGA+AV)",
    "description": "Universal converter cable for connecting devices to TVs/projectors.",
    "features": ["HDMI+VGA+AV", "1080p HD", "Gold-plated connectors", "6ft cable"],
    "price": 799,
    "stock": 200,
    "category": "Cables & Adapters",
    "images": ["/static/images/3in1hd_1.png", "/static/images/3in1hd_2.png"],
    "featured": True
  },
  {
    "product_id": "CHROMECAST-HD",
    "name": "Google Chromecast HDMI Streaming Device",
    "description": "Stream content from your phone/laptop to TV in HD.",
    "features": ["1080p HD", "Works with Android/iOS/PC", "Voice control", "Screen mirroring"],
    "price": 2499,
    "stock": 30,
    "category": "Streaming Devices",
    "images": ["/static/images/chromecast_2.png"],
    "featured": True
  },
  {
    "product_id": "USBWIFI600",
    "name": "600Mbps USB Wi-Fi Dongle with Antenna",
    "description": "High-speed wireless adapter for PCs/laptops.",
    "features": ["600Mbps speed", "5dBi antenna", "USB 2.0", "Windows support"],
    "price": 1599,
    "stock": 150,
    "category": "Networking",
    "images": ["/static/images/wifi-dongle_1.png"],
    "featured": False
  },
  {
    "product_id": "SAM25W-A15",
    "name": "Samsung 25W Fast Charger Adapter",
    "description": "Original Samsung fast charger for Galaxy series.",
    "features": ["25W Super Fast Charging", "Type-C output", "PPS support", "Compact design"],
    "price": 999,
    "stock": 80,
    "category": "Mobile Accessories",
    "images": ["/static/images/sam25wpd.png", "/static/images/sam25wpd_2.png"],
    "featured": False
  },
  {
    "product_id": "SAM45W-PD",
    "name": "Samsung 45W PD Adapter",
    "description": "Premium 45W charger for Galaxy S23 Ultra/Note series.",
    "features": ["45W Super Fast Charging", "USB PD 3.0", "5A support", "Foldable plug"],
    "price": 1999,
    "stock": 45,
    "category": "Mobile Accessories",
    "images": ["/static/images/sam45wpd_1.png"],
    "featured": True
  },
  {
    "product_id": "BT51-DONGLE",
    "name": "Bluetooth 5.1 USB Dongle",
    "description": "Wireless adapter for PCs/laptops.",
    "features": ["Bluetooth 5.1", "10m range", "Plug-and-play", "Nano-sized"],
    "price": 899,
    "stock": 200,
    "category": "Computer Accessories",
    "images": ["/static/images/btusb5.1_1.jpg"],
    "featured": False
  },
  {
    "product_id": "S450BTSPK",
    "name": "S450 Professional Bluetooth Audio Speaker",
    "description": "High-power portable PA system with dual wireless mics.",
    "features": ["1000W peak power", "Bluetooth 5.0", "UHF wireless mics", "RGB lights"],
    "price": 3499,
    "stock": 25,
    "category": "Portable Audio",
    "images": ["/static/images/s450_1.png", "/static/images/s450_2.png","/static/images/s450_3.png"],
    "featured": True
  },
  {
    "product_id": "P-SERIES-BT",
    "name": "P-Series Portable Bluetooth Speaker",
    "description": "High-fidelity wireless speaker with enhanced bass and durable design.",
    "features": ["Bluetooth 5.0", "IPX5 waterproof", "20W output", "24h playtime"],
    "price": 1599,
    "stock": 100,
    "category": "Portable Audio",
    "images": ["/static/images/68D_1.png", "/static/images/68D.png"],
    "featured": False
  }
]
async def insert_products():
    client = AsyncIOMotorClient(MONGO_URI)
    db = client[DB_NAME]

    # Optional: Create index on product_id if not already done
    await db[COLLECTION_NAME].create_index("product_id", unique=True)

    # Insert products
    for product in products:
        existing = await db[COLLECTION_NAME].find_one({"product_id": product["product_id"]})
        if not existing:
            await db[COLLECTION_NAME].insert_one(product)
            print(f"✅ Inserted: {product['name']}")
        else:
            print(f"⚠️ Skipped (already exists): {product['name']}")

    client.close()

if __name__ == "__main__":
    asyncio.run(insert_products())