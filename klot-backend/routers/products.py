from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from database import get_db
import sqlite3

router = APIRouter()

class ProductCreate(BaseModel):
    name: str
    collection: str
    description: Optional[str] = None
    price: float
    sizes: str           # comma-separated e.g. "S,M,L,XL"
    stock: int = 0
    tag: Optional[str] = None
    image_url: Optional[str] = None

class StockUpdate(BaseModel):
    stock: int

@router.get("/")
def list_products(
    collection: Optional[str] = None,
    in_stock: Optional[bool] = None,
    db: sqlite3.Connection = Depends(get_db)
):
    query = "SELECT * FROM products WHERE 1=1"
    params = []
    if collection:
        query += " AND collection = ?"
        params.append(collection)
    if in_stock is True:
        query += " AND stock > 0"
    elif in_stock is False:
        query += " AND stock = 0"
    query += " ORDER BY created_at DESC"
    rows = db.execute(query, params).fetchall()
    result = []
    for r in rows:
        p = dict(r)
        p["sizes"] = p["sizes"].split(",")
        result.append(p)
    return result

@router.get("/{product_id}")
def get_product(product_id: int, db: sqlite3.Connection = Depends(get_db)):
    row = db.execute("SELECT * FROM products WHERE id=?", (product_id,)).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Product not found.")
    p = dict(row)
    p["sizes"] = p["sizes"].split(",")
    return p

@router.post("/", status_code=201)
def create_product(payload: ProductCreate, db: sqlite3.Connection = Depends(get_db)):
    cur = db.execute(
        "INSERT INTO products (name, collection, description, price, sizes, stock, tag, image_url) VALUES (?,?,?,?,?,?,?,?)",
        (payload.name, payload.collection, payload.description, payload.price,
         payload.sizes, payload.stock, payload.tag, payload.image_url)
    )
    db.commit()
    return {"message": "Product created.", "id": cur.lastrowid}

@router.patch("/{product_id}/stock")
def update_stock(product_id: int, payload: StockUpdate, db: sqlite3.Connection = Depends(get_db)):
    row = db.execute("SELECT id FROM products WHERE id=?", (product_id,)).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Product not found.")
    db.execute("UPDATE products SET stock=? WHERE id=?", (payload.stock, product_id))
    db.commit()
    return {"message": "Stock updated."}

@router.delete("/{product_id}")
def delete_product(product_id: int, db: sqlite3.Connection = Depends(get_db)):
    db.execute("DELETE FROM products WHERE id=?", (product_id,))
    db.commit()
    return {"message": "Product deleted."}

@router.get("/collections/list")
def list_collections(db: sqlite3.Connection = Depends(get_db)):
    rows = db.execute("SELECT DISTINCT collection FROM products").fetchall()
    return [r["collection"] for r in rows]
