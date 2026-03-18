from fastapi import APIRouter, HTTPException, Depends, Security, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from typing import Optional
from database import get_db
from slowapi import Limiter
from slowapi.util import get_remote_address
import sqlite3
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

def get_or_create_user(email: str, name: str, avatar: Optional[str] = None, google_id: Optional[str] = None) -> dict:
    from database import DB_PATH
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        row = conn.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
        if row:
            return dict(row)
        cur = conn.execute(
            "INSERT INTO users (email, name, avatar, google_id) VALUES (?, ?, ?, ?)",
            (email, name, avatar, google_id)
        )
        conn.commit()
        return {"id": cur.lastrowid, "email": email, "name": name, "avatar": avatar}
    finally:
        conn.close()

class RegisterPayload(BaseModel):
    name: str
    email: EmailStr
    password: str

class LoginPayload(BaseModel):
    email: EmailStr
    password: str

class GooglePayload(BaseModel):
    credential: str

# 5 register attempts per minute per IP
@router.post("/register", status_code=201)
@limiter.limit("5/minute")
def register(request: Request, payload: RegisterPayload, db: sqlite3.Connection = Depends(get_db)):
    existing = db.execute("SELECT id FROM users WHERE email = ?", (payload.email,)).fetchone()
    if existing:
        raise HTTPException(status_code=409, detail="An account with this email already exists.")
    hashed = hash_password(payload.password)
    cur = db.execute(
        "INSERT INTO users (email, name, password_hash) VALUES (?, ?, ?)",
        (payload.email, payload.name, hashed)
    )
    db.commit()
    user_id = cur.lastrowid
    token = create_jwt(user_id, payload.email, payload.name)
    return {
        "token": token,
        "user": {"id": user_id, "email": payload.email, "name": payload.name, "avatar": None}
    }

# 10 login attempts per minute per IP
@router.post("/login", status_code=200)
@limiter.limit("10/minute")
def login(request: Request, payload: LoginPayload, db: sqlite3.Connection = Depends(get_db)):
    row = db.execute("SELECT * FROM users WHERE email = ?", (payload.email,)).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="No account found with this email.")
    user = dict(row)
    if not user.get("password_hash"):
        raise HTTPException(status_code=401, detail="This account uses Google login. Please sign in with Google.")
    if user["password_hash"] != hash_password(payload.password):
        raise HTTPException(status_code=401, detail="Incorrect password.")
    token = create_jwt(user["id"], user["email"], user["name"])
    return {
        "token": token,
        "user": {"id": user["id"], "email": user["email"], "name": user["name"], "avatar": user.get("avatar")}
    }

# 10 Google login attempts per minute per IP
@router.post("/google", status_code=200)
@limiter.limit("10/minute")
async def google_login(request: Request, payload: GooglePayload):
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
    user = get_or_create_user(email, name, avatar, google_id)
    token = create_jwt(user["id"], user["email"], user["name"])
    return {
        "token": token,
        "user": {"id": user["id"], "email": user["email"], "name": user["name"], "avatar": user.get("avatar")}
    }

@router.get("/me", status_code=200)
def get_me(
    credentials: HTTPAuthorizationCredentials = Security(security),
    db: sqlite3.Connection = Depends(get_db)
):
    payload = verify_jwt(credentials.credentials)
    row = db.execute("SELECT id, email, name, avatar FROM users WHERE id = ?", (payload["user_id"],)).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="User not found.")
    return dict(row)
