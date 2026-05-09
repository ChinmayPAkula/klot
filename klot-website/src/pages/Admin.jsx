import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Upload, Trash2, Loader2, CheckCircle, X, Plus } from "lucide-react"
import { useAuth } from "../context/AuthContext"
import { apiFetch } from "../api"
import { Link } from "react-router-dom"

export default function Admin() {
  const { user, token } = useAuth()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(null)
  const [message, setMessage] = useState(null)
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [newProduct, setNewProduct] = useState({
    name: "", collection: "", description: "", price: "",
    sizes: "", stock: "", tag: "", image_url: ""
  })
  const [addingProduct, setAddingProduct] = useState(false)

  useEffect(() => {
    apiFetch("/products/")
      .then(setProducts)
      .finally(() => setLoading(false))
  }, [])

  const showMsg = (text, type = "success") => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 3000)
  }

  const handleImageUpload = async (productId, file) => {
    if (!file) return
    setUploading(productId)
    const formData = new FormData()
    formData.append("file", file)
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || "https://klot-backend.onrender.com/api"}/images/upload/${productId}`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail)

      setProducts(prev => prev.map(p => p.id === productId ? { ...p, image_url: data.url } : p))
      showMsg("Image uploaded successfully!")
    } catch (err) {
      showMsg(err.message || "Upload failed.", "error")
    } finally {
      setUploading(null)
    }
  }

  const handleDeleteProduct = async (productId) => {
    if (!confirm("Delete this product?")) return
    try {
      await apiFetch(`/products/${productId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      })
      setProducts(prev => prev.filter(p => p.id !== productId))
      showMsg("Product deleted.")
    } catch (err) {
      showMsg(err.message, "error")
    }
  }

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.collection || !newProduct.price || !newProduct.sizes) {
      showMsg("Name, collection, price and sizes are required.", "error")
      return
    }
    setAddingProduct(true)
    try {
      const res = await apiFetch("/products/", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({
          ...newProduct,
          price: parseFloat(newProduct.price),
          stock: parseInt(newProduct.stock) || 0
        })
      })
      const created = await apiFetch(`/products/${res.id}`)
      setProducts(prev => [created, ...prev])
      setShowAddProduct(false)
      setNewProduct({ name: "", collection: "", description: "", price: "", sizes: "", stock: "", tag: "", image_url: "" })
      showMsg("Product added!")
    } catch (err) {
      showMsg(err.message, "error")
    } finally {
      setAddingProduct(false)
    }
  }

  const inp = {
    width: "100%", background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.1)", color: "white",
    fontSize: "0.8rem", padding: "10px 14px", outline: "none",
    boxSizing: "border-box", fontFamily: "inherit"
  }

  const ADMIN_EMAIL = "akulapchinmay@gmail.com"

  if (!user || user.email !== ADMIN_EMAIL) return (
    <div style={{ minHeight: "100vh", background: "#060606", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "rgba(255,255,255,0.3)" }}>Access denied.</p>
    </div>
  )

  return (
    <div style={{ paddingTop: 100, minHeight: "100vh", background: "#060606" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "60px 64px 120px" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 48 }}>
          <div>
            <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.6rem", letterSpacing: "0.35em", textTransform: "uppercase", marginBottom: 12 }}>— Admin</p>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "3rem", fontWeight: 700, color: "white", margin: 0 }}>Products</h1>
          </div>
          <button onClick={() => setShowAddProduct(!showAddProduct)}
            style={{ display: "flex", alignItems: "center", gap: 8, background: "white", color: "black", border: "none", fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", padding: "12px 24px", cursor: "pointer", fontWeight: 600 }}>
            <Plus style={{ width: 14, height: 14 }} /> Add Product
          </button>
        </div>

        {/* Toast */}
        {message && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            style={{ padding: "12px 20px", marginBottom: 24, background: message.type === "error" ? "rgba(255,60,60,0.1)" : "rgba(255,255,255,0.05)", border: `1px solid ${message.type === "error" ? "rgba(255,60,60,0.3)" : "rgba(255,255,255,0.1)"}`, color: message.type === "error" ? "rgba(255,100,100,0.8)" : "rgba(255,255,255,0.6)", fontSize: "0.8rem" }}>
            {message.text}
          </motion.div>
        )}

        {/* Add product form */}
        {showAddProduct && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} transition={{ duration: 0.3 }}
            style={{ border: "1px solid rgba(255,255,255,0.08)", padding: 32, marginBottom: 40, overflow: "hidden" }}>
            <p style={{ color: "white", fontSize: "0.9rem", fontWeight: 600, marginBottom: 20 }}>New Product</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              {[["Name", "name"], ["Collection", "collection"], ["Price (₹)", "price"], ["Stock", "stock"], ["Sizes (comma separated)", "sizes"], ["Tag", "tag"]].map(([label, key]) => (
                <div key={key}>
                  <label style={{ display: "block", color: "rgba(255,255,255,0.25)", fontSize: "0.55rem", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 6 }}>{label}</label>
                  <input value={newProduct[key]} onChange={e => setNewProduct(p => ({ ...p, [key]: e.target.value }))} style={inp} />
                </div>
              ))}
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", color: "rgba(255,255,255,0.25)", fontSize: "0.55rem", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 6 }}>Description</label>
              <textarea value={newProduct.description} onChange={e => setNewProduct(p => ({ ...p, description: e.target.value }))} rows={3} style={{ ...inp, resize: "vertical" }} />
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={handleAddProduct} disabled={addingProduct}
                style={{ display: "flex", alignItems: "center", gap: 8, background: "white", color: "black", border: "none", fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", padding: "12px 24px", cursor: "pointer", fontWeight: 600 }}>
                {addingProduct ? <><Loader2 style={{ width: 13, height: 13, animation: "spin 1s linear infinite" }} /> Adding...</> : "Add Product"}
              </button>
              <button onClick={() => setShowAddProduct(false)}
                style={{ background: "transparent", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.1)", fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", padding: "12px 24px", cursor: "pointer" }}>
                Cancel
              </button>
            </div>
          </motion.div>
        )}

        {/* Products table */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <Loader2 style={{ width: 24, height: 24, color: "rgba(255,255,255,0.3)", animation: "spin 1s linear infinite", margin: "0 auto" }} />
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {/* Table header */}
            <div style={{ display: "grid", gridTemplateColumns: "80px 1fr 120px 80px 100px 120px", gap: 16, padding: "12px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              {["Image", "Product", "Collection", "Stock", "Price", "Actions"].map(h => (
                <p key={h} style={{ color: "rgba(255,255,255,0.2)", fontSize: "0.55rem", letterSpacing: "0.25em", textTransform: "uppercase", margin: 0 }}>{h}</p>
              ))}
            </div>

            {products.map((product, i) => (
              <motion.div key={product.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                style={{ display: "grid", gridTemplateColumns: "80px 1fr 120px 80px 100px 120px", gap: 16, padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)", alignItems: "center" }}>

                {/* Image */}
                <div style={{ position: "relative" }}>
                  <div style={{ width: 60, height: 75, background: "rgba(255,255,255,0.03)", overflow: "hidden", position: "relative" }}>
                    {product.image_url
                      ? <img src={product.image_url} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(100%)" }} />
                      : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Upload style={{ width: 16, height: 16, color: "rgba(255,255,255,0.1)" }} />
                        </div>
                    }
                    {uploading === product.id && (
                      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Loader2 style={{ width: 16, height: 16, color: "white", animation: "spin 1s linear infinite" }} />
                      </div>
                    )}
                  </div>
                  <label style={{ position: "absolute", bottom: -6, right: -6, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "50%", width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                    <Upload style={{ width: 10, height: 10, color: "white" }} />
                    <input type="file" accept="image/jpeg,image/png,image/webp" style={{ display: "none" }}
                      onChange={e => handleImageUpload(product.id, e.target.files[0])} />
                  </label>
                </div>

                {/* Name */}
                <div>
                  <p style={{ color: "white", fontSize: "0.85rem", margin: "0 0 2px", fontWeight: 500 }}>{product.name}</p>
                  {product.tag && <span style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)", fontSize: "0.55rem", letterSpacing: "0.15em", padding: "2px 8px", textTransform: "uppercase" }}>{product.tag}</span>}
                </div>

                {/* Collection */}
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.75rem", margin: 0 }}>{product.collection}</p>

                {/* Stock */}
                <p style={{ color: product.stock > 10 ? "rgba(255,255,255,0.4)" : product.stock > 0 ? "rgba(255,200,100,0.6)" : "rgba(255,100,100,0.6)", fontSize: "0.75rem", margin: 0 }}>
                  {product.stock}
                </p>

                {/* Price */}
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.75rem", margin: 0 }}>₹{product.price?.toLocaleString()}</p>

                {/* Actions */}
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => handleDeleteProduct(product.id)}
                    style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "1px solid rgba(255,60,60,0.2)", color: "rgba(255,100,100,0.5)", fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase", padding: "6px 12px", cursor: "pointer", transition: "all 0.2s" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,60,60,0.5)"; e.currentTarget.style.color = "rgba(255,100,100,0.8)" }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,60,60,0.2)"; e.currentTarget.style.color = "rgba(255,100,100,0.5)" }}>
                    <Trash2 style={{ width: 11, height: 11 }} /> Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
