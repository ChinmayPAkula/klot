from fastapi import APIRouter, HTTPException, Depends, Response
from pydantic import BaseModel
from typing import Optional, List
from sqlalchemy.orm import Session
from database import get_db, Product, ProductImage

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

def format_product(p: Product, images: list) -> dict:
    return {
        "id": p.id, "name": p.name, "collection": p.collection,
        "description": p.description, "price": p.price,
        "sizes": p.sizes.split(","), "stock": p.stock,
        "tag": p.tag, "image_url": p.image_url,
        "created_at": str(p.created_at), "images": images
    }

def get_images(product_id: int, db: Session) -> list:
    imgs = db.query(ProductImage).filter(
        ProductImage.product_id == product_id
    ).order_by(ProductImage.sort_order.asc()).all()
    return [{"id": i.id, "product_id": i.product_id, "image_url": i.image_url, "sort_order": i.sort_order} for i in imgs]

@router.get("/", status_code=200)
def list_products(
    collection: Optional[str] = None,
    in_stock: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Product)
    if collection:
        query = query.filter(Product.collection == collection)
    if in_stock is True:
        query = query.filter(Product.stock > 0)
    elif in_stock is False:
        query = query.filter(Product.stock == 0)
    products = query.order_by(Product.created_at.desc()).all()
    return [format_product(p, get_images(p.id, db)) for p in products]

@router.get("/collections/list", status_code=200)
def list_collections(db: Session = Depends(get_db)):
    from sqlalchemy import distinct
    rows = db.query(distinct(Product.collection)).all()
    return [r[0] for r in rows]

@router.get("/{product_id}", status_code=200)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found.")
    return format_product(product, get_images(product_id, db))

@router.post("/", status_code=201)
def create_product(payload: ProductCreate, db: Session = Depends(get_db)):
    product = Product(
        name=payload.name, collection=payload.collection,
        description=payload.description, price=payload.price,
        sizes=payload.sizes, stock=payload.stock,
        tag=payload.tag, image_url=payload.image_url
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return {"message": "Product created.", "id": product.id}

@router.patch("/{product_id}/stock", status_code=200)
def update_stock(product_id: int, payload: StockUpdate, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found.")
    if payload.stock < 0:
        raise HTTPException(status_code=400, detail="Stock cannot be negative.")
    product.stock = payload.stock
    db.commit()
    return {"message": "Stock updated.", "product_id": product_id, "stock": payload.stock}

@router.delete("/{product_id}", status_code=204)
def delete_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found.")
    db.delete(product)
    db.commit()
    return Response(status_code=204)

# ── Product Images ─────────────────────────────────────────────────────────────

@router.get("/{product_id}/images", status_code=200)
def list_product_images(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found.")
    return get_images(product_id, db)

@router.post("/{product_id}/images", status_code=201)
def add_product_image(product_id: int, payload: ProductImageAdd, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found.")
    image = ProductImage(product_id=product_id, image_url=payload.image_url, sort_order=payload.sort_order)
    db.add(image)
    db.commit()
    db.refresh(image)
    return {"message": "Image added.", "id": image.id}

@router.delete("/{product_id}/images/{image_id}", status_code=204)
def delete_product_image(product_id: int, image_id: int, db: Session = Depends(get_db)):
    image = db.query(ProductImage).filter(
        ProductImage.id == image_id,
        ProductImage.product_id == product_id
    ).first()
    if not image:
        raise HTTPException(status_code=404, detail="Image not found.")
    db.delete(image)
    db.commit()
    return Response(status_code=204)
