from sqlalchemy import create_engine, Column, Integer, String, Float, Text, ForeignKey, DateTime
from sqlalchemy.engine import URL
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.sql import func
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = URL.create(
    drivername="postgresql",
    username=os.getenv("DB_USER", "postgres"),
    password=os.getenv("DB_PASSWORD"),
    host=os.getenv("DB_HOST"),
    port=int(os.getenv("DB_PORT", 5432)),
    database=os.getenv("DB_NAME", "postgres"),
)

engine = create_engine(DATABASE_URL, connect_args={"options": "-c statement_timeout=30000"}, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# ── Models ─────────────────────────────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"
    id            = Column(Integer, primary_key=True, index=True)
    email         = Column(String, unique=True, nullable=False, index=True)
    name          = Column(String, nullable=False)
    password_hash = Column(String, nullable=True)
    avatar        = Column(String, nullable=True)
    google_id     = Column(String, nullable=True)
    created_at    = Column(DateTime(timezone=True), server_default=func.now())

class Address(Base):
    __tablename__ = "addresses"
    id           = Column(Integer, primary_key=True, index=True)
    user_id      = Column(Integer, ForeignKey("users.id"), nullable=False)
    label        = Column(String, nullable=False)
    full_address = Column(Text, nullable=False)
    city         = Column(String, nullable=True)
    state        = Column(String, nullable=True)
    pincode      = Column(String, nullable=True)
    lat          = Column(Float, nullable=True)
    lng          = Column(Float, nullable=True)
    created_at   = Column(DateTime(timezone=True), server_default=func.now())

class Newsletter(Base):
    __tablename__ = "newsletter"
    id        = Column(Integer, primary_key=True, index=True)
    email     = Column(String, unique=True, nullable=False, index=True)
    joined_at = Column(DateTime(timezone=True), server_default=func.now())

class Contact(Base):
    __tablename__ = "contact"
    id         = Column(Integer, primary_key=True, index=True)
    name       = Column(String, nullable=False)
    email      = Column(String, nullable=False)
    subject    = Column(String, nullable=True)
    message    = Column(Text, nullable=False)
    status     = Column(String, default="unread")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Product(Base):
    __tablename__ = "products"
    id          = Column(Integer, primary_key=True, index=True)
    name        = Column(String, nullable=False)
    collection  = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    price       = Column(Float, nullable=False)
    sizes       = Column(String, nullable=False)
    stock       = Column(Integer, default=0)
    tag         = Column(String, nullable=True)
    image_url   = Column(String, nullable=True)
    created_at  = Column(DateTime(timezone=True), server_default=func.now())

class ProductImage(Base):
    __tablename__ = "product_images"
    id         = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    image_url  = Column(String, nullable=False)
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Order(Base):
    __tablename__ = "orders"
    id             = Column(Integer, primary_key=True, index=True)
    customer_name  = Column(String, nullable=False)
    customer_email = Column(String, nullable=False)
    address        = Column(Text, nullable=False)
    items          = Column(Text, nullable=False)
    total          = Column(Float, nullable=False)
    status         = Column(String, default="pending")
    created_at     = Column(DateTime(timezone=True), server_default=func.now())

class Return(Base):
    __tablename__ = "returns"
    id         = Column(Integer, primary_key=True, index=True)
    order_id   = Column(Integer, ForeignKey("orders.id"), nullable=False)
    email      = Column(String, nullable=False)
    reason     = Column(Text, nullable=False)
    type       = Column(String, nullable=False)
    new_size   = Column(String, nullable=True)
    status     = Column(String, default="pending")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

# ── Session dependency ─────────────────────────────────────────────────────────

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ── Init + Seed ────────────────────────────────────────────────────────────────

def init_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if db.query(Product).count() == 0:
            sample_products = [
                Product(name="Shadow Oversized Tee",   collection="Void Series",  description="400gsm heavyweight cotton. Dropped shoulders.",  price=12999.0, sizes="XS,S,M,L,XL,XXL", stock=50, tag="New Drop",   image_url="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600"),
                Product(name="Carbon Relaxed Trouser", collection="Carbon Layer", description="Japanese selvedge denim. Tapered cut.",           price=29999.0, sizes="28,30,32,34,36",   stock=30, tag="Essentials", image_url="https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600"),
                Product(name="Slate Bomber",           collection="Slate Form",   description="Wool-blend shell. Ribbed cuffs and hem.",         price=44999.0, sizes="S,M,L,XL",         stock=15, tag="Limited",    image_url="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600"),
                Product(name="Obsidian Coach Jacket",  collection="Obsidian",     description="Nylon ripstop. Minimal branding.",                price=33999.0, sizes="S,M,L,XL,XXL",     stock=25, tag="Signature",  image_url="https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=600"),
                Product(name="Void Knit Beanie",       collection="Void Series",  description="Merino wool. One size.",                          price=6499.0,  sizes="ONE SIZE",          stock=80, tag="New Drop",   image_url=None),
                Product(name="Carbon Utility Vest",    collection="Carbon Layer", description="Multi-pocket technical vest. Water resistant.",   price=25499.0, sizes="S,M,L,XL",         stock=20, tag="Essentials", image_url=None),
            ]
            db.add_all(sample_products)
            db.commit()
            print("✅ Sample products seeded")
    finally:
        db.close()
    print("✅ KLOT database initialised")