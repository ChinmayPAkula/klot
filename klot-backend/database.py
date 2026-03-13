import sqlite3
from pathlib import Path

DB_PATH = Path("klot.db")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    try:
        yield conn
    finally:
        conn.close()

def init_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()

    # ── Users ──────────────────────────────────────────────────
    c.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id            INTEGER PRIMARY KEY AUTOINCREMENT,
            email         TEXT UNIQUE NOT NULL,
            name          TEXT NOT NULL,
            password_hash TEXT,
            avatar        TEXT,
            google_id     TEXT,
            created_at    TEXT DEFAULT (datetime('now'))
        )
    """)

    # ── Newsletter ─────────────────────────────────────────────
    c.execute("""
        CREATE TABLE IF NOT EXISTS newsletter (
            id        INTEGER PRIMARY KEY AUTOINCREMENT,
            email     TEXT UNIQUE NOT NULL,
            joined_at TEXT DEFAULT (datetime('now'))
        )
    """)

    # ── Contact ────────────────────────────────────────────────
    c.execute("""
        CREATE TABLE IF NOT EXISTS contact (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            name       TEXT NOT NULL,
            email      TEXT NOT NULL,
            subject    TEXT,
            message    TEXT NOT NULL,
            status     TEXT DEFAULT 'unread',
            created_at TEXT DEFAULT (datetime('now'))
        )
    """)

    # ── Products ───────────────────────────────────────────────
    c.execute("""
        CREATE TABLE IF NOT EXISTS products (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            name        TEXT NOT NULL,
            collection  TEXT NOT NULL,
            description TEXT,
            price       REAL NOT NULL,
            sizes       TEXT NOT NULL,
            stock       INTEGER DEFAULT 0,
            tag         TEXT,
            image_url   TEXT,
            created_at  TEXT DEFAULT (datetime('now'))
        )
    """)

    # ── Orders ─────────────────────────────────────────────────
    c.execute("""
        CREATE TABLE IF NOT EXISTS orders (
            id              INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_name   TEXT NOT NULL,
            customer_email  TEXT NOT NULL,
            address         TEXT NOT NULL,
            items           TEXT NOT NULL,
            total           REAL NOT NULL,
            status          TEXT DEFAULT 'pending',
            created_at      TEXT DEFAULT (datetime('now'))
        )
    """)

    # ── Returns / Exchanges ────────────────────────────────────
    c.execute("""
        CREATE TABLE IF NOT EXISTS returns (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id    INTEGER NOT NULL,
            email       TEXT NOT NULL,
            reason      TEXT NOT NULL,
            type        TEXT NOT NULL CHECK(type IN ('return', 'exchange')),
            new_size    TEXT,
            status      TEXT DEFAULT 'pending',
            created_at  TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (order_id) REFERENCES orders(id)
        )
    """)

    # ── Seed products ──────────────────────────────────────────
    c.execute("SELECT COUNT(*) FROM products")
    if c.fetchone()[0] == 0:
        sample_products = [
            ("Shadow Oversized Tee",   "Void Series",   "400gsm heavyweight cotton. Dropped shoulders.",  120.0, "XS,S,M,L,XL,XXL", 50, "New Drop",   "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600"),
            ("Carbon Relaxed Trouser", "Carbon Layer",  "Japanese selvedge denim. Tapered cut.",          280.0, "28,30,32,34,36",   30, "Essentials", "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600"),
            ("Slate Bomber",           "Slate Form",    "Wool-blend shell. Ribbed cuffs and hem.",        420.0, "S,M,L,XL",         15, "Limited",    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600"),
            ("Obsidian Coach Jacket",  "Obsidian",      "Nylon ripstop. Minimal branding.",               320.0, "S,M,L,XL,XXL",     25, "Signature",  "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=600"),
            ("Void Knit Beanie",       "Void Series",   "Merino wool. One size.",                          60.0, "ONE SIZE",          80, "New Drop",   None),
            ("Carbon Utility Vest",    "Carbon Layer",  "Multi-pocket technical vest. Water resistant.",  240.0, "S,M,L,XL",         20, "Essentials", None),
        ]
        c.executemany(
            "INSERT INTO products (name, collection, description, price, sizes, stock, tag, image_url) VALUES (?,?,?,?,?,?,?,?)",
            sample_products
        )

    conn.commit()
    conn.close()
    print("✅ KLOT database initialised")
