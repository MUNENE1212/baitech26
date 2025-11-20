from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from utils.database import db
from utils.auth import verify_password, get_current_user, require_role
from utils.security import hash_password, create_access_token
from routes.product_routes import router as product_router
from routes.services_routes import router as service_router
from routes.order_routes import router as order_router
from routes.technician_routes import router as technician_router
from routes.auth_routes import router as auth_router
from routes.api_routes import router as api_router
from routes.admin_routes import router as admin_router
from routes.settings_routes import router as settings_router
from utils.models import User, UserLogin

app = FastAPI(
    title="EmenTech API",
    version="2.0.0",
    description="Modern e-commerce and tech services API for EmenTech platform"
)

# Add CORS middleware for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Next.js development server
        "http://localhost:3001",  # Next.js on alternate port
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://baitech.co.ke",  # Production domain
        "https://baitech.co.ke",  # Production domain with SSL
        "http://www.baitech.co.ke",  # www subdomain
        "https://www.baitech.co.ke",  # www subdomain with SSL
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(api_router)  # API routes for Next.js frontend
app.include_router(admin_router)  # Admin routes
app.include_router(settings_router)  # Settings routes
app.include_router(product_router)
app.include_router(service_router)
app.include_router(order_router)
app.include_router(technician_router)
app.include_router(auth_router)

@app.get("/")
async def root():
    """
    Root endpoint - redirects to API documentation
    Frontend is served separately via Next.js on port 3001
    """
    return {
        "message": "Welcome to EmenTech API",
        "version": "2.0.0",
        "frontend_url": "http://localhost:3001",
        "api_docs": "/docs",
        "api_redoc": "/redoc"
    }
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
    user_dict["hashed_password"] = hash_password(user.password)
    # Remove the plain password field
    user_dict.pop("password", None)

    if user_dict.get("role") != "customer":
        raise HTTPException(status_code=403, detail="Only customers can register directly")

    result = await db.users.insert_one(user_dict)
    return {"id": str(result.inserted_id), "message": "User registered successfully"}

@app.post("/login/")
async def login(user: UserLogin):
    user_db = await db.users.find_one({"email": user.email})
    if not user_db:
        raise HTTPException(status_code=400, detail="Invalid email or password")

    if not verify_password(user.password, user_db.get("hashed_password", "")):
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

# All frontend routes are now handled by Next.js
# API endpoints are available at /api/v1/*
# See routes/api_routes.py for API endpoints
