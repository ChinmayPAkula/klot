from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from typing import Optional
from database import get_db
import sqlite3

router = APIRouter()

class ContactForm(BaseModel):
    name: str
    email: EmailStr
    subject: Optional[str] = None
    message: str

class StatusUpdate(BaseModel):
    status: str

VALID_STATUSES = {"unread", "read", "resolved"}

@router.post("/submit", status_code=201)
def submit(payload: ContactForm, db: sqlite3.Connection = Depends(get_db)):
    if not payload.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty.")
    db.execute(
        "INSERT INTO contact (name, email, subject, message) VALUES (?,?,?,?)",
        (payload.name, payload.email, payload.subject, payload.message)
    )
    db.commit()
    return {"message": "Message received. We'll get back to you within 48 hours."}

@router.get("/messages", status_code=200)
def list_messages(status: Optional[str] = None, db: sqlite3.Connection = Depends(get_db)):
    if status and status not in VALID_STATUSES:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of {VALID_STATUSES}.")
    if status:
        rows = db.execute("SELECT * FROM contact WHERE status=? ORDER BY created_at DESC", (status,)).fetchall()
    else:
        rows = db.execute("SELECT * FROM contact ORDER BY created_at DESC").fetchall()
    return [dict(r) for r in rows]

@router.patch("/{contact_id}/status", status_code=200)
def update_status(contact_id: int, payload: StatusUpdate, db: sqlite3.Connection = Depends(get_db)):
    if payload.status not in VALID_STATUSES:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of {VALID_STATUSES}.")
    row = db.execute("SELECT id FROM contact WHERE id=?", (contact_id,)).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Contact message not found.")
    db.execute("UPDATE contact SET status=? WHERE id=?", (payload.status, contact_id))
    db.commit()
    return {"message": f"Status updated to '{payload.status}'.", "contact_id": contact_id}
