# Seed Data Directory

This directory contains optimized product and service data with standardized naming conventions.

## Quick Start

### Adding a New Product

1. Open `products.py`
2. Copy a similar product from the list
3. Modify the values following these rules:
   - `product_id`: UPPERCASE-WITH-HYPHENS (e.g., `"NEW-PRODUCT-X1"`)
   - `name`: Clear, descriptive name
   - `price`: Float value (e.g., `1999.00`)
   - `stock`: Integer value (e.g., `50`)
   - `category`: Use existing categories or create new ones
4. Add your product to the `products` list
5. Run: `python seed_database.py`

### Adding a New Service

1. Open `services.py`
2. Copy a similar service from the list
3. Modify the values following these rules:
   - `service_id`: `"SRV-XXX-001"` format (e.g., `"SRV-ELEC-001"`)
   - `name`: Clear service name
   - `base_price`: Float value
   - `price_type`: `"starting_from"`, `"fixed"`, `"per_hour"`, or `"per_month"`
4. Add your service to the `services` list
5. Run: `python seed_database.py`

## File Structure

- `__init__.py` - Package initialization
- `products.py` - All product data
- `services.py` - All service offerings
- `TEMPLATE.py` - Detailed templates and examples
- `README.md` - This file

## Naming Conventions

### Product IDs
- Format: `CATEGORY-MODEL-SPEC`
- Examples: `HDMI-CABLE-10M`, `SAM45W-PD`, `RX09-BTSPK`
- Rules: UPPERCASE, use hyphens, be descriptive

### Service IDs
- Format: `SRV-CATEGORY-NUMBER`
- Examples: `SRV-SEC-001`, `SRV-TV-001`, `SRV-COMP-001`
- Rules: Always start with `SRV-`, 3-4 letter category, 3-digit number

## Need Help?

- Check `TEMPLATE.py` for detailed examples
- See `../SEEDING_GUIDE.md` for complete documentation
- Review existing products/services for reference

## Current Inventory

**Products**: 11 items across 6 categories
**Services**: 10 offerings across 8 categories

Run `python seed_database.py` and choose option 3 or 4 to export current data for reference.
