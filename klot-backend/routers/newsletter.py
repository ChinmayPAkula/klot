from fastapi import APIRouter, HTTPException, Depends, Response, Request
from pydantic import BaseModel, EmailStr
from database import get_db
from slowapi import Limiter
from slowapi.util import get_remote_address
import sqlite3

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

class NewsletterSignup(BaseModel):
    email: EmailStr


@router.post("/signup", status_code=201)
@limiter.limit("5/minute")
def signup(request: Request, payload: NewsletterSignup, db: sqlite3.Connection = Depends(get_db)):
    try:
        db.execute("INSERT INTO newsletter (email) VALUES (?)", (payload.email,))
        db.commit()
        return {"message": "You're in. Welcome to KLOT. 🖤"}
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=409, detail="Email already subscribed.")

@router.get("/list", status_code=200)
def list_subscribers(db: sqlite3.Connection = Depends(get_db)):
    rows = db.execute("SELECT id, email, joined_at FROM newsletter ORDER BY joined_at DESC").fetchall()
    return [dict(r) for r in rows]

@router.delete("/{email}", status_code=204)
def unsubscribe(email: str, db: sqlite3.Connection = Depends(get_db)):
    row = db.execute("SELECT id FROM newsletter WHERE email=?", (email,)).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Email not found.")
    db.execute("DELETE FROM newsletter WHERE email=?", (email,))
    db.commit()
    return Response(status_code=204)
