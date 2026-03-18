from fastapi import APIRouter, HTTPException, Depends, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from database import get_db
import sqlite3
import json
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
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
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

# Must be logged in to place an order
@router.post("/", status_code=201)
def create_order(
    payload: OrderCreate,
    db: sqlite3.Connection = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    if not payload.items:
        raise HTTPException(status_code=400, detail="Order must contain at least one item.")

    # Force order email to match logged in user
    if payload.customer_email != current_user["email"]:
        raise HTTPException(status_code=403, detail="Order email must match your account email.")

    for item in payload.items:
        row = db.execute("SELECT stock, name FROM products WHERE id=?", (item.product_id,)).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail=f"Product ID {item.product_id} not found.")
        if row["stock"] < item.quantity:
            raise HTTPException(status_code=400, detail=f"Insufficient stock for '{row['name']}'.")

    total = sum(i.price * i.quantity for i in payload.items)
    items_json = json.dumps([i.model_dump() for i in payload.items])

    cur = db.execute(
        "INSERT INTO orders (customer_name, customer_email, address, items, total) VALUES (?,?,?,?,?)",
        (payload.customer_name, payload.customer_email, payload.address, items_json, total)
    )
    order_id = cur.lastrowid

    for item in payload.items:
        db.execute("UPDATE products SET stock = stock - ? WHERE id=?", (item.quantity, item.product_id))

    db.commit()
    return {"message": "Order placed successfully.", "order_id": order_id, "total": total}

# Only returns YOUR orders
@router.get("/", status_code=200)
def list_orders(
    status: Optional[str] = None,
    db: sqlite3.Connection = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    if status and status not in VALID_STATUSES:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of {VALID_STATUSES}.")

    query = "SELECT * FROM orders WHERE customer_email = ?"
    params = [current_user["email"]]

    if status:
        query += " AND status=?"
        params.append(status)

    query += " ORDER BY created_at DESC"
    rows = db.execute(query, params).fetchall()
    result = []
    for r in rows:
        o = dict(r)
        o["items"] = json.loads(o["items"])
        result.append(o)
    return result

# Only YOUR order — 403 if someone else's
@router.get("/{order_id}", status_code=200)
def get_order(
    order_id: int,
    db: sqlite3.Connection = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    row = db.execute("SELECT * FROM orders WHERE id=?", (order_id,)).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Order not found.")

    order = dict(row)
    if order["customer_email"] != current_user["email"]:
        raise HTTPException(status_code=403, detail="You are not authorised to view this order.")

    order["items"] = json.loads(order["items"])
    return order

# Admin only — status update (no user check, protected by token only)
@router.patch("/{order_id}/status", status_code=200)
def update_order_status(
    order_id: int,
    payload: StatusUpdate,
    db: sqlite3.Connection = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    if payload.status not in VALID_STATUSES:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of {VALID_STATUSES}.")
    row = db.execute("SELECT id FROM orders WHERE id=?", (order_id,)).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Order not found.")
    db.execute("UPDATE orders SET status=? WHERE id=?", (payload.status, order_id))
    db.commit()
    return {"message": f"Order status updated to '{payload.status}'.", "order_id": order_id}
