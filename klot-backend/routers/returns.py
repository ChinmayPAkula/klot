from fastapi import APIRouter, HTTPException, Depends, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from typing import Optional, Literal
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
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
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

# Must be logged in to request a return
@router.post("/request", status_code=201)
def request_return(
    payload: ReturnRequest,
    db: sqlite3.Connection = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    order = db.execute(
        "SELECT id, customer_email, status FROM orders WHERE id=?",
        (payload.order_id,)
    ).fetchone()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found.")

    # Only the owner can request a return
    if order["customer_email"] != current_user["email"]:
        raise HTTPException(status_code=403, detail="You are not authorised to request a return for this order.")

    if order["status"] not in ("delivered", "confirmed", "shipped"):
        raise HTTPException(status_code=400, detail=f"Cannot request return for order with status '{order['status']}'.")

    if payload.type == "exchange" and not payload.new_size:
        raise HTTPException(status_code=400, detail="new_size is required for exchanges.")

    existing = db.execute(
        "SELECT id FROM returns WHERE order_id=? AND status NOT IN ('rejected','completed')",
        (payload.order_id,)
    ).fetchone()
    if existing:
        raise HTTPException(status_code=409, detail="An active return/exchange request already exists for this order.")

    cur = db.execute(
        "INSERT INTO returns (order_id, email, reason, type, new_size) VALUES (?,?,?,?,?)",
        (payload.order_id, current_user["email"], payload.reason, payload.type, payload.new_size)
    )
    db.commit()
    return {
        "message": f"{payload.type.capitalize()} request submitted.",
        "request_id": cur.lastrowid
    }

# Only returns YOUR return requests
@router.get("/", status_code=200)
def list_requests(
    status: Optional[str] = None,
    db: sqlite3.Connection = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    if status and status not in VALID_STATUSES:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of {VALID_STATUSES}.")

    query = "SELECT * FROM returns WHERE email = ?"
    params = [current_user["email"]]

    if status:
        query += " AND status=?"
        params.append(status)

    query += " ORDER BY created_at DESC"
    rows = db.execute(query, params).fetchall()
    return [dict(r) for r in rows]

# Only YOUR return request — 403 if someone else's
@router.get("/{request_id}", status_code=200)
def get_request(
    request_id: int,
    db: sqlite3.Connection = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    row = db.execute("SELECT * FROM returns WHERE id=?", (request_id,)).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Return request not found.")

    r = dict(row)
    if r["email"] != current_user["email"]:
        raise HTTPException(status_code=403, detail="You are not authorised to view this return request.")

    return r

@router.patch("/{request_id}/status", status_code=200)
def update_status(
    request_id: int,
    payload: StatusUpdate,
    db: sqlite3.Connection = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    if payload.status not in VALID_STATUSES:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of {VALID_STATUSES}.")
    row = db.execute("SELECT * FROM returns WHERE id=?", (request_id,)).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Return request not found.")

    r = dict(row)
    if r["email"] != current_user["email"]:
        raise HTTPException(status_code=403, detail="You are not authorised to update this return request.")

    db.execute("UPDATE returns SET status=? WHERE id=?", (payload.status, request_id))
    db.commit()
    return {"message": f"Request status updated to '{payload.status}'.", "request_id": request_id}
