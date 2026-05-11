from fastapi import APIRouter, HTTPException, Depends, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from sqlalchemy.orm import Session
from database import get_db, Order, Product
import json
import jwt
import os
from dotenv import load_dotenv
from emails import send_order_status_update

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

class OrderItem(BaseModel):
    product_id: int
    name: str
    size: str
    quantity: int
    price: float

class OrderCreate(BaseModel):
    customer_name: str
    customer_email: EmailStr
    address: str
    items: List[OrderItem]

class StatusUpdate(BaseModel):
    status: str

VALID_STATUSES = {"pending", "confirmed", "shipped", "delivered", "cancelled"}

@router.post("/", status_code=201)
def create_order(
    payload: OrderCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    if not payload.items:
        raise HTTPException(status_code=400, detail="Order must contain at least one item.")
    if payload.customer_email != current_user["email"]:
        raise HTTPException(status_code=403, detail="Order email must match your account email.")

    for item in payload.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product ID {item.product_id} not found.")
        if product.stock < item.quantity:
            raise HTTPException(status_code=400, detail=f"Insufficient stock for '{product.name}'.")

    total = sum(i.price * i.quantity for i in payload.items)
    order = Order(
        customer_name=payload.customer_name,
        customer_email=payload.customer_email,
        address=payload.address,
        items=json.dumps([i.model_dump() for i in payload.items]),
        total=total
    )
    db.add(order)

    for item in payload.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        product.stock -= item.quantity

    db.commit()
    db.refresh(order)
    return {"message": "Order placed successfully.", "order_id": order.id, "total": total}

@router.get("/", status_code=200)
def list_orders(
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    if status and status not in VALID_STATUSES:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of {VALID_STATUSES}.")
    query = db.query(Order).filter(Order.customer_email == current_user["email"])
    if status:
        query = query.filter(Order.status == status)
    orders = query.order_by(Order.created_at.desc()).all()
    result = []
    for o in orders:
        result.append({
            "id": o.id, "customer_name": o.customer_name, "customer_email": o.customer_email,
            "address": o.address, "items": json.loads(o.items), "total": o.total,
            "status": o.status, "created_at": str(o.created_at)
        })
    return result

@router.get("/{order_id}", status_code=200)
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found.")
    if order.customer_email != current_user["email"]:
        raise HTTPException(status_code=403, detail="You are not authorised to view this order.")
    return {
        "id": order.id, "customer_name": order.customer_name, "customer_email": order.customer_email,
        "address": order.address, "items": json.loads(order.items), "total": order.total,
        "status": order.status, "created_at": str(order.created_at)
    }

@router.patch("/{order_id}/status", status_code=200)
def update_order_status(
    order_id: int,
    payload: StatusUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    if payload.status not in VALID_STATUSES:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of {VALID_STATUSES}.")
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found.")
    order.status = payload.status
    db.commit()
    send_order_status_update(
        email=order.customer_email,
        name=order.customer_name,
        order_id=order_id,
        status=payload.status
    )
    return {"message": f"Order status updated to '{payload.status}'.", "order_id": order_id}
