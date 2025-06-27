from fastapi import FastAPI, HTTPException, Depends, APIRouter, Request
from fastapi.responses import RedirectResponse
from utils.database import db
from bson import ObjectId
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from utils.auth import verify_password, get_current_user,require_role
from utils.security import hash_password, create_access_token
from routes.product_routes import router as product_router
from routes.services_routes import router as service_router
from routes.order_routes import router as order_router
from routes.technician_routes import router as technician_router
from routes.auth_routes import router as auth_router
from datetime import datetime
from utils.models import User, UserLogin

app = FastAPI()

templates = Jinja2Templates(directory="templates")
app.mount("/static", StaticFiles(directory="static"), name="static")

app.include_router(product_router)
app.include_router(service_router)
app.include_router(order_router)
app.include_router(technician_router)
app.include_router(auth_router)

from random import sample

@app.get("/")
async def home(request: Request):
    # Fetch all active services
    all_services = await db.services_offered.find({"is_active": True}).to_list(50)
    
    # Randomly pick 3 (or fewer if not enough)
    featured_services = sample(all_services, min(len(all_services), 4))

    featured_products = await db.products.find({"featured": True}).to_list(6)
    reviews = await db.reviews.find().sort("date", -1).to_list(5)

    return templates.TemplateResponse("index.html", {
        "request": request,
        "featured_products": featured_products,
        "featured_services": featured_services,
        "reviews": reviews,
        "now": datetime.utcnow()
    })
# Create User
@app.post("/users/")
async def create_user(user: User, current_user=Depends(require_role("admin"))):
    user_dict = user.dict()
    result = await db.users.insert_one(user_dict)
    return {"id": str(result.inserted_id), **user_dict}

# Get Users
@app.get("/users/")
async def get_users(user=Depends(require_role("admin"))):
    users = await db.users.find().to_list(100)
    return [{"id": str(user["_id"]), **user} for user in users]

# Customer signup (merged)
@app.post("/register/")
async def register(user: User):
    existing_user = await db.users.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    user_dict = user.dict()
    user_dict["password"] = hash_password(user.password)

    if user_dict.get("role") != "customer":
        raise HTTPException(status_code=403, detail="Only customers can register directly")

    result = await db.users.insert_one(user_dict)
    return {"id": str(result.inserted_id), "message": "User registered successfully"}

@app.post("/login/")
async def login(user: UserLogin):
    user_db = await db.users.find_one({"email": user.email})
    if not user_db:
        raise HTTPException(status_code=400, detail="Invalid email or password")

    if not verify_password(user.password, user_db["password"]):
        raise HTTPException(status_code=400, detail="Invalid email or password")

    token = create_access_token({
        "user_id": str(user_db["_id"]),
        "email": user_db["email"],
        "role": user_db["role"]
})
    return {"access_token": token, "token_type": "bearer"}

@app.get("/protected/")
async def protected_route(user=Depends(get_current_user)):
    return {"message": "You have access!", "user": user}

@app.get("/catalogue")
async def view_catalogue(request: Request, search: str = "", category: str = ""):
    query = {}
    if search:
        query["name"] = {"$regex": search, "$options": "i"}
    if category:
        query["category"] = category

    products = await db.products.find(query).to_list(100)

    # 📌 Fetch distinct categories from MongoDB
    categories = await db.products.distinct("category")

    return templates.TemplateResponse("catalogue.html", {
        "request": request,
        "products": products,
        "categories": categories,
        "now": datetime.utcnow()
    })


@app.get("/services")
async def services_page(request: Request):
    categories = await db.services_offered.find({"is_active": True}).to_list(20)
    return templates.TemplateResponse("services.html", {
        "request": request,
        "categories": categories,
        "now": datetime.utcnow()
    })

@app.get("/place-order")
async def place_order_page(request: Request):
    return templates.TemplateResponse("place_order.html", {
        "request": request,
        "now": datetime.utcnow()
    })

@app.get("/checkout")
async def checkout_page(request: Request):
    return templates.TemplateResponse("checkout.html", {
        "request": request,
        "now": datetime.utcnow()
    })

@app.get("/services/request")
async def service_request_page(request: Request):
    categories = await db.services_offered.find({"is_active": True}).to_list(20)
    return templates.TemplateResponse("request_service.html", {
        "request": request,
        "categories": categories,
        "now": datetime.utcnow()
    })

@app.get("/apply_technician")
async def show_technician_form(request: Request):
    return templates.TemplateResponse("apply_technician.html", {
        "request": request,
        "now": datetime.utcnow()
    })

@app.get("/login")
async def login_page(request: Request):
    return templates.TemplateResponse("login.html", {
        "request": request,
        "now": datetime.utcnow()
    })

@app.get("/signup")
async def signup_page(request: Request):
    return templates.TemplateResponse("signup.html", {"request": request, "now": datetime.utcnow()})

@app.get("/admin/dashboard")
async def admin_dashboard(request: Request,user=Depends(require_role("admin"))):
    total_users = await db.users.count_documents({})
    total_requests = await db.services.count_documents({})
    total_applications = await db.technician_applications.count_documents({})
    total_orders = await db.orders.count_documents({})

    service_requests = await db.services.find().sort("request_date", -1).to_list(50)
    technicians = await db.technicians.find().to_list(20)
    leaderboard = await db.technicians.find().sort("completed_jobs", -1).to_list(10)
    orders = await db.orders.find().sort("order_date", -1).to_list(50)

    # convert ObjectId for frontend compatibility
    for s in service_requests:
        s["_id"] = str(s["_id"])
    for t in technicians:
        t["_id"] = str(t["_id"])
    for o in orders:
        o["_id"] = str(o["_id"])

    return templates.TemplateResponse("admin_dashboard.html", {
        "request": request,
        "now": datetime.utcnow(),
        "stats": {
            "total_users": total_users,
            "total_requests": total_requests,
            "total_applications": total_applications,
            "total_orders": total_orders,
        },
        "service_requests": service_requests,
        "technicians": technicians,
        "leaderboard": leaderboard,
        "orders": orders
    })
@app.get("/technician/dashboard")
async def technician_dashboard(request: Request, user=Depends(require_role("technician"))):
    tasks = await db.services.find({
        "assigned_technician": user["email"]
    }).to_list(50)

    for task in tasks:
        task["_id"] = str(task["_id"])

    return templates.TemplateResponse("technician_dashboard.html", {
        "request": request,
        "tasks": tasks,
        "now": datetime.utcnow()
    })
@app.get("/about")
async def about_page(request: Request):
    return templates.TemplateResponse("about.html", {
        "request": request,
        "now": datetime.utcnow()
    })
