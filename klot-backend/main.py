from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from database import init_db, get_db
from routers import newsletter, contact, products, orders, returns
import sqlite3

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield

app = FastAPI(
    title="KLOT API",
    description="Backend for KLOT clothing brand",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(newsletter.router, prefix="/api/newsletter", tags=["Newsletter"])
app.include_router(contact.router,    prefix="/api/contact",    tags=["Contact"])
app.include_router(products.router,   prefix="/api/products",   tags=["Products"])
app.include_router(orders.router,     prefix="/api/orders",     tags=["Orders"])
app.include_router(returns.router,    prefix="/api/returns",    tags=["Returns"])

@app.get("/")
def root():
    return {"message": "KLOT API is live 🖤"}
