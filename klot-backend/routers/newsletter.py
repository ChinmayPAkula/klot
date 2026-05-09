from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.responses import Response
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from database import get_db, Newsletter
from slowapi import Limiter
from slowapi.util import get_remote_address

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

class NewsletterSignup(BaseModel):
    email: EmailStr

@router.post("/signup", status_code=201)
@limiter.limit("5/minute")
def signup(request: Request, payload: NewsletterSignup, db: Session = Depends(get_db)):
    existing = db.query(Newsletter).filter(Newsletter.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=409, detail="Email already subscribed.")
    subscriber = Newsletter(email=payload.email)
    db.add(subscriber)
    db.commit()
    return {"message": "You're in. Welcome to KLOT. 🖤"}

@router.get("/list", status_code=200)
def list_subscribers(db: Session = Depends(get_db)):
    subscribers = db.query(Newsletter).order_by(Newsletter.joined_at.desc()).all()
    return [{"id": s.id, "email": s.email, "joined_at": str(s.joined_at)} for s in subscribers]

@router.delete("/{email}", status_code=204)
def unsubscribe(email: str, db: Session = Depends(get_db)):
    subscriber = db.query(Newsletter).filter(Newsletter.email == email).first()
    if not subscriber:
        raise HTTPException(status_code=404, detail="Email not found.")
    db.delete(subscriber)
    db.commit()
    return Response(status_code=204)
