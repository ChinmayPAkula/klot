from fastapi import APIRouter, HTTPException, Depends, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import List
from sqlalchemy.orm import Session
from database import get_db, Order, Product
import razorpay
import json
import os
import jwt
from dotenv import load_dotenv
from emails import send_order_confirmation

load_dotenv()

router = APIRouter()
security = HTTPBearer()

RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET")
JWT_SECRET = os.getenv("JWT_SECRET", "fallback-secret-change-this")
JWT_ALGORITHM = "HS256"

client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))

def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security)) -> dict:
    try:
        return jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Session expired.")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token.")

class CartItem(BaseModel):
    product_id: int
    name: str
    size: str
    quantity: int
    price: float

class CreateOrderPayload(BaseModel):
    items: List[CartItem]
    address: str

class VerifyPaymentPayload(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    address: str
    items: List[CartItem]

@router.post("/create-order", status_code=201)
def create_order(
    payload: CreateOrderPayload,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    if not payload.items:
        raise HTTPException(status_code=400, detail="Cart is empty.")

    for item in payload.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product '{item.name}' not found.")
        if product.stock < item.quantity:
            raise HTTPException(status_code=400, detail=f"Insufficient stock for '{product.name}'.")

    total = sum(i.price * i.quantity for i in payload.items)
    amount_paise = int(total * 100)

    try:
        razorpay_order = client.order.create({
            "amount": amount_paise,
            "currency": "INR",
            "payment_capture": 1
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not create payment order: {str(e)}")

    return {
        "razorpay_order_id": razorpay_order["id"],
        "amount": amount_paise,
        "currency": "INR",
        "key_id": RAZORPAY_KEY_ID
    }

@router.post("/verify", status_code=201)
def verify_payment(
    payload: VerifyPaymentPayload,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    try:
        client.utility.verify_payment_signature({
            "razorpay_order_id": payload.razorpay_order_id,
            "razorpay_payment_id": payload.razorpay_payment_id,
            "razorpay_signature": payload.razorpay_signature
        })
    except Exception:
        raise HTTPException(status_code=400, detail="Payment verification failed. Invalid signature.")

    total = sum(i.price * i.quantity for i in payload.items)
    order = Order(
        customer_name=current_user["name"],
        customer_email=current_user["email"],
        address=payload.address,
        items=json.dumps([i.model_dump() for i in payload.items]),
        total=total,
        status="confirmed"
    )
    db.add(order)

    for item in payload.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if product:
            product.stock -= item.quantity

    db.commit()
    db.refresh(order)

    send_order_confirmation(
        email=current_user["email"],
        name=current_user["name"],
        order_id=order.id,
        total=total,
        items=[i.model_dump() for i in payload.items],
        address=payload.address
    )

    return {
        "message": "Payment successful. Order confirmed.",
        "order_id": order.id,
        "payment_id": payload.razorpay_payment_id,
        "total": total
    }
