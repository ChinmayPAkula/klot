from fastapi import APIRouter, HTTPException, Depends, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional
from database import get_db
import sqlite3
import jwt
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()
security = HTTPBearer()

JWT_SECRET = os.getenv("JWT_SECRET", "fallback-secret-change-this")
JWT_ALGORITHM = "HS256"

def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security)) -> dict:
    try:
        return jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Session expired.")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token.")

class AddressPayload(BaseModel):
    label: str        # Home, Office, Mom's place etc.
    full_address: str
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None

@router.get("/", status_code=200)
def list_addresses(
    db: sqlite3.Connection = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    rows = db.execute(
        "SELECT * FROM addresses WHERE user_id=? ORDER BY created_at DESC",
        (current_user["user_id"],)
    ).fetchall()
    return [dict(r) for r in rows]

@router.post("/", status_code=201)
def add_address(
    payload: AddressPayload,
    db: sqlite3.Connection = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    cur = db.execute(
        "INSERT INTO addresses (user_id, label, full_address, city, state, pincode, lat, lng) VALUES (?,?,?,?,?,?,?,?)",
        (current_user["user_id"], payload.label, payload.full_address, payload.city, payload.state, payload.pincode, payload.lat, payload.lng)
    )
    db.commit()
    return {"message": "Address saved.", "id": cur.lastrowid}

@router.delete("/{address_id}", status_code=204)
def delete_address(
    address_id: int,
    db: sqlite3.Connection = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    row = db.execute("SELECT user_id FROM addresses WHERE id=?", (address_id,)).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Address not found.")
    if row["user_id"] != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Not your address.")
    db.execute("DELETE FROM addresses WHERE id=?", (address_id,))
    db.commit()
    from fastapi.responses import Response
    return Response(status_code=204)
