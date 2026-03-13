import { useState, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { ShoppingBag, User, LogOut, ChevronDown } from "lucide-react"
import { useCart } from "../context/CartContext"
import { useAuth } from "../context/AuthContext"

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { count } = useCart()
  const { user, logout } = useAuth()

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40)
    window.addEventListener("scroll", fn)
    return () => window.removeEventListener("scroll", fn)
  }, [])

  useEffect(() => { setUserMenuOpen(false) }, [location])

  const links = [
    { label: "Collections", to: "/collections" },
    { label: "About", to: "/about" },
    { label: "Contact", to: "/contact" },
  ]

  const isActive = (to) => location.pathname === to

  const handleLogout = () => {
    logout()
    setUserMenuOpen(false)
    navigate("/")
  }

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "24px 64px",
      background: scrolled ? "rgba(8,8,8,0.92)" : "rgba(6,6,6,0.4)",
      backdropFilter: "blur(12px)",
      borderBottom: scrolled ? "1px solid rgba(255,255,255,0.05)" : "none",
      transition: "all 0.5s ease"
    }}>

      {/* Logo */}
      <Link to="/" style={{ textDecoration: "none" }}>
        <span style={{ fontFamily: "'Playfair Display', serif", letterSpacing: "0.3em", color: "white", fontSize: "1.1rem", fontWeight: 700 }}>
          KLOT
        </span>
      </Link>

      {/* Nav links */}
      <div style={{ display: "flex", gap: 40 }}>
        {links.map(({ label, to }) => (
          <Link key={to} to={to} style={{
            textDecoration: "none",
            color: isActive(to) ? "white" : "rgba(255,255,255,0.4)",
            fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase",
            borderBottom: isActive(to) ? "1px solid rgba(255,255,255,0.4)" : "1px solid transparent",
            paddingBottom: 2, transition: "all 0.3s"
          }}
            onMouseEnter={e => e.currentTarget.style.color = "white"}
            onMouseLeave={e => e.currentTarget.style.color = isActive(to) ? "white" : "rgba(255,255,255,0.4)"}>
            {label}
          </Link>
        ))}
      </div>

      {/* Right side */}
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>

        {/* Cart */}
        <Link to="/cart" style={{ textDecoration: "none", position: "relative", display: "flex", alignItems: "center" }}>
          <ShoppingBag style={{ width: 18, height: 18, color: count > 0 ? "white" : "rgba(255,255,255,0.4)", transition: "color 0.3s" }} />
          {count > 0 && (
            <span style={{
              position: "absolute", top: -8, right: -8,
              background: "white", color: "black",
              fontSize: "0.5rem", fontWeight: 700,
              width: 16, height: 16, borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              {count}
            </span>
          )}
        </Link>

        {/* User menu or login */}
        {user ? (
          <div style={{ position: "relative" }}>
            <button onClick={() => setUserMenuOpen(!userMenuOpen)}
              style={{ display: "flex", alignItems: "center", gap: 8, background: "transparent", border: "1px solid rgba(255,255,255,0.12)", color: "white", padding: "7px 14px", cursor: "pointer", fontSize: "0.65rem", letterSpacing: "0.1em", transition: "border-color 0.3s" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"}>
              {user.avatar
                ? <img src={user.avatar} alt={user.name} style={{ width: 20, height: 20, borderRadius: "50%", objectFit: "cover" }} />
                : <User style={{ width: 14, height: 14 }} />
              }
              <span style={{ maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user.name.split(" ")[0]}
              </span>
              <ChevronDown style={{ width: 12, height: 12, opacity: 0.5, transform: userMenuOpen ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.3s" }} />
            </button>

            {/* Dropdown */}
            {userMenuOpen && (
              <div style={{
                position: "absolute", top: "calc(100% + 8px)", right: 0, minWidth: 160,
                background: "#0e0e0e", border: "1px solid rgba(255,255,255,0.08)",
                padding: "8px 0", zIndex: 100
              }}>
                <div style={{ padding: "10px 16px 10px", borderBottom: "1px solid rgba(255,255,255,0.06)", marginBottom: 4 }}>
                  <p style={{ color: "white", fontSize: "0.8rem", margin: "0 0 2px", fontWeight: 500 }}>{user.name}</p>
                  <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.65rem", margin: 0 }}>{user.email}</p>
                </div>
                <button onClick={handleLogout}
                  style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: "0.7rem", letterSpacing: "0.1em", cursor: "pointer", textAlign: "left" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "white" }}
                  onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "rgba(255,255,255,0.4)" }}>
                  <LogOut style={{ width: 13, height: 13 }} /> Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: "flex", gap: 8 }}>
            <Link to="/login" style={{ textDecoration: "none" }}>
              <button style={{ background: "transparent", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.12)", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", padding: "8px 18px", cursor: "pointer", transition: "all 0.3s" }}
                onMouseEnter={e => { e.currentTarget.style.color = "white"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)" }}
                onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.5)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)" }}>
                Login
              </button>
            </Link>
            <Link to="/register" style={{ textDecoration: "none" }}>
              <button style={{ background: "white", color: "black", border: "none", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", padding: "8px 18px", cursor: "pointer", transition: "opacity 0.3s" }}
                onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
                onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
                Join
              </button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
