from datetime import datetime
from utils.database import db

async def generate_order_number():
    today = datetime.utcnow().strftime("%d-%m-%y")
    date_prefix = f"ORD-{today}"

    count = await db.orders.count_documents({
        "order_date": {
            "$gte": datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0),
            "$lt": datetime.utcnow().replace(hour=23, minute=59, second=59, microsecond=999999),
        }
    })

    order_number = f"ORD-{str(count + 1).zfill(3)}-{today}"
    return order_number
