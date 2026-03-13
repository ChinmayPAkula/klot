import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { motion } from "framer-motion"
import { ArrowLeft, AlertCircle, CheckCircle, Loader2, ShoppingBag } from "lucide-react"
import { apiFetch } from "../api"
import { useCart } from "../context/CartContext"

export default function ProductDetail() {
  const { id } = useParams()
  const { addToCart } = useCart()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedSize, setSelectedSize] = useState(null)
  const [added, setAdded] = useState(false)
  const [sizeError, setSizeError] = useState(false)

  useEffect(() => {
    apiFetch(`/products/${id}`)
      .then(p => { setProduct(p); if (p.sizes?.length) setSelectedSize(p.sizes[0]) })
      .catch(() => setError("Product not found."))
      .finally(() => setLoading(false))
  }, [id])

  const handleAdd = () => {
    if (product.stock === 0) return
    if (!selectedSize) { setSizeError(true); setTimeout(() => setSizeError(false), 2000); return }
    addToCart(product, selectedSize)
    setAdded(true)
    setTimeout(() => setAdded(false), 2500)
  }

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#060606", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Loader2 style={{ width: 24, height: 24, color: "rgba(255,255,255,0.3)", animation: "spin 1s linear infinite" }} />
    </div>
  )

  if (error || !product) return (
    <div style={{ minHeight: "100vh", background: "#060606", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
      <AlertCircle style={{ width: 28, height: 28, color: "rgba(255,100,100,0.5)" }} />
      <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.875rem" }}>{error}</p>
      <Link to="/collections" style={{ color: "white", fontSize: "0.7rem", letterSpacing: "0.2em", textTransform: "uppercase", textDecoration: "none" }}>← Back to Collections</Link>
    </div>
  )

  return (
    <div style={{ paddingTop: 100, minHeight: "100vh", background: "#060606" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 64px 100px" }}>

        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}
          style={{ marginBottom: 48 }}>
          <Link to="/collections" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "rgba(255,255,255,0.3)", fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", textDecoration: "none" }}
            onMouseEnter={e => e.currentTarget.style.color = "white"}
            onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.3)"}>
            <ArrowLeft style={{ width: 12, height: 12 }} /> Back to Collections
          </Link>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "start" }}>

          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
            <div style={{ position: "relative", overflow: "hidden", aspectRatio: "3/4" }}>
              {product.image_url
                ? <img src={product.image_url} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(100%)" }} />
                : <div style={{ width: "100%", height: "100%", background: "rgba(255,255,255,0.03)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ color: "rgba(255,255,255,0.1)", fontSize: "0.7rem", letterSpacing: "0.2em", textTransform: "uppercase" }}>No image</span>
                  </div>
              }
              <div style={{ position: "absolute", top: 20, left: 20, display: "flex", gap: 8 }}>
                {product.tag && <span style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.6)", fontSize: "0.55rem", letterSpacing: "0.2em", textTransform: "uppercase", padding: "4px 14px" }}>{product.tag}</span>}
                {product.stock === 0 && <span style={{ background: "rgba(255,60,60,0.1)", border: "1px solid rgba(255,60,60,0.2)", color: "rgba(255,100,100,0.7)", fontSize: "0.55rem", letterSpacing: "0.2em", textTransform: "uppercase", padding: "4px 14px" }}>Sold Out</span>}
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
            style={{ paddingTop: 20 }}>
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.6rem", letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 12 }}>{product.collection}</p>
            <h1 style={{ fontFamily: "'Playfair Display', serif", color: "white", fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 700, marginBottom: 16, lineHeight: 1.1 }}>{product.name}</h1>
            <p style={{ color: "white", fontSize: "1.5rem", fontWeight: 300, marginBottom: 32 }}>£{product.price}</p>

            {product.description && (
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.875rem", lineHeight: 1.9, marginBottom: 40, fontWeight: 300, maxWidth: 420 }}>
                {product.description}
              </p>
            )}

            {/* Size selector */}
            <div style={{ marginBottom: 32 }}>
              <p style={{ color: sizeError ? "rgba(255,100,100,0.7)" : "rgba(255,255,255,0.4)", fontSize: "0.6rem", letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: 16, transition: "color 0.3s" }}>
                {sizeError ? "Please select a size" : "Select Size"}
              </p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {product.sizes?.map(size => (
                  <button key={size} onClick={() => { setSelectedSize(size); setSizeError(false) }}
                    style={{
                      width: 52, height: 52,
                      border: `1px solid ${sizeError ? "rgba(255,100,100,0.3)" : selectedSize === size ? "white" : "rgba(255,255,255,0.15)"}`,
                      background: selectedSize === size ? "white" : "transparent",
                      color: selectedSize === size ? "black" : "rgba(255,255,255,0.5)",
                      fontSize: "0.7rem", cursor: "pointer", transition: "all 0.2s"
                    }}>
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <p style={{ color: product.stock > 0 ? "rgba(255,255,255,0.25)" : "rgba(255,100,100,0.5)", fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 24 }}>
              {product.stock > 10 ? "In stock" : product.stock > 0 ? `Only ${product.stock} left` : "Out of stock"}
            </p>

            <button onClick={handleAdd} disabled={product.stock === 0}
              style={{
                width: "100%", padding: "18px 32px", border: "none",
                cursor: product.stock === 0 ? "not-allowed" : "pointer",
                background: added ? "rgba(255,255,255,0.85)" : product.stock === 0 ? "rgba(255,255,255,0.08)" : "white",
                color: product.stock === 0 ? "rgba(255,255,255,0.2)" : "black",
                fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 600,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10, transition: "all 0.3s"
              }}>
              {added
                ? <><CheckCircle style={{ width: 14, height: 14 }} /> Added to Bag</>
                : product.stock === 0 ? "Out of Stock"
                : <><ShoppingBag style={{ width: 14, height: 14 }} /> Add to Bag</>
              }
            </button>

            {added && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                <Link to="/cart" style={{ display: "block", textAlign: "center", marginTop: 12, color: "rgba(255,255,255,0.4)", fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", textDecoration: "none" }}
                  onMouseEnter={e => e.currentTarget.style.color = "white"}
                  onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.4)"}>
                  View Bag →
                </Link>
              </motion.div>
            )}

            <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", marginTop: 40, paddingTop: 32 }}>
              {[["Material", "400gsm heavyweight cotton"], ["Fit", "Relaxed, dropped shoulders"], ["Origin", "Made in Portugal"], ["Care", "Cold wash, hang dry"]].map(([label, val]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
                  <span style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.7rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>{label}</span>
                  <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.7rem" }}>{val}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
