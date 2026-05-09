import cloudinary
import cloudinary.uploader
import os
from dotenv import load_dotenv

load_dotenv()

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True
)

images_dir = "static/images"

if not os.path.exists(images_dir):
    print(f"Folder '{images_dir}' not found.")
    exit()

files = [f for f in os.listdir(images_dir) if f.lower().endswith((".jpg", ".jpeg", ".png", ".webp"))]

if not files:
    print("No images found in static/images/")
    exit()

print(f"Found {len(files)} images. Uploading to Cloudinary...\n")

results = {}

for filename in files:
    path = os.path.join(images_dir, filename)
    name = os.path.splitext(filename)[0]
    print(f"Uploading {filename}...")
    try:
        result = cloudinary.uploader.upload(
            path,
            folder="klot/products",
            public_id=name,
            overwrite=True,
            transformation=[
                {"width": 800, "height": 1000, "crop": "fill", "gravity": "center"},
                {"quality": "auto", "fetch_format": "auto"}
            ]
        )
        url = result["secure_url"]
        results[filename] = url
        print(f"  ✅ {url}\n")
    except Exception as e:
        print(f"  ❌ Failed: {e}\n")

print("\n=== UPLOAD COMPLETE ===")
print("Copy these URLs into your database:\n")
for filename, url in results.items():
    print(f"{filename}: {url}")
