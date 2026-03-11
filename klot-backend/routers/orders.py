from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from database import get_db
import sqlite3
import json

router = APIRouter()

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
    status: str  # pending | confirmed | shipped | delivered | cancelled

VALID_STATUSES = {"pending", "confirmed", "shipped", "delivered", "cancelled"}

@router.post("/", status_code=201)
def create_order(payload: OrderCreate, db: sqlite3.Connection = Depends(get_db)):
    # Validate products exist and have stock
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

    # Deduct stock
    for item in payload.items:
        db.execute(
            "UPDATE products SET stock = stock - ? WHERE id=?",
            (item.quantity, item.product_id)
        )

    db.commit()
    return {"message": "Order placed successfully.", "order_id": order_id, "total": total}

@router.get("/")
def list_orders(
    status: Optional[str] = None,
    email: Optional[str] = None,
    db: sqlite3.Connection = Depends(get_db)
):
    query = "SELECT * FROM orders WHERE 1=1"
    params = []
    if status:
        query += " AND status=?"
        params.append(status)
    if email:
        query += " AND customer_email=?"
        params.append(email)
    query += " ORDER BY created_at DESC"
    rows = db.execute(query, params).fetchall()
    result = []
    for r in rows:
        o = dict(r)
        o["items"] = json.loads(o["items"])
        result.append(o)
    return result

@router.get("/{order_id}")
def get_order(order_id: int, db: sqlite3.Connection = Depends(get_db)):
    row = db.execute("SELECT * FROM orders WHERE id=?", (order_id,)).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Order not found.")
    o = dict(row)
    o["items"] = json.loads(o["items"])
    return o

@router.patch("/{order_id}/status")
def update_order_status(order_id: int, payload: StatusUpdate, db: sqlite3.Connection = Depends(get_db)):
    if payload.status not in VALID_STATUSES:
        raise HTTPException(status_code=400, detail=f"Status must be one of {VALID_STATUSES}")
    row = db.execute("SELECT id FROM orders WHERE id=?", (order_id,)).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Order not found.")
    db.execute("UPDATE orders SET status=? WHERE id=?", (payload.status, order_id))
    db.commit()
    return {"message": f"Order status updated to '{payload.status}'."}
