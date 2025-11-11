"""
Optimized product seed data with standardized naming conventions
"""

products = [
    {
        "product_id": "ANYCAST-M9",
        "name": "AnyCast M9 WiFi Display Dongle",
        "description": "Wireless display dongle that mirrors your phone, tablet, or PC screen to TV via WiFi. Supports 1080p HD streaming with plug-and-play functionality.",
        "features": [
            "Wireless screen mirroring",
            "Cross-platform support (Android/iOS/Windows)",
            "1080p Full HD resolution",
            "Plug-and-play installation"
        ],
        "price": 1999.00,
        "stock": 35,
        "category": "Streaming Devices",
        "subcategory": "Display Adapters",
        "images": ["/static/images/anycast_1.png"],
        "featured": False,
        "is_active": True,
        "brand": "AnyCast",
        "sku": "ANYCAST-M9-001"
    },
    {
        "product_id": "RX08-BTSPK",
        "name": "RX08 Portable Wireless Bluetooth Speaker",
        "description": "Compact waterproof Bluetooth speaker featuring LED lights and extended 12-24 hour playtime. Perfect for outdoor activities and parties.",
        "features": [
            "Bluetooth 5.0 connectivity",
            "IPX5 waterproof rating",
            "360-degree sound output",
            "Dynamic LED lights",
            "12-24 hour playtime"
        ],
        "price": 1499.00,
        "stock": 120,
        "category": "Portable Audio",
        "subcategory": "Bluetooth Speakers",
        "images": ["/static/images/rx08_1.png", "/static/images/rx08_2.png"],
        "featured": True,
        "is_active": True,
        "brand": "RX",
        "sku": "RX08-BTSPK-001"
    },
    {
        "product_id": "RX09-BTSPK",
        "name": "RX09 15W Portable Bluetooth Speaker",
        "description": "High-power 15W speaker with RGB lighting, IPX6 waterproof rating, and True Wireless Stereo (TWS) pairing capability.",
        "features": [
            "15W high-power output",
            "Bluetooth 5.1 connectivity",
            "IPX6 waterproof rating",
            "RGB dynamic lighting",
            "TWS stereo pairing"
        ],
        "price": 1899.00,
        "stock": 85,
        "category": "Portable Audio",
        "subcategory": "Bluetooth Speakers",
        "images": [
            "/static/images/rx09_1.png",
            "/static/images/rx09_2.png"
        ],
        "featured": True,
        "is_active": True,
        "brand": "RX",
        "sku": "RX09-BTSPK-001"
    },
    {
        "product_id": "3IN1-HDTV-KE",
        "name": "3-in-1 HDTV Universal Cable (HDMI+VGA+AV)",
        "description": "Universal converter cable for connecting multiple device types to TVs and projectors. Supports 1080p HD resolution with gold-plated connectors.",
        "features": [
            "3-in-1 connectivity (HDMI+VGA+AV)",
            "1080p HD support",
            "Gold-plated connectors",
            "6ft cable length"
        ],
        "price": 799.00,
        "stock": 200,
        "category": "Cables & Adapters",
        "subcategory": "Video Cables",
        "images": ["/static/images/3in1hd_1.png", "/static/images/3in1hd_2.png"],
        "featured": True,
        "is_active": True,
        "brand": "Generic",
        "sku": "3IN1-HDTV-001"
    },
    {
        "product_id": "CHROMECAST-HD",
        "name": "Google Chromecast HDMI Streaming Device",
        "description": "Stream content from your smartphone, tablet, or laptop to TV in high definition. Features voice control and universal screen mirroring.",
        "features": [
            "1080p HD streaming",
            "Cross-platform compatibility (Android/iOS/PC)",
            "Voice control enabled",
            "Screen mirroring capability"
        ],
        "price": 2499.00,
        "stock": 30,
        "category": "Streaming Devices",
        "subcategory": "Media Streamers",
        "images": ["/static/images/chromecast_2.png"],
        "featured": True,
        "is_active": True,
        "brand": "Google",
        "sku": "CHROMECAST-HD-001"
    },
    {
        "product_id": "USBWIFI-600",
        "name": "600Mbps USB WiFi Adapter with External Antenna",
        "description": "High-speed wireless adapter for desktop PCs and laptops. Features external 5dBi antenna for enhanced signal reception.",
        "features": [
            "600Mbps transfer speed",
            "5dBi external antenna",
            "USB 2.0 interface",
            "Windows compatible"
        ],
        "price": 1599.00,
        "stock": 150,
        "category": "Networking",
        "subcategory": "WiFi Adapters",
        "images": ["/static/images/wifi-dongle_1.png"],
        "featured": False,
        "is_active": True,
        "brand": "Generic",
        "sku": "USBWIFI-600-001"
    },
    {
        "product_id": "SAM25W-A15",
        "name": "Samsung 25W Fast Charger Adapter",
        "description": "Original Samsung fast charger designed for Galaxy series devices. Features Super Fast Charging technology with PPS support.",
        "features": [
            "25W Super Fast Charging",
            "USB Type-C output",
            "PPS (Programmable Power Supply) support",
            "Compact design"
        ],
        "price": 999.00,
        "stock": 80,
        "category": "Mobile Accessories",
        "subcategory": "Chargers",
        "images": ["/static/images/sam25wpd.png", "/static/images/sam25wpd_2.png"],
        "featured": False,
        "is_active": True,
        "brand": "Samsung",
        "sku": "SAM25W-A15-001"
    },
    {
        "product_id": "SAM45W-PD",
        "name": "Samsung 45W Power Delivery Adapter",
        "description": "Premium 45W fast charger for Galaxy S23 Ultra, Note series, and compatible devices. Features USB PD 3.0 and 5A high-current support.",
        "features": [
            "45W Super Fast Charging",
            "USB PD 3.0 standard",
            "5A high-current support",
            "Foldable plug design"
        ],
        "price": 1999.00,
        "stock": 45,
        "category": "Mobile Accessories",
        "subcategory": "Chargers",
        "images": ["/static/images/sam45wpd_1.png"],
        "featured": True,
        "is_active": True,
        "brand": "Samsung",
        "sku": "SAM45W-PD-001"
    },
    {
        "product_id": "BT51-DONGLE",
        "name": "Bluetooth 5.1 USB Adapter",
        "description": "Nano-sized wireless Bluetooth adapter for desktop PCs and laptops. Plug-and-play functionality with 10-meter range.",
        "features": [
            "Bluetooth 5.1 technology",
            "10-meter wireless range",
            "Plug-and-play installation",
            "Nano-sized design"
        ],
        "price": 899.00,
        "stock": 200,
        "category": "Computer Accessories",
        "subcategory": "Bluetooth Adapters",
        "images": ["/static/images/btusb5.1_1.jpg"],
        "featured": False,
        "is_active": True,
        "brand": "Generic",
        "sku": "BT51-DONGLE-001"
    },
    {
        "product_id": "S450-BTSPK",
        "name": "S450 Professional Bluetooth Audio Speaker",
        "description": "High-power portable PA system with dual UHF wireless microphones. Perfect for events, parties, and professional presentations.",
        "features": [
            "1000W peak power output",
            "Bluetooth 5.0 connectivity",
            "Dual UHF wireless microphones",
            "RGB dynamic lighting",
            "Rechargeable battery"
        ],
        "price": 3499.00,
        "stock": 25,
        "category": "Portable Audio",
        "subcategory": "Professional Speakers",
        "images": [
            "/static/images/s450_1.png",
            "/static/images/s450_2.png",
            "/static/images/s450_3.png"
        ],
        "featured": True,
        "is_active": True,
        "brand": "S-Series",
        "sku": "S450-BTSPK-001"
    },
    {
        "product_id": "P-SERIES-BT",
        "name": "P-Series Portable Bluetooth Speaker",
        "description": "High-fidelity wireless speaker featuring enhanced bass, durable waterproof design, and extended 24-hour playtime.",
        "features": [
            "Bluetooth 5.0 connectivity",
            "IPX5 waterproof rating",
            "20W power output",
            "24-hour battery life",
            "Enhanced bass technology"
        ],
        "price": 1599.00,
        "stock": 100,
        "category": "Portable Audio",
        "subcategory": "Bluetooth Speakers",
        "images": ["/static/images/68D_1.png", "/static/images/68D.png"],
        "featured": False,
        "is_active": True,
        "brand": "P-Series",
        "sku": "P-SERIES-BT-001"
    }
]
