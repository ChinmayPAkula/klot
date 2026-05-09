from fastapi import APIRouter, HTTPException, Depends, Security
from fastapi.responses import Response
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session
from database import get_db, Address
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
    label: str
    full_address: str
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None

@router.get("/", status_code=200)
def list_addresses(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    addresses = db.query(Address).filter(
        Address.user_id == current_user["user_id"]
    ).order_by(Address.created_at.desc()).all()
    return [
        {
            "id": a.id, "user_id": a.user_id, "label": a.label,
            "full_address": a.full_address, "city": a.city,
            "state": a.state, "pincode": a.pincode,
            "lat": a.lat, "lng": a.lng,
            "created_at": str(a.created_at)
        } for a in addresses
    ]

@router.post("/", status_code=201)
def add_address(
    payload: AddressPayload,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    address = Address(
        user_id=current_user["user_id"],
        label=payload.label,
        full_address=payload.full_address,
        city=payload.city,
        state=payload.state,
        pincode=payload.pincode,
        lat=payload.lat,
        lng=payload.lng
    )
    db.add(address)
    db.commit()
    db.refresh(address)
    return {"message": "Address saved.", "id": address.id}

@router.delete("/{address_id}", status_code=204)
def delete_address(
    address_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    address = db.query(Address).filter(Address.id == address_id).first()
    if not address:
        raise HTTPException(status_code=404, detail="Address not found.")
    if address.user_id != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Not your address.")
    db.delete(address)
    db.commit()
    return Response(status_code=204)
