from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime 
from enum import Enum

class UserRole(Enum):
    admin = "admin"
    customer = "customer"
    technician = "technician"

# User Model
class User(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: UserRole

class UserLogin(BaseModel):
    email: EmailStr
    password: str

# Product Model
class Product(BaseModel):
    product_id: str = Field(..., example="AUDIO123")  # User-defined unique ID
    name: str = Field(..., example="Wireless Headphones")
    description: Optional[str] = Field(None, example="Noise-canceling Bluetooth headphones")
    price: float = Field(..., example=29.99)
    stock: int = Field(..., example=50)
    category: Optional[str] = Field(None, example="Audio Accessories")
    features: Optional[List[str]] = Field(default=[], example=["Waterproof", "10h battery", "Bluetooth 5.0"])
    image_url: Optional[str] = Field(None, example="https://example.com/image.jpg")

class ServiceRequest(BaseModel):
    service_id: Optional[str] = None  # Auto-generated field like "SRC-001-13-06-25"
    customer_name: str = Field(..., example="John Doe")
    contact: str = Field(..., example="+254799954672")
    service_type: str = Field(..., example="TV Mounting")  # Includes installations & repairs
    item: Optional[str] = Field(None, example="LG 55-inch OLED TV")  # Optional field for the item
    description: str = Field(..., example="Wall mounting a 55-inch Samsung TV")
    assigned_technician: Optional[str] = None  # To be set by admin later
    scheduled_date: Optional[datetime] = Field(None, example="2025-02-10T15:30:00")
    status: str = Field(default="Pending", example="Pending")
    payment_status: str = Field(default="Unpaid", example="Unpaid")
    request_date: datetime = Field(default_factory=datetime.utcnow)
    completion_date: Optional[datetime] = None

class Technician(BaseModel):
    name: str = Field(..., example="Kevin Otieno")
    specializations: List[str] = Field(..., example=["TV Mounting", "Laptop Repair"])
    jobs_completed: int = Field(default=0)
    average_rating: float = Field(default=0.0)  # New field for ratings
    total_ratings: int = Field(default=0)  # To calculate average

class TechnicianRating(BaseModel):
    technician_id: str
    rating: int = Field(..., ge=1, le=5)  # 1-5 star rating
    feedback: str = Field(..., example="Great job, very professional!")

class OrderItem(BaseModel):
    product_id: str = Field(..., example="PROD-001")
    name: str = Field(..., example="Bluetooth Headphones")
    quantity: int = Field(..., gt=0, example=2)
    price: float = Field(..., example=25.00)

class Order(BaseModel):
    order_number: Optional [str] = None
    customer_name: str = Field(..., example="Alice Njeri")
    customer_contact: str = Field(..., example="+254700123456")
    items: List[OrderItem]
    total_price: float = Field(..., example=50.00)
    payment_status: str = Field(default="Pending", example="Paid")  # Pending, Paid
    order_status: str = Field(default="Processing", example="Delivered")  # Processing, Shipped, Delivered, Cancelled
    service_note: Optional[str] = Field(None, example="Please call before delivery")
    order_date: datetime = Field(default_factory=datetime.utcnow)