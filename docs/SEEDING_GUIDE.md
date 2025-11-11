# Database Seeding Guide

This guide explains how to use the Baitech database seeding system to manage products and services across local MongoDB and MongoDB Atlas.

## Overview

The seeding system provides:
- **Optimized Data Structure**: Standardized naming conventions and data formats
- **Flexible Seeding**: Seed to local MongoDB or Atlas
- **Export Functionality**: Export existing data for backup or migration
- **Reusable Templates**: Easy to add new products and services

## File Structure

```
newbaitech/
├── seed_data/
│   ├── __init__.py          # Package initialization
│   ├── products.py          # Optimized product data
│   └── services.py          # Optimized service offerings
├── seed_database.py         # Main seeding utility
├── migrate_to_atlas.py      # Quick migration script
├── exported_data/           # Exported data (created automatically)
│   ├── products_export.json
│   └── services_export.json
└── SEEDING_GUIDE.md        # This file
```

## Data Optimizations

### Product Naming Standards
- **product_id**: Uppercase, hyphen-separated (e.g., `ANYCAST-M9`, `SAM45W-PD`)
- **Category/Subcategory**: Hierarchical organization
- **Features**: Structured list format
- **Additional Fields**:
  - `brand`: Product manufacturer
  - `sku`: Stock keeping unit
  - `subcategory`: Detailed categorization
  - `is_active`: Product availability status
  - `created_at`/`updated_at`: Timestamps

### Service Naming Standards
- **service_id**: Uppercase with prefix (e.g., `SRV-SEC-001`, `SRV-TV-001`)
- **Category/Subcategory**: Service type organization
- **Pricing Structure**:
  - `base_price`: Starting price
  - `price_type`: `starting_from`, `fixed`, or `per_hour`
- **Additional Fields**:
  - `duration_estimate`: Expected service duration
  - `features`: What's included
  - `requirements`: What customer needs to provide
  - `service_type`: `installation`, `repair`, `maintenance`, `recovery`

## Usage

### 1. Interactive Seeding (Recommended)

Run the main seeding utility:

```bash
python seed_database.py
```

Options:
1. **Local MongoDB** - Seed to localhost:27017
2. **MongoDB Atlas** - Seed to cloud database
3. **Export from Local** - Export existing local data
4. **Export from Atlas** - Export existing Atlas data

### 2. Quick Migration to Atlas

Migrate from local MongoDB to Atlas in one command:

```bash
python migrate_to_atlas.py
```

This will:
1. Export data from local MongoDB
2. Optimize and standardize the data
3. Import to MongoDB Atlas
4. Create necessary indexes

### 3. Adding New Products

Edit `seed_data/products.py` and add new products following the template:

```python
{
    "product_id": "YOUR-PRODUCT-ID",  # Uppercase, hyphen-separated
    "name": "Product Full Name",
    "description": "Detailed product description",
    "features": [
        "Feature 1",
        "Feature 2",
        "Feature 3"
    ],
    "price": 1999.00,  # Float
    "stock": 50,  # Integer
    "category": "Main Category",
    "subcategory": "Specific Category",
    "images": ["/static/images/product_1.png"],
    "featured": False,  # Boolean
    "is_active": True,
    "brand": "Brand Name",
    "sku": "SKU-CODE-001"
}
```

### 4. Adding New Services

Edit `seed_data/services.py` and add new services:

```python
{
    "service_id": "SRV-XXX-001",  # Standard format
    "name": "Service Name",
    "description": "Detailed service description",
    "category": "Service Category",
    "subcategory": "Service Type",
    "base_price": 5000.00,
    "price_type": "starting_from",  # or "fixed", "per_hour", "per_month"
    "duration_estimate": "2-4 hours",
    "features": [
        "What's included 1",
        "What's included 2"
    ],
    "requirements": [
        "Customer requirement 1",
        "Customer requirement 2"
    ],
    "is_active": True,
    "featured": True,
    "service_type": "installation"  # or "repair", "maintenance", "recovery"
}
```

## Database Indexes

The seeding system automatically creates these indexes:

### Products Collection
- `product_id` (unique)
- `category`
- `featured`
- Text index on `name` and `description`

### Services Collection
- `service_id` (unique)
- `category`
- `featured`
- Text index on `name` and `description`

## Environment Configuration

Ensure your `.env` file has the correct MongoDB connection strings:

```env
MONGO_URL=mongodb://localhost:27017
MONGO_DB=baitekdb
MONGO_URL=mongodb+srv://baitech:ix5YYaOLtX0r2LTe@cluster0.nmtob1l.mongodb.net/baitekdb?appName=Cluster0
```

Note: The script uses the second `MONGO_URL` for Atlas connections.

## Current Data Summary

### Products (11 items)
- **Streaming Devices**: AnyCast M9, Chromecast
- **Portable Audio**: RX08, RX09, S450, P-Series speakers
- **Cables & Adapters**: 3-in-1 HDTV cable
- **Networking**: USB WiFi adapter
- **Mobile Accessories**: Samsung chargers (25W, 45W)
- **Computer Accessories**: Bluetooth 5.1 dongle

### Services (10 offerings)
- **Security Systems**: CCTV & alarm installation
- **Entertainment**: TV mounting, home theater setup
- **Computer Services**: Repair, data recovery, maintenance
- **Networking**: Home & office network setup
- **Smart Home**: Automation setup
- **Solar**: Solar power system installation
- **Mobile**: Phone screen repair

## Best Practices

1. **Always export before major changes**:
   ```bash
   python seed_database.py  # Choose option 3 or 4
   ```

2. **Test on local before Atlas**:
   - Seed to local first
   - Verify data
   - Then migrate to Atlas

3. **Use skip_existing for initial seeding**:
   - Answer 'N' when asked about overwriting
   - This prevents duplicate entries

4. **Update existing data**:
   - Answer 'y' when asked about overwriting
   - This updates all matching records

5. **Keep backups**:
   - Export data regularly
   - Exports are saved in `exported_data/`

## Troubleshooting

### Connection Errors
- **Local**: Ensure MongoDB is running: `sudo systemctl start mongod`
- **Atlas**: Check internet connection and credentials in `.env`

### Duplicate Key Errors
- Product/Service already exists with same ID
- Either skip it or update the existing one

### Import Errors
- Check data format in `seed_data/*.py`
- Ensure required fields are present
- Verify data types (float for prices, int for stock)

## Future Enhancements

To add more products or services:

1. Edit `seed_data/products.py` or `seed_data/services.py`
2. Follow the naming conventions above
3. Run `python seed_database.py`
4. Choose your target database
5. Verify the data

## Support

For issues or questions about the seeding system:
- Check this guide
- Review the example data in `seed_data/`
- Examine the exported JSON files for structure reference
