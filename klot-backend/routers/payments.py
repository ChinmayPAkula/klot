from fastapi import APIRouter, HTTPException, Depends, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import List
from database import get_db
import sqlite3
import razorpay
import json
import os
import jwt
from dotenv import load_dotenv

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

# Step 1 — Create Razorpay order
@router.post("/create-order", status_code=201)
def create_order(
    payload: CreateOrderPayload,
    db: sqlite3.Connection = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    if not payload.items:
        raise HTTPException(status_code=400, detail="Cart is empty.")

    # Validate stock
    for item in payload.items:
        row = db.execute("SELECT stock, name FROM products WHERE id=?", (item.product_id,)).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail=f"Product '{item.name}' not found.")
        if row["stock"] < item.quantity:
            raise HTTPException(status_code=400, detail=f"Insufficient stock for '{row['name']}'.")

    total = sum(i.price * i.quantity for i in payload.items)
    # Razorpay uses paise (1 INR = 100 paise) — using GBP as base, multiply by 100
    amount_paise = int(total * 100)  # Prices already in INR, convert to paise

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

# Step 2 — Verify payment and save order
@router.post("/verify", status_code=201)
def verify_payment(
    payload: VerifyPaymentPayload,
    db: sqlite3.Connection = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    # Verify signature
    try:
        client.utility.verify_payment_signature({
            "razorpay_order_id": payload.razorpay_order_id,
            "razorpay_payment_id": payload.razorpay_payment_id,
            "razorpay_signature": payload.razorpay_signature
        })
    except Exception:
        raise HTTPException(status_code=400, detail="Payment verification failed. Invalid signature.")

    # Save order to DB
    total = sum(i.price * i.quantity for i in payload.items)
    items_json = json.dumps([i.model_dump() for i in payload.items])

    cur = db.execute(
        "INSERT INTO orders (customer_name, customer_email, address, items, total, status) VALUES (?,?,?,?,?,?)",
        (current_user["name"], current_user["email"], payload.address, items_json, total, "confirmed")
    )
    order_id = cur.lastrowid

    # Deduct stock
    for item in payload.items:
        db.execute("UPDATE products SET stock = stock - ? WHERE id=?", (item.quantity, item.product_id))

    db.commit()

    return {
        "message": "Payment successful. Order confirmed.",
        "order_id": order_id,
        "payment_id": payload.razorpay_payment_id,
        "total": total
    }
