import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { Trash2, ArrowRight, ArrowLeft, ShoppingBag } from "lucide-react"
import { useCart } from "../context/CartContext"

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, total, clearCart } = useCart()

  return (
    <div style={{ paddingTop: 100, minHeight: "100vh", background: "#060606" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "60px 64px 120px" }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
          style={{ marginBottom: 60 }}>
          <Link to="/collections" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "rgba(255,255,255,0.3)", fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", textDecoration: "none", marginBottom: 32 }}
            onMouseEnter={e => e.currentTarget.style.color = "white"}
            onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.3)"}>
            <ArrowLeft style={{ width: 12, height: 12 }} /> Continue Shopping
          </Link>
          <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.6rem", letterSpacing: "0.35em", textTransform: "uppercase", marginBottom: 12 }}>— Your Selection</p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2.5rem,6vw,4.5rem)", fontWeight: 700, color: "white", margin: 0 }}>
            Bag {cart.length > 0 && <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "0.4em", fontWeight: 400, letterSpacing: "0.1em" }}>({cart.length} {cart.length === 1 ? "item" : "items"})</span>}
          </h1>
        </motion.div>

        {/* Empty state */}
        {cart.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, padding: "100px 0", textAlign: "center" }}>
            <ShoppingBag style={{ width: 48, height: 48, color: "rgba(255,255,255,0.08)" }} />
            <p style={{ fontFamily: "'Playfair Display', serif", color: "rgba(255,255,255,0.3)", fontSize: "1.2rem", fontWeight: 400 }}>Your bag is empty.</p>
            <p style={{ color: "rgba(255,255,255,0.2)", fontSize: "0.8rem", fontWeight: 300 }}>Add something worth wearing.</p>
            <Link to="/collections" style={{ textDecoration: "none", marginTop: 16 }}>
              <button style={{ display: "flex", alignItems: "center", gap: 10, background: "white", color: "black", border: "none", fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", padding: "14px 28px", cursor: "pointer", fontWeight: 600 }}>
                Shop Collection <ArrowRight style={{ width: 14, height: 14 }} />
              </button>
            </Link>
          </motion.div>
        )}

        {/* Cart items + summary */}
        {cart.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 60, alignItems: "start" }}>

            {/* Items */}
            <div>
              {/* Column headers */}
              <div style={{ display: "grid", gridTemplateColumns: "80px 1fr auto auto", gap: 20, alignItems: "center", paddingBottom: 16, borderBottom: "1px solid rgba(255,255,255,0.06)", marginBottom: 0 }}>
                {["", "Product", "Qty", "Price"].map(h => (
                  <p key={h} style={{ color: "rgba(255,255,255,0.2)", fontSize: "0.55rem", letterSpacing: "0.25em", textTransform: "uppercase", margin: 0, textAlign: h === "Price" || h === "Qty" ? "right" : "left" }}>{h}</p>
                ))}
              </div>

              {cart.map((item, i) => (
                <motion.div key={`${item.id}-${item.size}`}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                  style={{ display: "grid", gridTemplateColumns: "80px 1fr auto auto", gap: 20, alignItems: "center", padding: "24px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>

                  {/* Image */}
                  <div style={{ width: 80, height: 100, overflow: "hidden", background: "rgba(255,255,255,0.03)" }}>
                    {item.image_url
                      ? <img src={item.image_url} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(100%)" }} />
                      : <div style={{ width: "100%", height: "100%", background: "rgba(255,255,255,0.02)" }} />
                    }
                  </div>

                  {/* Info */}
                  <div>
                    <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.55rem", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 6 }}>{item.collection}</p>
                    <p style={{ fontFamily: "'Playfair Display', serif", color: "white", fontSize: "1rem", fontWeight: 700, marginBottom: 6 }}>{item.name}</p>
                    <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.7rem", marginBottom: 12 }}>Size: {item.size}</p>
                    <button onClick={() => removeFromCart(item.id, item.size)}
                      style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: "rgba(255,255,255,0.2)", fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer", padding: 0 }}
                      onMouseEnter={e => e.currentTarget.style.color = "rgba(255,100,100,0.6)"}
                      onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.2)"}>
                      <Trash2 style={{ width: 11, height: 11 }} /> Remove
                    </button>
                  </div>

                  {/* Quantity */}
                  <div style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "flex-end" }}>
                    <button onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)}
                      style={{ width: 28, height: 28, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "rgba(255,255,255,0.4)", fontSize: "1rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"; e.currentTarget.style.color = "white" }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "rgba(255,255,255,0.4)" }}>
                      −
                    </button>
                    <span style={{ color: "white", fontSize: "0.85rem", minWidth: 16, textAlign: "center" }}>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                      style={{ width: 28, height: 28, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "rgba(255,255,255,0.4)", fontSize: "1rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"; e.currentTarget.style.color = "white" }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "rgba(255,255,255,0.4)" }}>
                      +
                    </button>
                  </div>

                  {/* Price */}
                  <p style={{ color: "white", fontSize: "0.9rem", fontWeight: 300, textAlign: "right", margin: 0 }}>
                    £{(item.price * item.quantity).toFixed(2)}
                  </p>
                </motion.div>
              ))}

              {/* Clear cart */}
              <div style={{ marginTop: 20 }}>
                <button onClick={clearCart}
                  style={{ background: "none", border: "none", color: "rgba(255,255,255,0.15)", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", cursor: "pointer", padding: 0 }}
                  onMouseEnter={e => e.currentTarget.style.color = "rgba(255,100,100,0.5)"}
                  onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.15)"}>
                  Clear Bag
                </button>
              </div>
            </div>

            {/* Order summary */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
              style={{ border: "1px solid rgba(255,255,255,0.06)", padding: "36px 32px", position: "sticky", top: 120 }}>
              <p style={{ fontFamily: "'Playfair Display', serif", color: "white", fontSize: "1.1rem", fontWeight: 700, marginBottom: 28 }}>Order Summary</p>

              <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.75rem" }}>Subtotal</span>
                  <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.75rem" }}>£{total.toFixed(2)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.75rem" }}>Shipping</span>
                  <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.75rem" }}>Calculated at checkout</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.75rem" }}>Duties</span>
                  <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.75rem" }}>Included</span>
                </div>
              </div>

              <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 20, marginBottom: 28 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "white", fontSize: "0.8rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>Total</span>
                  <span style={{ fontFamily: "'Playfair Display', serif", color: "white", fontSize: "1.4rem", fontWeight: 700 }}>£{total.toFixed(2)}</span>
                </div>
              </div>

              <button style={{ width: "100%", padding: "16px", background: "white", color: "black", border: "none", fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 12 }}
                onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
                onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
                Checkout <ArrowRight style={{ width: 14, height: 14 }} />
              </button>

              <Link to="/collections" style={{ textDecoration: "none", display: "block", textAlign: "center" }}>
                <button style={{ width: "100%", padding: "14px", background: "transparent", color: "rgba(255,255,255,0.3)", border: "1px solid rgba(255,255,255,0.08)", fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", cursor: "pointer" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; e.currentTarget.style.color = "white" }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "rgba(255,255,255,0.3)" }}>
                  Continue Shopping
                </button>
              </Link>

              <p style={{ color: "rgba(255,255,255,0.15)", fontSize: "0.6rem", textAlign: "center", marginTop: 20, lineHeight: 1.6 }}>
                Free returns within 14 days.<br />Duties included on all orders.
              </p>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}
