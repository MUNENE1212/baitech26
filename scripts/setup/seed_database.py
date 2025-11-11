"""
Comprehensive Database Seeding Script
Exports data from local MongoDB and seeds to MongoDB Atlas with optimized naming and structure
"""

import asyncio
import os
import json
from datetime import datetime, timezone
from typing import List, Dict
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Import seed data
from seed_data.products import products
from seed_data.services import services

load_dotenv()


class DatabaseSeeder:
    """Handles database seeding operations with optimization and standardization"""

    def __init__(self, use_atlas: bool = True):
        """
        Initialize the seeder

        Args:
            use_atlas: If True, use Atlas connection; if False, use local MongoDB
        """
        if use_atlas:
            # Use the second MONGO_URL from .env (Atlas)
            self.mongo_uri = "mongodb+srv://baitech:ix5YYaOLtX0r2LTe@cluster0.nmtob1l.mongodb.net/baitekdb?appName=Cluster0"
        else:
            # Use local MongoDB
            self.mongo_uri = "mongodb://localhost:27017"

        self.db_name = os.getenv("MONGO_DB", "baitekdb")
        self.client = None
        self.db = None

    async def connect(self):
        """Establish database connection"""
        self.client = AsyncIOMotorClient(self.mongo_uri)
        self.db = self.client[self.db_name]
        print(f"✅ Connected to MongoDB: {self.db_name}")

    async def disconnect(self):
        """Close database connection"""
        if self.client:
            self.client.close()
            print("✅ Disconnected from MongoDB")

    async def create_indexes(self):
        """Create necessary database indexes"""
        print("\n📊 Creating database indexes...")

        # Products indexes
        await self.db.products.create_index("product_id", unique=True)
        await self.db.products.create_index("category")
        await self.db.products.create_index("featured")
        await self.db.products.create_index([("name", "text"), ("description", "text")])
        print("  ✅ Product indexes created")

        # Services indexes
        await self.db.services_offered.create_index("service_id", unique=True)
        await self.db.services_offered.create_index("category")
        await self.db.services_offered.create_index("featured")
        await self.db.services_offered.create_index([("name", "text"), ("description", "text")])
        print("  ✅ Service indexes created")

    def optimize_product_data(self, product: Dict) -> Dict:
        """
        Optimize and standardize product data

        Args:
            product: Raw product dictionary

        Returns:
            Optimized product dictionary
        """
        # Standardize product_id format (uppercase, hyphen-separated)
        if "product_id" in product:
            product["product_id"] = product["product_id"].upper().replace("_", "-")

        # Ensure price is float
        if "price" in product:
            product["price"] = float(product["price"])

        # Ensure stock is int
        if "stock" in product:
            product["stock"] = int(product["stock"])

        # Add metadata
        if "created_at" not in product:
            product["created_at"] = datetime.now(timezone.utc)

        product["updated_at"] = datetime.now(timezone.utc)

        # Ensure boolean fields
        product.setdefault("featured", False)
        product.setdefault("is_active", True)

        # Ensure images is a list
        if "images" in product and not isinstance(product["images"], list):
            product["images"] = [product["images"]]
        elif "images" not in product:
            product["images"] = []

        # Standardize features as list
        if "features" in product and not isinstance(product["features"], list):
            product["features"] = [product["features"]]
        elif "features" not in product:
            product["features"] = []

        return product

    def optimize_service_data(self, service: Dict) -> Dict:
        """
        Optimize and standardize service data

        Args:
            service: Raw service dictionary

        Returns:
            Optimized service dictionary
        """
        # Standardize service_id format
        if "service_id" in service:
            service["service_id"] = service["service_id"].upper()

        # Ensure price fields
        if "base_price" in service:
            service["base_price"] = float(service["base_price"])

        # Add metadata
        if "created_at" not in service:
            service["created_at"] = datetime.now(timezone.utc)

        service["updated_at"] = datetime.now(timezone.utc)

        # Ensure boolean fields
        service.setdefault("featured", False)
        service.setdefault("is_active", True)

        # Ensure features and requirements are lists
        if "features" in service and not isinstance(service["features"], list):
            service["features"] = [service["features"]]
        elif "features" not in service:
            service["features"] = []

        if "requirements" in service and not isinstance(service["requirements"], list):
            service["requirements"] = [service["requirements"]]
        elif "requirements" not in service:
            service["requirements"] = []

        return service

    async def seed_products(self, products_data: List[Dict], skip_existing: bool = True) -> Dict:
        """
        Seed products into database

        Args:
            products_data: List of product dictionaries
            skip_existing: If True, skip products that already exist

        Returns:
            Dictionary with seeding statistics
        """
        print("\n📦 Seeding products...")
        stats = {"inserted": 0, "skipped": 0, "errors": 0}

        for product in products_data:
            try:
                # Optimize product data
                optimized_product = self.optimize_product_data(product.copy())

                # Check if product exists
                existing = await self.db.products.find_one(
                    {"product_id": optimized_product["product_id"]}
                )

                if existing:
                    if skip_existing:
                        print(f"  ⏭️  Skipped (exists): {optimized_product['name']}")
                        stats["skipped"] += 1
                    else:
                        # Update existing product
                        await self.db.products.update_one(
                            {"product_id": optimized_product["product_id"]},
                            {"$set": optimized_product}
                        )
                        print(f"  🔄 Updated: {optimized_product['name']}")
                        stats["inserted"] += 1
                else:
                    # Insert new product
                    await self.db.products.insert_one(optimized_product)
                    print(f"  ✅ Inserted: {optimized_product['name']}")
                    stats["inserted"] += 1

            except Exception as e:
                print(f"  ❌ Error with {product.get('name', 'Unknown')}: {str(e)}")
                stats["errors"] += 1

        return stats

    async def seed_services(self, services_data: List[Dict], skip_existing: bool = True) -> Dict:
        """
        Seed services into database

        Args:
            services_data: List of service dictionaries
            skip_existing: If True, skip services that already exist

        Returns:
            Dictionary with seeding statistics
        """
        print("\n🛠️  Seeding services...")
        stats = {"inserted": 0, "skipped": 0, "errors": 0}

        for service in services_data:
            try:
                # Optimize service data
                optimized_service = self.optimize_service_data(service.copy())

                # Check if service exists
                existing = await self.db.services_offered.find_one(
                    {"service_id": optimized_service["service_id"]}
                )

                if existing:
                    if skip_existing:
                        print(f"  ⏭️  Skipped (exists): {optimized_service['name']}")
                        stats["skipped"] += 1
                    else:
                        # Update existing service
                        await self.db.services_offered.update_one(
                            {"service_id": optimized_service["service_id"]},
                            {"$set": optimized_service}
                        )
                        print(f"  🔄 Updated: {optimized_service['name']}")
                        stats["inserted"] += 1
                else:
                    # Insert new service
                    await self.db.services_offered.insert_one(optimized_service)
                    print(f"  ✅ Inserted: {optimized_service['name']}")
                    stats["inserted"] += 1

            except Exception as e:
                print(f"  ❌ Error with {service.get('name', 'Unknown')}: {str(e)}")
                stats["errors"] += 1

        return stats

    async def export_existing_data(self, output_dir: str = "exported_data"):
        """
        Export existing data from database to JSON files

        Args:
            output_dir: Directory to save exported data
        """
        print(f"\n📤 Exporting existing data to {output_dir}/...")

        # Create output directory
        os.makedirs(output_dir, exist_ok=True)

        # Export products
        products_cursor = self.db.products.find({})
        products_list = await products_cursor.to_list(length=None)

        # Convert ObjectId to string for JSON serialization
        for product in products_list:
            if "_id" in product:
                product["_id"] = str(product["_id"])
            if "created_at" in product:
                product["created_at"] = product["created_at"].isoformat()
            if "updated_at" in product:
                product["updated_at"] = product["updated_at"].isoformat()

        products_file = os.path.join(output_dir, "products_export.json")
        with open(products_file, "w", encoding="utf-8") as f:
            json.dump(products_list, f, indent=2, ensure_ascii=False)

        print(f"  ✅ Exported {len(products_list)} products to {products_file}")

        # Export services
        services_cursor = self.db.services_offered.find({})
        services_list = await services_cursor.to_list(length=None)

        # Convert ObjectId to string for JSON serialization
        for service in services_list:
            if "_id" in service:
                service["_id"] = str(service["_id"])
            if "created_at" in service:
                service["created_at"] = service["created_at"].isoformat()
            if "updated_at" in service:
                service["updated_at"] = service["updated_at"].isoformat()

        services_file = os.path.join(output_dir, "services_export.json")
        with open(services_file, "w", encoding="utf-8") as f:
            json.dump(services_list, f, indent=2, ensure_ascii=False)

        print(f"  ✅ Exported {len(services_list)} services to {services_file}")

        return {
            "products_count": len(products_list),
            "services_count": len(services_list),
            "products_file": products_file,
            "services_file": services_file
        }

    async def print_summary(self):
        """Print database summary statistics"""
        print("\n📊 Database Summary:")

        products_count = await self.db.products.count_documents({})
        featured_products = await self.db.products.count_documents({"featured": True})

        services_count = await self.db.services_offered.count_documents({})
        featured_services = await self.db.services_offered.count_documents({"featured": True})

        print(f"  Products: {products_count} total, {featured_products} featured")
        print(f"  Services: {services_count} total, {featured_services} featured")


async def main():
    """Main seeding function"""
    print("=" * 60)
    print("  BAITECH DATABASE SEEDING UTILITY")
    print("=" * 60)

    # Ask user for seeding target
    print("\nSelect seeding target:")
    print("  1. Local MongoDB (localhost:27017)")
    print("  2. MongoDB Atlas (Cloud)")
    print("  3. Export existing data from local")
    print("  4. Export from Atlas")

    choice = input("\nEnter your choice (1-4): ").strip()

    if choice == "1":
        use_atlas = False
        print("\n🎯 Target: Local MongoDB")
    elif choice == "2":
        use_atlas = True
        print("\n🎯 Target: MongoDB Atlas")
    elif choice == "3":
        # Export from local
        seeder = DatabaseSeeder(use_atlas=False)
        await seeder.connect()
        await seeder.export_existing_data()
        await seeder.disconnect()
        return
    elif choice == "4":
        # Export from Atlas
        seeder = DatabaseSeeder(use_atlas=True)
        await seeder.connect()
        await seeder.export_existing_data()
        await seeder.disconnect()
        return
    else:
        print("❌ Invalid choice. Exiting...")
        return

    # Initialize seeder
    seeder = DatabaseSeeder(use_atlas=use_atlas)

    try:
        # Connect to database
        await seeder.connect()

        # Create indexes
        await seeder.create_indexes()

        # Ask about overwriting existing data
        overwrite = input("\nOverwrite existing products/services? (y/N): ").strip().lower()
        skip_existing = overwrite != "y"

        # Seed products
        product_stats = await seeder.seed_products(products, skip_existing=skip_existing)
        print(f"\n  📦 Products - Inserted: {product_stats['inserted']}, "
              f"Skipped: {product_stats['skipped']}, Errors: {product_stats['errors']}")

        # Seed services
        service_stats = await seeder.seed_services(services, skip_existing=skip_existing)
        print(f"  🛠️  Services - Inserted: {service_stats['inserted']}, "
              f"Skipped: {service_stats['skipped']}, Errors: {service_stats['errors']}")

        # Print summary
        await seeder.print_summary()

        print("\n" + "=" * 60)
        print("  ✅ SEEDING COMPLETE!")
        print("=" * 60)

    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
    finally:
        await seeder.disconnect()


if __name__ == "__main__":
    asyncio.run(main())
