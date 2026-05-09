from fastapi import APIRouter, HTTPException, UploadFile, File, Depends, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from database import get_db, Product, ProductImage
import cloudinary
import cloudinary.uploader
import os
import jwt
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()
security = HTTPBearer()

JWT_SECRET = os.getenv("JWT_SECRET", "fallback-secret-change-this")
JWT_ALGORITHM = "HS256"

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True
)

def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security)) -> dict:
    try:
        return jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Session expired.")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token.")

@router.post("/upload/{product_id}", status_code=201)
async def upload_image(
    product_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    # Check product exists
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found.")

    # Validate file type
    if file.content_type not in ["image/jpeg", "image/png", "image/webp"]:
        raise HTTPException(status_code=400, detail="Only JPEG, PNG and WebP images are allowed.")

    # Validate file size (max 5MB)
    contents = await file.read()
    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Image must be under 5MB.")

    try:
        result = cloudinary.uploader.upload(
            contents,
            folder="klot/products",
            transformation=[
                {"width": 800, "height": 1000, "crop": "fill", "gravity": "center"},
                {"quality": "auto", "fetch_format": "auto"}
            ]
        )
        url = result["secure_url"]
        public_id = result["public_id"]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

    # Count existing images for this product
    existing_count = db.query(ProductImage).filter(ProductImage.product_id == product_id).count()

    # First image also sets as main image_url on product
    if existing_count == 0:
        product.image_url = url
        db.commit()

    # Save to product_images table
    image = ProductImage(
        product_id=product_id,
        image_url=url,
        sort_order=existing_count
    )
    db.add(image)
    db.commit()
    db.refresh(image)

    return {
        "url": url,
        "public_id": public_id,
        "image_id": image.id,
        "is_primary": existing_count == 0
    }

@router.delete("/delete/{public_id:path}", status_code=200)
def delete_image(
    public_id: str,
    current_user: dict = Depends(get_current_user)
):
    try:
        cloudinary.uploader.destroy(public_id)
        return {"message": "Image deleted from Cloudinary."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Delete failed: {str(e)}")
