import { useState, useEffect, useRef } from "react"
import { Link, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, Loader2, CheckCircle, ShoppingBag, MapPin, Navigation, Plus, Trash2, X } from "lucide-react"
import { useCart } from "../context/CartContext"
import { useAuth } from "../context/AuthContext"
import { apiFetch } from "../api"

// Using OpenStreetMap - no API key needed

export default function Checkout() {
  const { cart, total, clearCart } = useCart()
  const { user, token } = useAuth()
  const navigate = useNavigate()

  const [addresses, setAddresses] = useState([])
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [showAddNew, setShowAddNew] = useState(false)
  const [newLabel, setNewLabel] = useState("Home")
  const [newAddress, setNewAddress] = useState("")
  const [newCity, setNewCity] = useState("")
  const [newState, setNewState] = useState("")
  const [newPincode, setNewPincode] = useState("")
  const [newLat, setNewLat] = useState(null)
  const [newLng, setNewLng] = useState(null)
  const [detecting, setDetecting] = useState(false)
  const [loading, setLoading] = useState(false)
  const [savingAddress, setSavingAddress] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [orderId, setOrderId] = useState(null)
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const searchTimeout = useRef(null)  // ← single declaration here, removed the duplicate below

  const inp = {
    width: "100%", background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.1)", color: "white",
    fontSize: "0.875rem", padding: "14px 18px", outline: "none",
    letterSpacing: "0.04em", boxSizing: "border-box", fontFamily: "inherit",
    transition: "border-color 0.3s"
  }

  // Load saved addresses
  useEffect(() => {
    if (!token) return
    apiFetch("/addresses/", {
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }
    }).then(data => {
      setAddresses(data)
      if (data.length > 0) setSelectedAddress(data[0])
    }).catch(() => {})
  }, [token])

  // Fetch address suggestions from OpenStreetMap
  const searchAddress = (query) => {
    setNewAddress(query)
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    if (!query || query.length < 3) { setSuggestions([]); return }
    searchTimeout.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5&countrycodes=in`,
          { headers: { "Accept-Language": "en" } }
        )
        const data = await res.json()
        setSuggestions(data)
        setShowSuggestions(true)
      } catch {}
    }, 400)
  }

  const selectSuggestion = (s) => {
    setNewAddress(s.display_name)
    setNewLat(parseFloat(s.lat))
    setNewLng(parseFloat(s.lon))
    setNewCity(s.address?.city || s.address?.town || s.address?.village || "")
    setNewState(s.address?.state || "")
    setNewPincode(s.address?.postcode || "")
    setSuggestions([])
    setShowSuggestions(false)
  }

  // Detect current location
  const detectLocation = () => {
    if (!navigator.geolocation) { setError("Geolocation not supported by your browser."); return }
    setDetecting(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            { headers: { "Accept-Language": "en" } }
          )
          const data = await res.json()
          if (data.display_name) {
            setNewAddress(data.display_name)
            setNewLat(latitude)
            setNewLng(longitude)
            setNewCity(data.address?.city || data.address?.town || data.address?.village || "")
            setNewState(data.address?.state || "")
            setNewPincode(data.address?.postcode || "")
            setShowAddNew(true)
          } else {
            setError("Could not detect address. Try searching manually.")
          }
        } catch {
          setError("Could not fetch address. Try searching manually.")
        }
        setDetecting(false)
      },
      (err) => {
        if (err.code === 1) setError("Location access denied. Please allow location in your browser.")
        else setError("Could not get location. Try searching manually.")
        setDetecting(false)
      }
    )
  }

  const saveAddress = async () => {
    if (!newAddress.trim() || !newLabel.trim()) { setError("Please fill in label and address."); return }
    setSavingAddress(true)
    try {
      const saved = await apiFetch("/addresses/", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ label: newLabel, full_address: newAddress, city: newCity, state: newState, pincode: newPincode, lat: newLat, lng: newLng })
      })
      const newAddr = { id: saved.id, label: newLabel, full_address: newAddress, city: newCity, state: newState, pincode: newPincode }
      setAddresses(prev => [newAddr, ...prev])
      setSelectedAddress(newAddr)
      setShowAddNew(false)
      setNewAddress(""); setNewCity(""); setNewState(""); setNewPincode(""); setNewLabel("Home")
    } catch (err) {
      setError(err.message)
    } finally {
      setSavingAddress(false)
    }
  }

  const deleteAddress = async (id) => {
    try {
      await apiFetch(`/addresses/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      })
      const updated = addresses.filter(a => a.id !== id)
      setAddresses(updated)
      if (selectedAddress?.id === id) setSelectedAddress(updated[0] || null)
    } catch {}
  }

  const handlePayment = async () => {
    if (!user) { navigate("/login"); return }
    if (!selectedAddress) { setError("Please select or add a delivery address."); return }
    if (cart.length === 0) { setError("Your cart is empty."); return }
    setLoading(true); setError(null)
    try {
      const orderData = await apiFetch("/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({
          address: selectedAddress.full_address,
          items: cart.map(i => ({ product_id: i.id, name: i.name, size: i.size, quantity: i.quantity, price: i.price }))
        })
      })
      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "KLOT",
        description: "Your KLOT order",
        order_id: orderData.razorpay_order_id,
        prefill: { name: user.name, email: user.email },
        theme: { color: "#ffffff" },
        handler: async (response) => {
          try {
            const result = await apiFetch("/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                address: selectedAddress.full_address,
                items: cart.map(i => ({ product_id: i.id, name: i.name, size: i.size, quantity: i.quantity, price: i.price }))
              })
            })
            setOrderId(result.order_id)
            setSuccess(true)
            clearCart()
          } catch { setError("Payment verification failed.") }
          finally { setLoading(false) }
        }
      }
      const rzp = new window.Razorpay(options)
      rzp.on("payment.failed", () => { setError("Payment failed. Please try again."); setLoading(false) })
      rzp.open()
    } catch (err) { setError(err.message); setLoading(false) }
  }

  if (success) return (
    <div style={{ minHeight: "100vh", background: "#060606", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
        style={{ textAlign: "center", maxWidth: 480, padding: "0 24px" }}>
        <CheckCircle style={{ width: 48, height: 48, color: "rgba(255,255,255,0.3)", margin: "0 auto 24px", display: "block" }} />
        <h1 style={{ fontFamily: "'Playfair Display', serif", color: "white", fontSize: "2.5rem", fontWeight: 700, marginBottom: 12 }}>Order Confirmed.</h1>
        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.875rem", lineHeight: 1.8, marginBottom: 8, fontWeight: 300 }}>
          Thank you, {user?.name?.split(" ")[0]}. Your order #{orderId} has been placed.
        </p>
        <p style={{ color: "rgba(255,255,255,0.2)", fontSize: "0.8rem", marginBottom: 40 }}>Delivering to {selectedAddress?.full_address}</p>
        <Link to="/collections" style={{ textDecoration: "none" }}>
          <button style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "white", color: "black", border: "none", fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", padding: "14px 32px", cursor: "pointer", fontWeight: 600 }}>
            Continue Shopping
          </button>
        </Link>
      </motion.div>
    </div>
  )

  if (cart.length === 0) return (
    <div style={{ minHeight: "100vh", background: "#060606", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
      <ShoppingBag style={{ width: 40, height: 40, color: "rgba(255,255,255,0.08)" }} />
      <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.875rem" }}>Your cart is empty.</p>
      <Link to="/collections" style={{ color: "white", fontSize: "0.7rem", letterSpacing: "0.2em", textTransform: "uppercase", textDecoration: "none" }}>Shop Collection →</Link>
    </div>
  )

  return (
    <div style={{ paddingTop: 100, minHeight: "100vh", background: "#060606" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "60px 64px 120px" }}>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} style={{ marginBottom: 60 }}>
          <Link to="/cart" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "rgba(255,255,255,0.3)", fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", textDecoration: "none", marginBottom: 32 }}
            onMouseEnter={e => e.currentTarget.style.color = "white"} onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.3)"}>
            <ArrowLeft style={{ width: 12, height: 12 }} /> Back to Cart
          </Link>
          <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.6rem", letterSpacing: "0.35em", textTransform: "uppercase", marginBottom: 12 }}>— Final Step</p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2.5rem,6vw,4.5rem)", fontWeight: 700, color: "white", margin: 0 }}>Checkout</h1>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 60 }}>

          {/* Left — delivery */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.1 }}>

            {/* Account */}
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", padding: "20px 24px", marginBottom: 32 }}>
              <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 8 }}>Placing order as</p>
              {user ? (
                <>
                  <p style={{ color: "white", fontSize: "0.875rem", margin: "0 0 2px" }}>{user.name}</p>
                  <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.8rem", margin: 0 }}>{user.email}</p>
                </>
              ) : (
                <Link to="/login" style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.8rem", textDecoration: "none" }}
                  onMouseEnter={e => e.currentTarget.style.color = "white"} onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.4)"}>
                  Sign in to continue →
                </Link>
              )}
            </div>

            {/* Delivery address */}
            <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.6rem", letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 20 }}>Delivery Address</p>

            {/* Detect location */}
            <button onClick={detectLocation} disabled={detecting}
              style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", fontSize: "0.7rem", letterSpacing: "0.15em", textTransform: "uppercase", padding: "12px 20px", cursor: "pointer", width: "100%", marginBottom: 16, transition: "all 0.3s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"; e.currentTarget.style.color = "white" }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "rgba(255,255,255,0.6)" }}>
              {detecting
                ? <><Loader2 style={{ width: 14, height: 14, animation: "spin 1s linear infinite" }} /> Detecting...</>
                : <><Navigation style={{ width: 14, height: 14 }} /> Use my current location</>
              }
            </button>

            {/* Saved addresses */}
            {addresses.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
                {addresses.map(addr => (
                  <div key={addr.id} onClick={() => setSelectedAddress(addr)}
                    style={{
                      display: "flex", alignItems: "flex-start", justifyContent: "space-between",
                      padding: "16px 20px", cursor: "pointer",
                      border: `1px solid ${selectedAddress?.id === addr.id ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.08)"}`,
                      background: selectedAddress?.id === addr.id ? "rgba(255,255,255,0.04)" : "transparent",
                      transition: "all 0.2s"
                    }}>
                    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <MapPin style={{ width: 14, height: 14, color: "rgba(255,255,255,0.4)", marginTop: 2, flexShrink: 0 }} />
                      <div>
                        <p style={{ color: "white", fontSize: "0.75rem", fontWeight: 600, margin: "0 0 4px", letterSpacing: "0.08em", textTransform: "uppercase" }}>{addr.label}</p>
                        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.75rem", margin: 0, lineHeight: 1.5 }}>{addr.full_address}</p>
                        {addr.city && <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.7rem", margin: "4px 0 0" }}>{addr.city}{addr.state ? `, ${addr.state}` : ""}{addr.pincode ? ` — ${addr.pincode}` : ""}</p>}
                      </div>
                    </div>
                    <button onClick={e => { e.stopPropagation(); deleteAddress(addr.id) }}
                      style={{ background: "none", border: "none", color: "rgba(255,255,255,0.2)", cursor: "pointer", padding: 4, flexShrink: 0 }}
                      onMouseEnter={e => e.currentTarget.style.color = "rgba(255,100,100,0.6)"}
                      onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.2)"}>
                      <Trash2 style={{ width: 13, height: 13 }} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add new address */}
            <button onClick={() => setShowAddNew(!showAddNew)}
              style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", color: "rgba(255,255,255,0.35)", fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", cursor: "pointer", padding: "8px 0", marginBottom: 16 }}
              onMouseEnter={e => e.currentTarget.style.color = "white"} onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.35)"}>
              {showAddNew ? <X style={{ width: 12, height: 12 }} /> : <Plus style={{ width: 12, height: 12 }} />}
              {showAddNew ? "Cancel" : "Add new address"}
            </button>

            {/* New address form */}
            <AnimatePresence>
              {showAddNew && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }}
                  style={{ overflow: "hidden" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingBottom: 8 }}>
                    {/* Label */}
                    <div>
                      <label style={{ display: "block", color: "rgba(255,255,255,0.25)", fontSize: "0.55rem", letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: 8 }}>Label</label>
                      <div style={{ display: "flex", gap: 8 }}>
                        {["Home", "Office", "Other"].map(l => (
                          <button key={l} onClick={() => setNewLabel(l)}
                            style={{ padding: "8px 16px", border: `1px solid ${newLabel === l ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.1)"}`, background: newLabel === l ? "rgba(255,255,255,0.08)" : "transparent", color: newLabel === l ? "white" : "rgba(255,255,255,0.4)", fontSize: "0.65rem", letterSpacing: "0.15em", cursor: "pointer", transition: "all 0.2s" }}>
                            {l}
                          </button>
                        ))}
                        <input value={newLabel} onChange={e => setNewLabel(e.target.value)} placeholder="Custom"
                          style={{ ...inp, flex: 1, padding: "8px 12px" }}
                          onFocus={e => e.target.style.borderColor = "rgba(255,255,255,0.3)"}
                          onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"} />
                      </div>
                    </div>

                    {/* Address search with OSM autocomplete */}
                    <div style={{ position: "relative" }}>
                      <label style={{ display: "block", color: "rgba(255,255,255,0.25)", fontSize: "0.55rem", letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: 8 }}>Search Address</label>
                      <input value={newAddress} onChange={e => searchAddress(e.target.value)}
                        placeholder="Start typing your address..."
                        style={inp}
                        onFocus={e => e.target.style.borderColor = "rgba(255,255,255,0.3)"}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} />
                      {showSuggestions && suggestions.length > 0 && (
                        <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "#0e0e0e", border: "1px solid rgba(255,255,255,0.1)", zIndex: 100, maxHeight: 220, overflowY: "auto" }}>
                          {suggestions.map((s, i) => (
                            <div key={i} onClick={() => selectSuggestion(s)}
                              style={{ padding: "12px 16px", cursor: "pointer", borderBottom: "1px solid rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.6)", fontSize: "0.75rem", lineHeight: 1.5, transition: "background 0.2s" }}
                              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
                              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                              {s.display_name}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* City, State, Pincode */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                      {[["City", newCity, setNewCity], ["State", newState, setNewState], ["Pincode", newPincode, setNewPincode]].map(([label, val, setter]) => (
                        <div key={label}>
                          <label style={{ display: "block", color: "rgba(255,255,255,0.25)", fontSize: "0.55rem", letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: 8 }}>{label}</label>
                          <input value={val} onChange={e => setter(e.target.value)} placeholder={label}
                            style={inp}
                            onFocus={e => e.target.style.borderColor = "rgba(255,255,255,0.3)"}
                            onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"} />
                        </div>
                      ))}
                    </div>

                    <button onClick={saveAddress} disabled={savingAddress}
                      style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "white", color: "black", border: "none", fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", padding: "14px", cursor: savingAddress ? "not-allowed" : "pointer", fontWeight: 600, opacity: savingAddress ? 0.7 : 1 }}>
                      {savingAddress ? <><Loader2 style={{ width: 13, height: 13, animation: "spin 1s linear infinite" }} /> Saving...</> : "Save Address"}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ color: "rgba(255,100,100,0.7)", fontSize: "0.75rem", marginTop: 12 }}>
                {error}
              </motion.p>
            )}
          </motion.div>

          {/* Right — order summary */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
            style={{ border: "1px solid rgba(255,255,255,0.06)", padding: "32px 28px", position: "sticky", top: 120, alignSelf: "start" }}>
            <p style={{ fontFamily: "'Playfair Display', serif", color: "white", fontSize: "1.1rem", fontWeight: 700, marginBottom: 24 }}>Order Summary</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
              {cart.map(item => (
                <div key={`${item.id}-${item.size}`} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <p style={{ color: "white", fontSize: "0.8rem", margin: "0 0 2px", fontWeight: 500 }}>{item.name}</p>
                    <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.65rem", margin: 0 }}>{item.size} · Qty {item.quantity}</p>
                  </div>
                  <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.8rem", margin: 0 }}>₹{(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 20, marginBottom: 28 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.75rem" }}>Subtotal</span>
                <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.75rem" }}>₹{total.toFixed(2)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.75rem" }}>Shipping</span>
                <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.75rem" }}>Free</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                <span style={{ color: "white", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>Total</span>
                <span style={{ fontFamily: "'Playfair Display', serif", color: "white", fontSize: "1.4rem", fontWeight: 700 }}>₹{total.toFixed(2)}</span>
              </div>
            </div>

            {selectedAddress && (
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", padding: "12px 16px", marginBottom: 16 }}>
                <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.55rem", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 6 }}>Delivering to</p>
                <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.72rem", margin: 0, lineHeight: 1.5 }}>{selectedAddress.full_address}</p>
              </div>
            )}

            <button onClick={handlePayment} disabled={loading || !selectedAddress}
              style={{
                width: "100%", padding: "16px", border: "none",
                background: loading || !selectedAddress ? "rgba(255,255,255,0.1)" : "white",
                color: loading || !selectedAddress ? "rgba(255,255,255,0.3)" : "black",
                fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase",
                fontWeight: 600, cursor: loading || !selectedAddress ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10, transition: "all 0.3s"
              }}>
              {loading
                ? <><Loader2 style={{ width: 14, height: 14, animation: "spin 1s linear infinite" }} /> Processing...</>
                : !selectedAddress ? "Select a delivery address" : "Pay Now"
              }
            </button>
            <p style={{ color: "rgba(255,255,255,0.15)", fontSize: "0.6rem", textAlign: "center", marginTop: 16, lineHeight: 1.6 }}>
              Secured by Razorpay. Test mode active.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
