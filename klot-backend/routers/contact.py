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
    status: str  # unread | read | resolved

@router.post("/submit", status_code=201)
def submit(payload: ContactForm, db: sqlite3.Connection = Depends(get_db)):
    db.execute(
        "INSERT INTO contact (name, email, subject, message) VALUES (?,?,?,?)",
        (payload.name, payload.email, payload.subject, payload.message)
    )
    db.commit()
    return {"message": "Message received. We'll get back to you within 48 hours."}

@router.get("/messages")
def list_messages(status: Optional[str] = None, db: sqlite3.Connection = Depends(get_db)):
    if status:
        rows = db.execute("SELECT * FROM contact WHERE status=? ORDER BY created_at DESC", (status,)).fetchall()
    else:
        rows = db.execute("SELECT * FROM contact ORDER BY created_at DESC").fetchall()
    return [dict(r) for r in rows]

@router.patch("/{contact_id}/status")
def update_status(contact_id: int, payload: StatusUpdate, db: sqlite3.Connection = Depends(get_db)):
    valid = {"unread", "read", "resolved"}
    if payload.status not in valid:
        raise HTTPException(status_code=400, detail=f"Status must be one of {valid}")
    db.execute("UPDATE contact SET status=? WHERE id=?", (payload.status, contact_id))
    db.commit()
    return {"message": "Status updated."}
