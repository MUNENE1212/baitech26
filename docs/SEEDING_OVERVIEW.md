# Database Seeding System - Quick Overview

## What This System Does

✅ **Exports** products and services from your local MongoDB
✅ **Optimizes** data with standardized naming conventions
✅ **Seeds** data to MongoDB Atlas or local database
✅ **Provides** reusable templates for adding new items

## File Structure

```
newbaitech/
│
├── 📁 seed_data/                    # Your product and service data
│   ├── products.py                  # 11 optimized products
│   ├── services.py                  # 10 optimized services
│   ├── TEMPLATE.py                  # Copy-paste templates
│   └── README.md                    # Quick reference
│
├── 🔧 seed_database.py             # Main seeding utility (interactive)
├── 🚀 migrate_to_atlas.py          # One-click migration to Atlas
├── 📚 SEEDING_GUIDE.md             # Complete documentation
└── 📋 SEEDING_OVERVIEW.md          # This file
```

## Quick Commands

### Migrate Everything to Atlas
```bash
python migrate_to_atlas.py
```
Automatically exports from local and imports to Atlas with optimized data.

### Interactive Seeding
```bash
python seed_database.py
```
Choose what you want to do:
1. Seed to Local MongoDB
2. Seed to MongoDB Atlas
3. Export from Local
4. Export from Atlas

### Add New Products/Services
1. Edit `seed_data/products.py` or `seed_data/services.py`
2. Add your data (use existing items as templates)
3. Run `python seed_database.py`

## Key Features

### 🎯 Optimized Naming
- **Products**: `ANYCAST-M9`, `SAM45W-PD`, `HDMI-CABLE-10M`
- **Services**: `SRV-SEC-001`, `SRV-TV-001`, `SRV-COMP-001`

### 📊 Enhanced Data Structure
- **Products**: Added `brand`, `sku`, `subcategory`, timestamps
- **Services**: Added `price_type`, `duration_estimate`, `requirements`, `service_type`

### 🔍 Automatic Indexing
Creates indexes for:
- Unique IDs (product_id, service_id)
- Categories and featured items
- Full-text search on names and descriptions

### 📤 Export Functionality
Export existing data to JSON for:
- Backup before making changes
- Reference when adding new items
- Migration documentation

## Current Data Optimizations

### Products (11 items)
| ID | Name | Category | Price | Featured |
|----|------|----------|-------|----------|
| ANYCAST-M9 | AnyCast M9 WiFi Display Dongle | Streaming Devices | 1,999 | No |
| RX08-BTSPK | RX08 Portable Bluetooth Speaker | Portable Audio | 1,499 | Yes |
| RX09-BTSPK | RX09 15W Bluetooth Speaker | Portable Audio | 1,899 | Yes |
| 3IN1-HDTV-KE | 3-in-1 HDTV Cable | Cables & Adapters | 799 | Yes |
| CHROMECAST-HD | Google Chromecast | Streaming Devices | 2,499 | Yes |
| USBWIFI-600 | 600Mbps WiFi Adapter | Networking | 1,599 | No |
| SAM25W-A15 | Samsung 25W Charger | Mobile Accessories | 999 | No |
| SAM45W-PD | Samsung 45W PD Adapter | Mobile Accessories | 1,999 | Yes |
| BT51-DONGLE | Bluetooth 5.1 Adapter | Computer Accessories | 899 | No |
| S450-BTSPK | S450 Professional Speaker | Portable Audio | 3,499 | Yes |
| P-SERIES-BT | P-Series Bluetooth Speaker | Portable Audio | 1,599 | No |

### Services (10 offerings)
| ID | Name | Category | Base Price | Type |
|----|------|----------|------------|------|
| SRV-SEC-001 | Surveillance System Installation | Security Systems | 5,000 | Installation |
| SRV-TV-001 | TV Wall Mounting | Entertainment | 1,500 | Installation |
| SRV-COMP-001 | Computer & Laptop Repair | Computer Services | 1,000 | Repair |
| SRV-NET-001 | Network Setup | Networking | 2,500 | Installation |
| SRV-HT-001 | Home Theater Installation | Entertainment | 8,000 | Installation |
| SRV-SOLAR-001 | Solar Power Installation | Solar & Energy | 150,000 | Installation |
| SRV-PHONE-001 | Phone Screen Repair | Mobile Services | 2,000 | Repair |
| SRV-DATA-001 | Data Recovery | Computer Services | 3,000 | Recovery |
| SRV-SMART-001 | Smart Home Automation | Smart Home | 10,000 | Installation |
| SRV-MAINT-001 | IT Maintenance Package | Computer Services | 5,000/mo | Maintenance |

## Workflow Examples

### Example 1: First-Time Setup (Fresh Database)
```bash
# Seed optimized data to Atlas
python migrate_to_atlas.py

# Result: 11 products + 10 services in MongoDB Atlas
```

### Example 2: Add New Products
```bash
# 1. Edit seed_data/products.py
# 2. Add your new product to the list
# 3. Run seeding
python seed_database.py
# Choose option 2 (Atlas)
# Answer 'N' to not overwrite existing (skip duplicates)
```

### Example 3: Update Existing Data
```bash
# 1. Edit products/services in seed_data/
# 2. Run seeding
python seed_database.py
# Choose option 2 (Atlas)
# Answer 'y' to overwrite existing (update all)
```

### Example 4: Backup Before Changes
```bash
# Export current Atlas data
python seed_database.py
# Choose option 4 (Export from Atlas)
# Data saved to: exported_data/
```

## Naming Standards Quick Reference

### Products
```python
"product_id": "CATEGORY-MODEL-SPEC",  # HDMI-CABLE-10M
"name": "Full Descriptive Name",
"price": 1999.00,                     # Float
"stock": 50,                          # Integer
"category": "Main Category",
"subcategory": "Specific Type",
"brand": "Brand Name",
"sku": "SKU-CODE-001",
"featured": True/False,
"is_active": True/False
```

### Services
```python
"service_id": "SRV-CAT-001",         # SRV-SEC-001
"name": "Service Name",
"base_price": 5000.00,               # Float
"price_type": "starting_from",       # or "fixed", "per_hour", "per_month"
"duration_estimate": "2-4 hours",
"service_type": "installation",      # or "repair", "maintenance", "recovery"
"featured": True/False,
"is_active": True/False
```

## Common Tasks

| Task | Command | Time |
|------|---------|------|
| Migrate to Atlas | `python migrate_to_atlas.py` | ~30s |
| Add new product | Edit `seed_data/products.py` + run seed | ~5min |
| Backup data | `python seed_database.py` (option 3/4) | ~10s |
| Update prices | Edit files + run with overwrite | ~2min |

## Troubleshooting

**Q: "Connection refused" error**
A: Make sure MongoDB is running locally or check Atlas credentials

**Q: "Duplicate key error"**
A: Product/service already exists. Answer 'N' to skip or 'y' to update

**Q: "Module not found: seed_data"**
A: Run from project root: `/media/munen/muneneENT/newbaitech/`

**Q: How do I check what's in my database?**
A: Run `python seed_database.py` → option 3/4 → check `exported_data/`

## Need More Help?

- 📖 **Complete Guide**: Read `SEEDING_GUIDE.md`
- 📋 **Templates**: Check `seed_data/TEMPLATE.py`
- 🔍 **Examples**: Review `seed_data/products.py` and `seed_data/services.py`

## System Summary

✅ **11 optimized products** with enhanced metadata
✅ **10 professional services** with detailed pricing
✅ **Standardized naming** across all data
✅ **Automatic indexing** for better performance
✅ **Export/Import tools** for easy migration
✅ **Reusable templates** for future additions

**Ready to use!** Start with `python migrate_to_atlas.py`
