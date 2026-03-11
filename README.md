# KLOT — Full Stack Fashion E-Commerce Platform

A luxury streetwear brand website built with React and FastAPI. Features a live product catalog, order management, newsletter signups, contact forms, and returns & exchanges — all connected to a SQLite database.

![KLOT](https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80&auto=format&fit=crop)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Framer Motion |
| Backend | Python, FastAPI, Uvicorn |
| Database | SQLite |
| Styling | Inline styles, custom CSS animations |
| Icons | Lucide React |
| Fonts | Playfair Display (Google Fonts) |

---

## Project Structure

```
klot/
├── klot-website/          # React frontend (Vite)
│   ├── src/
│   │   └── klot-landing.jsx
│   ├── package.json
│   └── index.html
│
└── klot-backend/          # FastAPI backend
    ├── main.py            # App entry point + CORS
    ├── database.py        # SQLite setup + seed data
    ├── requirements.txt
    └── routers/
        ├── newsletter.py  # Email signups
        ├── contact.py     # Contact form
        ├── products.py    # Catalog & inventory
        ├── orders.py      # Checkout & tracking
        └── returns.py     # Returns & exchanges
```

---

## Features

- **Hero Section** — Animated landing with floating geometric shapes (21st.dev component)
- **Live Product Catalog** — Fetches products from backend, shows stock status and sizes
- **Contact Form** — Submissions saved to database with status tracking
- **Newsletter Signup** — Email capture with duplicate detection
- **Order Management** — Checkout flow with automatic stock deduction
- **Returns & Exchanges** — Request system with approval workflow
- **Toast Notifications** — Real-time feedback on all form actions
- **Smooth Scroll Navigation** — All nav links scroll to page sections

---

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+

### 1. Clone the repo
```bash
git clone https://github.com/YOURUSERNAME/klot.git
cd klot
```

### 2. Start the backend
```bash
cd klot-backend
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # Mac/Linux
pip install -r requirements.txt
uvicorn main:app --reload
```
Backend runs at → **http://localhost:8000**  
API docs → **http://localhost:8000/docs**

### 3. Start the frontend
```bash
cd klot-website
npm install
npm run dev
```
Frontend runs at → **http://localhost:5173**

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/products/` | List all products |
| POST | `/api/products/` | Add a product |
| POST | `/api/newsletter/signup` | Subscribe email |
| POST | `/api/contact/submit` | Submit contact form |
| POST | `/api/orders/` | Place an order |
| POST | `/api/returns/request` | Request return/exchange |

Full interactive docs available at `http://localhost:8000/docs`

---

## Author

## Author

Built by **Chinmay** — just a fun side project to learn full stack development 🖤
