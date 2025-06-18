from fastapi import APIRouter, HTTPException
from models import Order
from database import db
from utils.utils import generate_order_number

router = APIRouter()

# Create new order
@router.post("/orders/")
async def create_order(order: Order):
    order_dict = order.dict()
    order_dict["order_number"] = await generate_order_number()

    result = await db.orders.insert_one(order_dict)
    return {"message": "Order created successfully", "order_number": order_dict["order_number"]}

# Get all orders
@router.get("/orders/")
async def get_orders():
    orders = await db.orders.find().sort("order_date", -1).to_list(100)
    for order in orders:
        order["_id"] = str(order["_id"])
    return orders

# Get order by ID
@router.get("/orders/{order_id}")
async def get_order(order_id: str):
    from bson import ObjectId
    order = await db.orders.find_one({"_id": ObjectId(order_id)})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order["_id"] = str(order["_id"])
    return order

# Update order status
@router.put("/orders/{order_id}/status")
async def update_order_status(order_id: str, status: str):
    from bson import ObjectId
    result = await db.orders.update_one(
        {"_id": ObjectId(order_id)},
        {"$set": {"order_status": status}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Order not found or status unchanged")
    return {"message": "Order status updated"}
