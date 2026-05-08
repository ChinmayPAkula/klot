from fastapi import APIRouter, HTTPException, Depends, Response
from pydantic import BaseModel
from typing import Optional, List
from database import get_db
import sqlite3

router = APIRouter()

class ProductCreate(BaseModel):
    name: str
    collection: str
    description: Optional[str] = None
    price: float
    sizes: str
    stock: int = 0
    tag: Optional[str] = None
    image_url: Optional[str] = None

class StockUpdate(BaseModel):
    stock: int

class ProductImageAdd(BaseModel):
    image_url: str
    sort_order: int = 0

def get_product_images(product_id: int, db: sqlite3.Connection) -> list:
    rows = db.execute(
        "SELECT * FROM product_images WHERE product_id=? ORDER BY sort_order ASC",
        (product_id,)
    ).fetchall()
    return [dict(r) for r in rows]

@router.get("/", status_code=200)
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
        p["images"] = get_product_images(p["id"], db)
        result.append(p)
    return result

@router.get("/collections/list", status_code=200)
def list_collections(db: sqlite3.Connection = Depends(get_db)):
    rows = db.execute("SELECT DISTINCT collection FROM products").fetchall()
    return [r["collection"] for r in rows]

@router.get("/{product_id}", status_code=200)
def get_product(product_id: int, db: sqlite3.Connection = Depends(get_db)):
    row = db.execute("SELECT * FROM products WHERE id=?", (product_id,)).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Product not found.")
    p = dict(row)
    p["sizes"] = p["sizes"].split(",")
    p["images"] = get_product_images(product_id, db)
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

@router.patch("/{product_id}/stock", status_code=200)
def update_stock(product_id: int, payload: StockUpdate, db: sqlite3.Connection = Depends(get_db)):
    row = db.execute("SELECT id FROM products WHERE id=?", (product_id,)).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Product not found.")
    if payload.stock < 0:
        raise HTTPException(status_code=400, detail="Stock cannot be negative.")
    db.execute("UPDATE products SET stock=? WHERE id=?", (payload.stock, product_id))
    db.commit()
    return {"message": "Stock updated.", "product_id": product_id, "stock": payload.stock}

@router.delete("/{product_id}", status_code=204)
def delete_product(product_id: int, db: sqlite3.Connection = Depends(get_db)):
    row = db.execute("SELECT id FROM products WHERE id=?", (product_id,)).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Product not found.")
    db.execute("DELETE FROM products WHERE id=?", (product_id,))
    db.commit()
    return Response(status_code=204)

# ── Product Images ─────────────────────────────────────────────────────────────

@router.get("/{product_id}/images", status_code=200)
def list_product_images(product_id: int, db: sqlite3.Connection = Depends(get_db)):
    row = db.execute("SELECT id FROM products WHERE id=?", (product_id,)).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Product not found.")
    return get_product_images(product_id, db)

@router.post("/{product_id}/images", status_code=201)
def add_product_image(product_id: int, payload: ProductImageAdd, db: sqlite3.Connection = Depends(get_db)):
    row = db.execute("SELECT id FROM products WHERE id=?", (product_id,)).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Product not found.")
    cur = db.execute(
        "INSERT INTO product_images (product_id, image_url, sort_order) VALUES (?,?,?)",
        (product_id, payload.image_url, payload.sort_order)
    )
    db.commit()
    return {"message": "Image added.", "id": cur.lastrowid}

@router.delete("/{product_id}/images/{image_id}", status_code=204)
def delete_product_image(product_id: int, image_id: int, db: sqlite3.Connection = Depends(get_db)):
    row = db.execute(
        "SELECT id FROM product_images WHERE id=? AND product_id=?", (image_id, product_id)
    ).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Image not found.")
    db.execute("DELETE FROM product_images WHERE id=?", (image_id,))
    db.commit()
    return Response(status_code=204)
