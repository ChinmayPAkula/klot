from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from database import get_db
import sqlite3

router = APIRouter()

class NewsletterSignup(BaseModel):
    email: EmailStr

@router.post("/signup", status_code=201)
def signup(payload: NewsletterSignup, db: sqlite3.Connection = Depends(get_db)):
    try:
        db.execute("INSERT INTO newsletter (email) VALUES (?)", (payload.email,))
        db.commit()
        return {"message": "You're in. Welcome to KLOT. 🖤"}
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=409, detail="Email already subscribed.")

@router.get("/list")
def list_subscribers(db: sqlite3.Connection = Depends(get_db)):
    rows = db.execute("SELECT id, email, joined_at FROM newsletter ORDER BY joined_at DESC").fetchall()
    return [dict(r) for r in rows]

@router.delete("/{email}")
def unsubscribe(email: str, db: sqlite3.Connection = Depends(get_db)):
    db.execute("DELETE FROM newsletter WHERE email = ?", (email,))
    db.commit()
    return {"message": "Unsubscribed successfully."}
