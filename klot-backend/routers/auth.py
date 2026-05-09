from fastapi import APIRouter, HTTPException, Depends, Security, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from typing import Optional
from sqlalchemy.orm import Session
from database import get_db, User
from slowapi import Limiter
from slowapi.util import get_remote_address
import hashlib
import jwt
import datetime
import httpx
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()
security = HTTPBearer()
limiter = Limiter(key_func=get_remote_address)

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
JWT_SECRET = os.getenv("JWT_SECRET", "fallback-secret-change-this")
JWT_ALGORITHM = "HS256"
JWT_EXPIRY_HOURS = 72

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def create_jwt(user_id: int, email: str, name: str) -> str:
    payload = {
        "user_id": user_id,
        "email": email,
        "name": name,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=JWT_EXPIRY_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_jwt(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Session expired. Please log in again.")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token.")

class RegisterPayload(BaseModel):
    name: str
    email: EmailStr
    password: str

class LoginPayload(BaseModel):
    email: EmailStr
    password: str

class GooglePayload(BaseModel):
    credential: str

@router.post("/register", status_code=201)
@limiter.limit("5/minute")
def register(request: Request, payload: RegisterPayload, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=409, detail="An account with this email already exists.")
    user = User(
        email=payload.email,
        name=payload.name,
        password_hash=hash_password(payload.password)
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_jwt(user.id, user.email, user.name)
    return {
        "token": token,
        "user": {"id": user.id, "email": user.email, "name": user.name, "avatar": None}
    }

@router.post("/login", status_code=200)
@limiter.limit("10/minute")
def login(request: Request, payload: LoginPayload, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="No account found with this email.")
    if not user.password_hash:
        raise HTTPException(status_code=401, detail="This account uses Google login. Please sign in with Google.")
    if user.password_hash != hash_password(payload.password):
        raise HTTPException(status_code=401, detail="Incorrect password.")
    token = create_jwt(user.id, user.email, user.name)
    return {
        "token": token,
        "user": {"id": user.id, "email": user.email, "name": user.name, "avatar": user.avatar}
    }

@router.post("/google", status_code=200)
@limiter.limit("10/minute")
async def google_login(request: Request, payload: GooglePayload, db: Session = Depends(get_db)):
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            "https://oauth2.googleapis.com/tokeninfo",
            params={"id_token": payload.credential}
        )
    if resp.status_code != 200:
        raise HTTPException(status_code=401, detail="Could not verify Google token.")
    info = resp.json()
    if info.get("aud") != GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=401, detail="Token audience mismatch.")
    email = info.get("email")
    name = info.get("name", email.split("@")[0])
    avatar = info.get("picture")
    google_id = info.get("sub")
    if not email:
        raise HTTPException(status_code=401, detail="Could not retrieve email from Google.")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(email=email, name=name, avatar=avatar, google_id=google_id)
        db.add(user)
        db.commit()
        db.refresh(user)

    token = create_jwt(user.id, user.email, user.name)
    return {
        "token": token,
        "user": {"id": user.id, "email": user.email, "name": user.name, "avatar": user.avatar}
    }

@router.get("/me", status_code=200)
def get_me(
    credentials: HTTPAuthorizationCredentials = Security(security),
    db: Session = Depends(get_db)
):
    payload = verify_jwt(credentials.credentials)
    user = db.query(User).filter(User.id == payload["user_id"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    return {"id": user.id, "email": user.email, "name": user.name, "avatar": user.avatar}
