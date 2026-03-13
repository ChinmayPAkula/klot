import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { AlertCircle, ArrowRight } from "lucide-react"
import { apiFetch } from "../api"

export default function Collections() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeCollection, setActiveCollection] = useState("All")

  useEffect(() => {
    apiFetch("/products/")
      .then(setProducts)
      .catch(() => setError("Couldn't load products. Is the backend running?"))
      .finally(() => setLoading(false))
  }, [])

  // Group products by collection
  const collections = ["All", ...new Set(products.map(p => p.collection))]

  const filtered = activeCollection === "All"
    ? products
    : products.filter(p => p.collection === activeCollection)

  return (
    <div style={{ paddingTop: 100, minHeight: "100vh", background: "#060606" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "60px 64px" }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
          style={{ marginBottom: 60 }}>
          <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.6rem", letterSpacing: "0.35em", textTransform: "uppercase", marginBottom: 12 }}>— SS 2025</p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2.5rem,6vw,5rem)", fontWeight: 700, color: "white", margin: "0 0 8px" }}>Collections</h1>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.875rem", fontWeight: 300 }}>{products.length} pieces available</p>
        </motion.div>

        {/* Collection filter tabs */}
        {!loading && !error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            style={{ display: "flex", gap: 8, marginBottom: 56, flexWrap: "wrap" }}>
            {collections.map(col => (
              <button key={col} onClick={() => setActiveCollection(col)}
                style={{
                  background: activeCollection === col ? "white" : "transparent",
                  color: activeCollection === col ? "black" : "rgba(255,255,255,0.4)",
                  border: `1px solid ${activeCollection === col ? "white" : "rgba(255,255,255,0.12)"}`,
                  fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase",
                  padding: "8px 20px", cursor: "pointer", transition: "all 0.3s"
                }}
                onMouseEnter={e => { if (activeCollection !== col) { e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"; e.currentTarget.style.color = "white" } }}
                onMouseLeave={e => { if (activeCollection !== col) { e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; e.currentTarget.style.color = "rgba(255,255,255,0.4)" } }}>
                {col}
              </button>
            ))}
          </motion.div>
        )}

        {/* Error */}
        {error && (
          <div style={{ textAlign: "center", padding: "120px 0" }}>
            <AlertCircle style={{ width: 28, height: 28, color: "rgba(255,100,100,0.5)", margin: "0 auto 16px", display: "block" }} />
            <p style={{ color: "rgba(255,100,100,0.6)", fontSize: "0.8rem" }}>{error}</p>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ height: 400, background: "rgba(255,255,255,0.03)", animation: "pulse 1.5s ease-in-out infinite", animationDelay: `${i * 0.1}s` }} />
            ))}
          </div>
        )}

        {/* Product grid */}
        {!loading && !error && (
          <>
            {/* Group by collection if "All" is selected */}
            {activeCollection === "All" ? (
              [...new Set(products.map(p => p.collection))].map(col => (
                <div key={col} style={{ marginBottom: 80 }}>
                  {/* Collection heading */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, paddingBottom: 16, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    <h2 style={{ fontFamily: "'Playfair Display', serif", color: "white", fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>{col}</h2>
                    <button onClick={() => setActiveCollection(col)}
                      style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: "rgba(255,255,255,0.3)", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", cursor: "pointer" }}
                      onMouseEnter={e => e.currentTarget.style.color = "white"}
                      onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.3)"}>
                      View all <ArrowRight style={{ width: 10, height: 10 }} />
                    </button>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
                    {products.filter(p => p.collection === col).map((product, i) => (
                      <ProductCard key={product.id} product={product} index={i} />
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
                {filtered.map((product, i) => (
                  <ProductCard key={product.id} product={product} index={i} />
                ))}
              </div>
            )}

            {filtered.length === 0 && (
              <p style={{ color: "rgba(255,255,255,0.2)", textAlign: "center", padding: "80px 0", fontSize: "0.875rem" }}>
                No products in this collection yet.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function ProductCard({ product, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.07 }}
      viewport={{ once: true }}>
      <Link to={`/collections/${product.id}`} style={{ textDecoration: "none", display: "block" }}>
        <div style={{ position: "relative", overflow: "hidden", height: 400, cursor: "pointer", background: "rgba(255,255,255,0.02)" }}
          onMouseEnter={e => e.currentTarget.querySelector("img")?.style && (e.currentTarget.querySelector("img").style.transform = "scale(1.05)")}
          onMouseLeave={e => e.currentTarget.querySelector("img")?.style && (e.currentTarget.querySelector("img").style.transform = "scale(1)")}>

          {product.image_url
            ? <img src={product.image_url} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(100%)", transition: "transform 0.6s ease" }} />
            : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "rgba(255,255,255,0.1)", fontSize: "0.7rem", letterSpacing: "0.2em", textTransform: "uppercase" }}>No image</span>
              </div>
          }

          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(0,0,0,0.8) 0%,transparent 55%)" }} />

          {/* Badges */}
          <div style={{ position: "absolute", top: 14, left: 14, display: "flex", gap: 6 }}>
            {product.tag && <span style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.6)", fontSize: "0.5rem", letterSpacing: "0.2em", textTransform: "uppercase", padding: "3px 10px" }}>{product.tag}</span>}
            {product.stock === 0 && <span style={{ background: "rgba(255,60,60,0.1)", border: "1px solid rgba(255,60,60,0.2)", color: "rgba(255,100,100,0.7)", fontSize: "0.5rem", letterSpacing: "0.2em", textTransform: "uppercase", padding: "3px 10px" }}>Sold Out</span>}
          </div>

          {/* Info */}
          <div style={{ position: "absolute", bottom: 18, left: 18, right: 18 }}>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.5rem", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 4 }}>{product.collection}</p>
            <p style={{ fontFamily: "'Playfair Display', serif", color: "white", fontSize: "1.05rem", fontWeight: 700, margin: "0 0 4px" }}>{product.name}</p>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8rem", margin: 0 }}>£{product.price}</p>
          </div>

          {/* Hover arrow */}
          <div style={{ position: "absolute", bottom: 18, right: 18 }}>
            <ArrowRight style={{ width: 16, height: 16, color: "rgba(255,255,255,0.3)" }} />
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
