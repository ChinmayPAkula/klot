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
      background: scrolled ? "rgba(6,6,6,0.97)" : "transparent",
      backdropFilter: scrolled ? "blur(16px)" : "none",
      WebkitBackdropFilter: scrolled ? "blur(16px)" : "none",
      borderBottom: scrolled ? "1px solid rgba(255,255,255,0.04)" : "none",
      boxShadow: scrolled ? "0 1px 40px rgba(0,0,0,0.8)" : "none",
      transition: "all 0.4s ease"
    }}>

      {/* Logo — bigger, bolder, more presence */}
      <Link to="/" style={{ textDecoration: "none" }}>
        <span style={{
          fontFamily: "'Playfair Display', serif",
          letterSpacing: "0.45em",
          color: "white",
          fontSize: "1.6rem",
          fontWeight: 900,
          textTransform: "uppercase",
          lineHeight: 1,
          userSelect: "none"
        }}>
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
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>

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

        {/* User — no border, just clean text + avatar */}
        {user ? (
          <div style={{ position: "relative" }}>
            <button onClick={() => setUserMenuOpen(!userMenuOpen)}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                background: "transparent", border: "none",
                color: "rgba(255,255,255,0.6)", cursor: "pointer",
                fontSize: "0.65rem", letterSpacing: "0.12em",
                transition: "color 0.3s", padding: 0
              }}
              onMouseEnter={e => e.currentTarget.style.color = "white"}
              onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.6)"}>
              {user.avatar
                ? <img src={user.avatar} alt={user.name} style={{ width: 24, height: 24, borderRadius: "50%", objectFit: "cover", opacity: 0.85 }} />
                : <User style={{ width: 15, height: 15 }} />
              }
              <span style={{ maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user.name.split(" ")[0]}
              </span>
              <ChevronDown style={{
                width: 11, height: 11, opacity: 0.4,
                transform: userMenuOpen ? "rotate(180deg)" : "rotate(0)",
                transition: "transform 0.3s"
              }} />
            </button>

            {/* Dropdown */}
            {userMenuOpen && (
              <div style={{
                position: "absolute", top: "calc(100% + 12px)", right: 0, minWidth: 180,
                background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.06)",
                padding: "8px 0", zIndex: 100,
                boxShadow: "0 16px 40px rgba(0,0,0,0.6)"
              }}>
                <div style={{ padding: "12px 18px", borderBottom: "1px solid rgba(255,255,255,0.05)", marginBottom: 4 }}>
                  <p style={{ color: "white", fontSize: "0.82rem", margin: "0 0 3px", fontWeight: 500 }}>{user.name}</p>
                  <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.65rem", margin: 0 }}>{user.email}</p>
                </div>
                <button onClick={handleLogout}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 10,
                    padding: "10px 18px", background: "none", border: "none",
                    color: "rgba(255,255,255,0.35)", fontSize: "0.7rem",
                    letterSpacing: "0.08em", cursor: "pointer", textAlign: "left",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.color = "white" }}
                  onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "rgba(255,255,255,0.35)" }}>
                  <LogOut style={{ width: 13, height: 13 }} /> Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <Link to="/login" style={{ textDecoration: "none" }}>
              <span style={{
                color: "rgba(255,255,255,0.4)", fontSize: "0.65rem",
                letterSpacing: "0.2em", textTransform: "uppercase",
                cursor: "pointer", transition: "color 0.3s"
              }}
                onMouseEnter={e => e.currentTarget.style.color = "white"}
                onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.4)"}>
                Login
              </span>
            </Link>
            <Link to="/register" style={{ textDecoration: "none" }}>
              <button style={{
                background: "transparent", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.2)",
                fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase",
                padding: "8px 20px", cursor: "pointer", transition: "opacity 0.3s", fontWeight: 600
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.5)"; e.currentTarget.style.color = "white" }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; e.currentTarget.style.color = "rgba(255,255,255,0.6)" }}>
                Join
              </button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
