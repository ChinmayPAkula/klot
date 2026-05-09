from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from typing import Optional
from sqlalchemy.orm import Session
from database import get_db, Contact

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
def submit(payload: ContactForm, db: Session = Depends(get_db)):
    if not payload.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty.")
    contact = Contact(
        name=payload.name,
        email=payload.email,
        subject=payload.subject,
        message=payload.message
    )
    db.add(contact)
    db.commit()
    return {"message": "Message received. We'll get back to you within 48 hours."}

@router.get("/messages", status_code=200)
def list_messages(status: Optional[str] = None, db: Session = Depends(get_db)):
    if status and status not in VALID_STATUSES:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of {VALID_STATUSES}.")
    query = db.query(Contact)
    if status:
        query = query.filter(Contact.status == status)
    contacts = query.order_by(Contact.created_at.desc()).all()
    return [
        {"id": c.id, "name": c.name, "email": c.email, "subject": c.subject,
         "message": c.message, "status": c.status, "created_at": str(c.created_at)}
        for c in contacts
    ]

@router.patch("/{contact_id}/status", status_code=200)
def update_status(contact_id: int, payload: StatusUpdate, db: Session = Depends(get_db)):
    if payload.status not in VALID_STATUSES:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of {VALID_STATUSES}.")
    contact = db.query(Contact).filter(Contact.id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact message not found.")
    contact.status = payload.status
    db.commit()
    return {"message": f"Status updated to '{payload.status}'.", "contact_id": contact_id}
