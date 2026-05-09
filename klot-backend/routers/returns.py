from fastapi import APIRouter, HTTPException, Depends, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional, Literal
from sqlalchemy.orm import Session
from database import get_db, Return, Order
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
        raise HTTPException(status_code=401, detail="Session expired. Please log in again.")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token.")

class ReturnRequest(BaseModel):
    order_id: int
    reason: str
    type: Literal["return", "exchange"]
    new_size: Optional[str] = None

class StatusUpdate(BaseModel):
    status: str

VALID_STATUSES = {"pending", "approved", "rejected", "completed"}

@router.post("/request", status_code=201)
def request_return(
    payload: ReturnRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    order = db.query(Order).filter(Order.id == payload.order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found.")
    if order.customer_email != current_user["email"]:
        raise HTTPException(status_code=403, detail="You are not authorised to request a return for this order.")
    if order.status not in ("delivered", "confirmed", "shipped"):
        raise HTTPException(status_code=400, detail=f"Cannot request return for order with status '{order.status}'.")
    if payload.type == "exchange" and not payload.new_size:
        raise HTTPException(status_code=400, detail="new_size is required for exchanges.")

    existing = db.query(Return).filter(
        Return.order_id == payload.order_id,
        Return.status.notin_(["rejected", "completed"])
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="An active return/exchange request already exists for this order.")

    ret = Return(
        order_id=payload.order_id,
        email=current_user["email"],
        reason=payload.reason,
        type=payload.type,
        new_size=payload.new_size
    )
    db.add(ret)
    db.commit()
    db.refresh(ret)
    return {"message": f"{payload.type.capitalize()} request submitted.", "request_id": ret.id}

@router.get("/", status_code=200)
def list_requests(
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    if status and status not in VALID_STATUSES:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of {VALID_STATUSES}.")
    query = db.query(Return).filter(Return.email == current_user["email"])
    if status:
        query = query.filter(Return.status == status)
    returns = query.order_by(Return.created_at.desc()).all()
    return [
        {"id": r.id, "order_id": r.order_id, "email": r.email, "reason": r.reason,
         "type": r.type, "new_size": r.new_size, "status": r.status, "created_at": str(r.created_at)}
        for r in returns
    ]

@router.get("/{request_id}", status_code=200)
def get_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    ret = db.query(Return).filter(Return.id == request_id).first()
    if not ret:
        raise HTTPException(status_code=404, detail="Return request not found.")
    if ret.email != current_user["email"]:
        raise HTTPException(status_code=403, detail="You are not authorised to view this return request.")
    return {"id": ret.id, "order_id": ret.order_id, "email": ret.email, "reason": ret.reason,
            "type": ret.type, "new_size": ret.new_size, "status": ret.status, "created_at": str(ret.created_at)}

@router.patch("/{request_id}/status", status_code=200)
def update_status(
    request_id: int,
    payload: StatusUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    if payload.status not in VALID_STATUSES:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of {VALID_STATUSES}.")
    ret = db.query(Return).filter(Return.id == request_id).first()
    if not ret:
        raise HTTPException(status_code=404, detail="Return request not found.")
    if ret.email != current_user["email"]:
        raise HTTPException(status_code=403, detail="You are not authorised to update this return request.")
    ret.status = payload.status
    db.commit()
    return {"message": f"Request status updated to '{payload.status}'.", "request_id": request_id}
