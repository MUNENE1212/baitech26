from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from datetime import timedelta

from utils.database import db
from utils.auth import authenticate_user
from utils.security import create_access_token,hash_password
from bson.objectid import ObjectId

router = APIRouter()

class UserCreate(BaseModel):
    name: str
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

@router.post("/register/", response_model=Token)
async def register_user(user: UserCreate):
    existing_user = await db.users.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_pw = hash_password(user.password)

    new_user = {
        "name": user.name,
        "email": user.email,
        "hashed_password": hashed_pw
    }

    result = await db.users.insert_one(new_user)

    access_token = create_access_token(
        data={"sub": user.email},
        expires_delta=timedelta(minutes=30)
    )

    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/login/", response_model=Token)
async def login_user(email: str, password: str):
    user = await authenticate_user(email, password)
    if not user:
        raise HTTPException(status_code=400, detail="Invalid credentials")

    access_token = create_access_token(
        data={"sub": user['email']},
        expires_delta=timedelta(minutes=30)
    )

    return {"access_token": access_token, "token_type": "bearer"}
