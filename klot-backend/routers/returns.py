from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from typing import Optional, Literal
from database import get_db
import sqlite3

router = APIRouter()

class ReturnRequest(BaseModel):
    order_id: int
    email: EmailStr
    reason: str
    type: Literal["return", "exchange"]
    new_size: Optional[str] = None  # required if exchange

class StatusUpdate(BaseModel):
    status: str  # pending | approved | rejected | completed

VALID_STATUSES = {"pending", "approved", "rejected", "completed"}

@router.post("/request", status_code=201)
def request_return(payload: ReturnRequest, db: sqlite3.Connection = Depends(get_db)):
    # Validate order exists and belongs to this email
    order = db.execute(
        "SELECT id, customer_email, status FROM orders WHERE id=?",
        (payload.order_id,)
    ).fetchone()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found.")
    if order["customer_email"] != payload.email:
        raise HTTPException(status_code=403, detail="Email does not match order.")
    if order["status"] not in ("delivered", "confirmed", "shipped"):
        raise HTTPException(status_code=400, detail=f"Cannot request return for an order with status '{order['status']}'.")

    # Exchange requires new size
    if payload.type == "exchange" and not payload.new_size:
        raise HTTPException(status_code=400, detail="new_size is required for exchanges.")

    # Check no existing open request for same order
    existing = db.execute(
        "SELECT id FROM returns WHERE order_id=? AND status NOT IN ('rejected','completed')",
        (payload.order_id,)
    ).fetchone()
    if existing:
        raise HTTPException(status_code=409, detail="An active return/exchange request already exists for this order.")

    cur = db.execute(
        "INSERT INTO returns (order_id, email, reason, type, new_size) VALUES (?,?,?,?,?)",
        (payload.order_id, payload.email, payload.reason, payload.type, payload.new_size)
    )
    db.commit()
    return {
        "message": f"{payload.type.capitalize()} request submitted. We'll review it within 2 business days.",
        "request_id": cur.lastrowid
    }

@router.get("/")
def list_requests(
    status: Optional[str] = None,
    type: Optional[str] = None,
    db: sqlite3.Connection = Depends(get_db)
):
    query = "SELECT * FROM returns WHERE 1=1"
    params = []
    if status:
        query += " AND status=?"
        params.append(status)
    if type:
        query += " AND type=?"
        params.append(type)
    query += " ORDER BY created_at DESC"
    rows = db.execute(query, params).fetchall()
    return [dict(r) for r in rows]

@router.get("/{request_id}")
def get_request(request_id: int, db: sqlite3.Connection = Depends(get_db)):
    row = db.execute("SELECT * FROM returns WHERE id=?", (request_id,)).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Return request not found.")
    return dict(row)

@router.patch("/{request_id}/status")
def update_status(request_id: int, payload: StatusUpdate, db: sqlite3.Connection = Depends(get_db)):
    if payload.status not in VALID_STATUSES:
        raise HTTPException(status_code=400, detail=f"Status must be one of {VALID_STATUSES}")
    row = db.execute("SELECT id FROM returns WHERE id=?", (request_id,)).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Return request not found.")
    db.execute("UPDATE returns SET status=? WHERE id=?", (payload.status, request_id))
    db.commit()
    return {"message": f"Request status updated to '{payload.status}'."}
