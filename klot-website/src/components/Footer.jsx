import { Link } from "react-router-dom"
import { Instagram, Twitter } from "lucide-react"

export default function Footer() {
  return (
    <footer style={{ background: "#040404", borderTop: "1px solid rgba(255,255,255,0.05)", padding: "56px 64px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 40 }}>
        <div>
          <Link to="/" style={{ textDecoration: "none" }}>
            <span style={{ fontFamily: "'Playfair Display', serif", letterSpacing: "0.25em", color: "white", fontSize: "1.1rem", fontWeight: 700 }}>KLOT</span>
          </Link>
          <p style={{ color: "rgba(255,255,255,0.18)", fontSize: "0.7rem", marginTop: 12, maxWidth: 240, lineHeight: 1.7 }}>
            High-end streetwear. Made for those who know.
          </p>
        </div>

        <div style={{ display: "flex", gap: 60, flexWrap: "wrap" }}>
          {[
            { heading: "Shop", links: [["New Arrivals", "/collections"], ["Collections", "/collections"]] },
            { heading: "Brand", links: [["About", "/about"], ["Contact", "/contact"]] },
            { heading: "Help", links: [["Returns", "/contact"], ["Sizing", "/contact"]] }
          ].map(({ heading, links }) => (
            <div key={heading}>
              <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.55rem", letterSpacing: "0.28em", textTransform: "uppercase", marginBottom: 16 }}>{heading}</p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                {links.map(([label, to]) => (
                  <li key={label}>
                    <Link to={to} style={{ color: "rgba(255,255,255,0.2)", fontSize: "0.7rem", textDecoration: "none", letterSpacing: "0.05em", transition: "color 0.3s" }}
                      onMouseEnter={e => e.target.style.color = "rgba(255,255,255,0.5)"}
                      onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.2)"}>
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.55rem", letterSpacing: "0.28em", textTransform: "uppercase" }}>Follow</p>
          <div style={{ display: "flex", gap: 12 }}>
            {[Instagram, Twitter].map((Icon, i) => (
              <button key={i} style={{ width: 32, height: 32, border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", cursor: "pointer", color: "rgba(255,255,255,0.3)", transition: "all 0.3s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"; e.currentTarget.style.color = "white" }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "rgba(255,255,255,0.3)" }}>
                <Icon style={{ width: 13, height: 13 }} />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "56px auto 0", paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.04)", display: "flex", justifyContent: "space-between" }}>
        <p style={{ color: "rgba(255,255,255,0.12)", fontSize: "0.6rem" }}>© 2025 KLOT. All rights reserved.</p>
        <p style={{ color: "rgba(255,255,255,0.12)", fontSize: "0.6rem" }}>Privacy · Terms · Cookies</p>
      </div>
    </footer>
  )
}
