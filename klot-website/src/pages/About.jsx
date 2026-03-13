import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"

export default function About() {
  return (
    <div style={{ paddingTop: 100, minHeight: "100vh", background: "#040404" }}>

      {/* Hero */}
      <section style={{ padding: "60px 64px 100px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 100, alignItems: "center" }}>

          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.9 }}
            style={{ position: "relative" }}>
            <div style={{ aspectRatio: "3/4", overflow: "hidden" }}>
              <img src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80&auto=format&fit=crop"
                alt="KLOT atelier" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(100%)" }} />
            </div>
            <div style={{ position: "absolute", bottom: -24, right: -24, width: 144, height: 144, border: "1px solid rgba(255,255,255,0.08)", zIndex: -1 }} />
            <div style={{ position: "absolute", top: -24, left: -24, width: 80, height: 80, border: "1px solid rgba(255,255,255,0.05)", zIndex: -1 }} />
            <div style={{ position: "absolute", bottom: 32, right: -40, background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.08)", padding: 20 }}>
              <p style={{ fontFamily: "'Playfair Display', serif", color: "white", fontSize: "2rem", fontWeight: 700, margin: 0 }}>08</p>
              <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", margin: "4px 0 0" }}>Years of craft</p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.9, delay: 0.15 }}>
            <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.6rem", letterSpacing: "0.35em", textTransform: "uppercase", marginBottom: 20 }}>— Our Story</p>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2.5rem,5vw,4rem)", fontWeight: 700, color: "white", marginBottom: 32, lineHeight: 1.1 }}>
              Clothes that<br /><em>say nothing,<br />mean everything.</em>
            </h1>
            <p style={{ color: "rgba(255,255,255,0.38)", fontSize: "0.9rem", lineHeight: 1.9, marginBottom: 20, fontWeight: 300 }}>
              KLOT was born from a single belief — that luxury doesn't announce itself. Rooted in restraint, we design garments that outlive trends. Each piece is crafted in limited runs, using fabrics sourced from heritage mills across Europe and Japan.
            </p>
            <p style={{ color: "rgba(255,255,255,0.22)", fontSize: "0.9rem", lineHeight: 1.9, marginBottom: 40, fontWeight: 300 }}>
              No logos. No noise. Just form, weight, and drape — the three pillars of everything we make.
            </p>
            <Link to="/collections" style={{ textDecoration: "none', display: 'inline-flex", alignItems: "center", gap: 10 }}>
              <button style={{ display: "flex", alignItems: "center", gap: 10, background: "white", color: "black", border: "none", fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", padding: "14px 28px", cursor: "pointer", fontWeight: 600 }}>
                Shop Collection <ArrowRight style={{ width: 14, height: 14 }} />
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section style={{ background: "#060606", padding: "100px 64px", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} viewport={{ once: true }}
            style={{ marginBottom: 60, textAlign: "center" }}>
            <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.6rem", letterSpacing: "0.35em", textTransform: "uppercase", marginBottom: 16 }}>— What We Stand For</p>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 700, color: "white" }}>The Pillars</h2>
          </motion.div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 1 }}>
            {[
              { num: "01", title: "Restraint", body: "We don't add until it's perfect. We remove until there's nothing left to take away. Every seam, every hem is a decision." },
              { num: "02", title: "Longevity", body: "Designed to outlast trends. Each piece should feel as relevant in ten years as it does today. That's the only standard we accept." },
              { num: "03", title: "Responsibility", body: "Limited runs mean less waste. Heritage mills mean better quality. Carbon-neutral production by 2026 means accountability." },
            ].map(({ num, title, body }, i) => (
              <motion.div key={num} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: i * 0.1 }} viewport={{ once: true }}
                style={{ padding: "48px 40px", border: "1px solid rgba(255,255,255,0.04)" }}>
                <p style={{ color: "rgba(255,255,255,0.15)", fontSize: "0.65rem", letterSpacing: "0.3em", marginBottom: 20 }}>{num}</p>
                <p style={{ fontFamily: "'Playfair Display', serif", color: "white", fontSize: "1.3rem", fontWeight: 700, marginBottom: 16 }}>{title}</p>
                <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.8rem", lineHeight: 1.8, margin: 0, fontWeight: 300 }}>{body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ background: "#040404", padding: "100px 64px", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 1 }}>
          {[["200", "Max units per drop"], ["08", "Years of craft"], ["12+", "Heritage mills"], ["100%", "Carbon neutral by 2026"]].map(([stat, label], i) => (
            <motion.div key={stat} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: i * 0.1 }} viewport={{ once: true }}
              style={{ padding: "48px 32px", border: "1px solid rgba(255,255,255,0.04)", textAlign: "center" }}>
              <p style={{ fontFamily: "'Playfair Display', serif", color: "white", fontSize: "2.5rem", fontWeight: 700, marginBottom: 8 }}>{stat}</p>
              <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.7rem", letterSpacing: "0.15em", textTransform: "uppercase", margin: 0 }}>{label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: "#060606", padding: "100px 64px", borderTop: "1px solid rgba(255,255,255,0.04)", textAlign: "center" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 700, color: "white", marginBottom: 16 }}>
            Ready to wear the silence?
          </h2>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.875rem", marginBottom: 40, fontWeight: 300 }}>
            Explore the current collection.
          </p>
          <Link to="/collections" style={{ textDecoration: "none" }}>
            <button style={{ display: "inline-flex", alignItems: "center", gap: 12, background: "white", color: "black", border: "none", fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", padding: "16px 40px", cursor: "pointer", fontWeight: 600 }}>
              Shop Now <ArrowRight style={{ width: 14, height: 14 }} />
            </button>
          </Link>
        </motion.div>
      </section>
    </div>
  )
}
