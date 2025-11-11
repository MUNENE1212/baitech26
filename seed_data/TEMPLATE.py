"""
Template file for adding new products and services
Copy these templates and fill in your data
"""

# ============================================================================
# PRODUCT TEMPLATE
# ============================================================================

PRODUCT_TEMPLATE = {
    # REQUIRED FIELDS
    "product_id": "YOUR-PRODUCT-ID",  # Uppercase, hyphen-separated (e.g., "HDMI-CABLE-5M")
    "name": "Product Full Name",      # Clear, descriptive name
    "description": "Detailed description of the product, its benefits, and use cases.",
    "price": 0.00,                    # Float - price in KES
    "stock": 0,                       # Integer - available quantity
    "category": "Main Category",      # e.g., "Portable Audio", "Networking"

    # OPTIONAL BUT RECOMMENDED
    "subcategory": "Specific Type",   # e.g., "Bluetooth Speakers", "WiFi Adapters"
    "brand": "Brand Name",            # Manufacturer or brand
    "sku": "SKU-CODE-001",           # Stock keeping unit
    "features": [                     # List of key features
        "Feature 1",
        "Feature 2",
        "Feature 3"
    ],
    "images": [                       # List of image paths
        "/static/images/product_main.png",
        "/static/images/product_alt.png"
    ],
    "featured": False,                # Boolean - show on homepage
    "is_active": True,                # Boolean - available for purchase
}


# Example: Real product using the template
EXAMPLE_PRODUCT = {
    "product_id": "HDMI-CABLE-10M",
    "name": "10M Premium HDMI 2.1 Cable",
    "description": "High-speed HDMI cable supporting 4K@120Hz, 8K@60Hz, and HDR. Gold-plated connectors with braided nylon jacket for durability.",
    "price": 1499.00,
    "stock": 75,
    "category": "Cables & Adapters",
    "subcategory": "HDMI Cables",
    "brand": "Premium",
    "sku": "HDMI-10M-001",
    "features": [
        "HDMI 2.1 specification",
        "Supports 4K@120Hz and 8K@60Hz",
        "HDR and eARC support",
        "Gold-plated connectors",
        "Braided nylon jacket",
        "10-meter length"
    ],
    "images": [
        "/static/images/hdmi_10m_1.png",
        "/static/images/hdmi_10m_2.png"
    ],
    "featured": True,
    "is_active": True,
}


# ============================================================================
# SERVICE TEMPLATE
# ============================================================================

SERVICE_TEMPLATE = {
    # REQUIRED FIELDS
    "service_id": "SRV-XXX-001",      # Standard format: SRV-[CATEGORY]-[NUMBER]
    "name": "Service Name",            # Clear, descriptive name
    "description": "Detailed description of the service, what's included, and expected outcomes.",
    "category": "Service Category",    # e.g., "Security Systems", "Computer Services"
    "base_price": 0.00,               # Float - starting price in KES
    "price_type": "starting_from",    # Options: "starting_from", "fixed", "per_hour", "per_month"

    # OPTIONAL BUT RECOMMENDED
    "subcategory": "Service Type",    # e.g., "Installation", "Repair", "Maintenance"
    "duration_estimate": "X-Y hours", # Expected time to complete
    "service_type": "installation",   # Options: "installation", "repair", "maintenance", "recovery"
    "features": [                     # What's included in the service
        "What's included 1",
        "What's included 2",
        "What's included 3"
    ],
    "requirements": [                 # What customer needs to provide
        "Customer requirement 1",
        "Customer requirement 2"
    ],
    "featured": False,                # Boolean - show on homepage
    "is_active": True,                # Boolean - currently offering
}


# Example: Real service using the template
EXAMPLE_SERVICE = {
    "service_id": "SRV-ELEC-001",
    "name": "Electrical Wiring & Installation",
    "description": "Professional electrical wiring services for homes and offices. Includes circuit installation, outlet setup, lighting installation, and electrical panel upgrades with safety certification.",
    "category": "Electrical Services",
    "subcategory": "Installation",
    "base_price": 3500.00,
    "price_type": "starting_from",
    "duration_estimate": "3-6 hours",
    "service_type": "installation",
    "features": [
        "Complete electrical assessment",
        "Circuit installation and wiring",
        "Power outlet installation",
        "Lighting fixture setup",
        "Electrical panel upgrades",
        "Safety testing and certification",
        "Clean-up after installation"
    ],
    "requirements": [
        "Building electrical plans (if available)",
        "Access to main electrical panel",
        "List of outlets and fixtures needed",
        "Building permits (for major installations)"
    ],
    "featured": True,
    "is_active": True,
}


# ============================================================================
# NAMING CONVENTIONS
# ============================================================================

"""
PRODUCT ID CONVENTIONS:
- Format: CATEGORY-MODEL or BRAND-MODEL-SPEC
- Examples:
  - HDMI-CABLE-10M
  - SAM45W-PD (Samsung 45W Power Delivery)
  - RX09-BTSPK (RX09 Bluetooth Speaker)
  - USBWIFI-600 (USB WiFi 600Mbps)

- Rules:
  - Always UPPERCASE
  - Use hyphens (-) not underscores (_)
  - Be descriptive but concise
  - Include key specs if relevant

SERVICE ID CONVENTIONS:
- Format: SRV-CATEGORY-NUMBER
- Examples:
  - SRV-SEC-001 (Security service #1)
  - SRV-TV-001 (TV service #1)
  - SRV-COMP-001 (Computer service #1)
  - SRV-ELEC-001 (Electrical service #1)

- Rules:
  - Always start with "SRV-"
  - Use 3-4 letter category code
  - Use 3-digit sequential number
  - All UPPERCASE

CATEGORY SUGGESTIONS:

Products:
- Portable Audio
- Streaming Devices
- Cables & Adapters
- Networking
- Mobile Accessories
- Computer Accessories
- Gaming Accessories
- Smart Home Devices
- Solar & Energy
- Security Equipment

Services:
- Security Systems
- Entertainment Systems
- Computer Services
- Networking
- Smart Home
- Solar & Energy
- Mobile Services
- Electrical Services
- Installation Services
- Repair Services
- Maintenance Services
"""


# ============================================================================
# HOW TO USE THIS TEMPLATE
# ============================================================================

"""
STEP 1: Copy the appropriate template (PRODUCT_TEMPLATE or SERVICE_TEMPLATE)

STEP 2: Fill in all fields with your data
- Required fields must be filled
- Optional fields improve searchability and user experience

STEP 3: Add your filled template to the appropriate file:
- Products: add to seed_data/products.py in the products list
- Services: add to seed_data/services.py in the services list

STEP 4: Run the seeding script:
```bash
python seed_database.py
```

STEP 5: Choose your target (local or Atlas) and verify the data

EXAMPLE WORKFLOW:

# 1. Open seed_data/products.py
# 2. Copy PRODUCT_TEMPLATE from this file
# 3. Fill it in:

{
    "product_id": "USBC-CABLE-2M",
    "name": "2M USB-C Fast Charging Cable",
    "description": "Durable USB-C to USB-C cable supporting 100W Power Delivery and 480Mbps data transfer.",
    "price": 599.00,
    "stock": 150,
    "category": "Cables & Adapters",
    "subcategory": "USB Cables",
    "brand": "Generic",
    "sku": "USBC-2M-001",
    "features": [
        "100W Power Delivery support",
        "480Mbps data transfer",
        "2-meter length",
        "Braided nylon design"
    ],
    "images": ["/static/images/usbc_2m.png"],
    "featured": False,
    "is_active": True,
}

# 4. Add it to the products list in seed_data/products.py
# 5. Run: python seed_database.py
# 6. Done!
"""
