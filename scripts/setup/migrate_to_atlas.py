"""
Quick migration script to export from local MongoDB and import to Atlas
"""

import asyncio
import os
from seed_database import DatabaseSeeder


async def migrate_to_atlas():
    """Export from local and import to Atlas"""

    print("=" * 70)
    print("  MIGRATE LOCAL MONGODB TO ATLAS")
    print("=" * 70)

    # Step 1: Export from local
    print("\n📤 STEP 1: Exporting data from local MongoDB...")
    local_seeder = DatabaseSeeder(use_atlas=False)

    try:
        await local_seeder.connect()
        export_result = await local_seeder.export_existing_data("exported_data")
        await local_seeder.disconnect()

        print(f"\n✅ Exported {export_result['products_count']} products")
        print(f"✅ Exported {export_result['services_count']} services")

    except Exception as e:
        print(f"\n❌ Error exporting from local: {str(e)}")
        print("Make sure local MongoDB is running on localhost:27017")
        return

    # Step 2: Import to Atlas
    print("\n📥 STEP 2: Importing data to MongoDB Atlas...")
    atlas_seeder = DatabaseSeeder(use_atlas=True)

    try:
        await atlas_seeder.connect()

        # Create indexes
        await atlas_seeder.create_indexes()

        # Import the optimized data from seed_data
        from seed_data.products import products
        from seed_data.services import services

        # Seed products
        product_stats = await atlas_seeder.seed_products(products, skip_existing=False)
        print(f"\n  📦 Products - Inserted/Updated: {product_stats['inserted']}, "
              f"Errors: {product_stats['errors']}")

        # Seed services
        service_stats = await atlas_seeder.seed_services(services, skip_existing=False)
        print(f"  🛠️  Services - Inserted/Updated: {service_stats['inserted']}, "
              f"Errors: {service_stats['errors']}")

        # Print summary
        await atlas_seeder.print_summary()

        print("\n" + "=" * 70)
        print("  ✅ MIGRATION COMPLETE!")
        print("=" * 70)
        print("\n💡 Your optimized data is now in MongoDB Atlas")
        print("💡 Local exports saved in: exported_data/")

    except Exception as e:
        print(f"\n❌ Error importing to Atlas: {str(e)}")
        print("Check your Atlas connection string in .env")
    finally:
        await atlas_seeder.disconnect()


if __name__ == "__main__":
    asyncio.run(migrate_to_atlas())
