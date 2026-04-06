from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from contextlib import asynccontextmanager
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from database import init_db
from routers import newsletter, contact, products, orders, returns, auth
from routers import payments, addresses

limiter = Limiter(key_func=get_remote_address)

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield

app = FastAPI(
    title="KLOT API",
    description="Backend for KLOT clothing brand",
    version="1.0.0",
    lifespan=lifespan,
    swagger_ui_parameters={"persistAuthorization": True},
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router,       prefix="/api/auth",       tags=["Auth"])
app.include_router(newsletter.router, prefix="/api/newsletter", tags=["Newsletter"])
app.include_router(contact.router,    prefix="/api/contact",    tags=["Contact"])
app.include_router(products.router,   prefix="/api/products",   tags=["Products"])
app.include_router(orders.router,     prefix="/api/orders",     tags=["Orders"])
app.include_router(returns.router,    prefix="/api/returns",    tags=["Returns"])
app.include_router(payments.router,   prefix="/api/payments",   tags=["Payments"])
app.include_router(addresses.router,  prefix="/api/addresses",  tags=["Addresses"])

@app.get("/")
def root():
    return {"message": "KLOT API is live"}
