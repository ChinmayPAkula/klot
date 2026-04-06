import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { Circle, ArrowRight } from "lucide-react"
import { useEffect } from "react"

function cn(...classes) { return classes.filter(Boolean).join(" ") }

function ElegantShape({ className, delay = 0, width = 400, height = 100, rotate = 0, gradient = "from-white/[0.08]" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -150, rotate: rotate - 15 }}
      animate={{ opacity: 1, y: 0, rotate }}
      transition={{ duration: 2.4, delay, ease: [0.23, 0.86, 0.39, 0.96], opacity: { duration: 1.2 } }}
      className={cn("absolute", className)}>
      <motion.div animate={{ y: [0, 15, 0] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        style={{ width, height }} className="relative">
        <div className={cn("absolute inset-0 rounded-full bg-gradient-to-r to-transparent", gradient,
          "backdrop-blur-[2px] border-2 border-white/[0.06]",
          "after:absolute after:inset-0 after:rounded-full after:bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.08),transparent_70%)]")} />
      </motion.div>
    </motion.div>
  )
}

export default function Home() {
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i) => ({ opacity: 1, y: 0, transition: { duration: 1, delay: 0.6 + i * 0.2, ease: [0.25, 0.4, 0.25, 1] } })
  }

  return (
    <>
      {/* ── Hero ── */}
      <section style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", background: "#060606" }}>
        <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
          <ElegantShape delay={0.3} width={600} height={140} rotate={12} gradient="from-white/[0.05]" className="left-[-10%] top-[20%]" />
          <ElegantShape delay={0.5} width={500} height={120} rotate={-15} gradient="from-white/[0.03]" className="right-[-5%] top-[75%]" />
          <ElegantShape delay={0.4} width={300} height={80} rotate={-8} gradient="from-white/[0.04]" className="left-[10%] bottom-[10%]" />
          <ElegantShape delay={0.6} width={200} height={60} rotate={20} gradient="from-white/[0.03]" className="right-[20%] top-[15%]" />
          <ElegantShape delay={0.7} width={150} height={40} rotate={-25} gradient="from-white/[0.03]" className="left-[25%] top-[10%]" />
        </div>

        <div style={{ position: "relative", zIndex: 10, maxWidth: 900, margin: "0 auto", padding: "0 24px", textAlign: "center" }}>
          <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible"
            style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px", borderRadius: 9999, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", marginBottom: 48 }}>
            <Circle style={{ width: 6, height: 6, fill: "rgba(255,255,255,0.5)", color: "rgba(255,255,255,0.5)" }} />
            <span style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.45)", letterSpacing: "0.25em", textTransform: "uppercase" }}>SS 2025 Collection</span>
          </motion.div>

          <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
            <h1 style={{ marginBottom: 24, lineHeight: 0.9 }}>
              <span style={{ fontFamily: "'Playfair Display', serif", display: "block", fontSize: "clamp(3.5rem,10vw,7rem)", fontWeight: 700, color: "white", marginBottom: 4 }}>Wear the</span>
              <span style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", display: "block", fontSize: "clamp(3.5rem,10vw,7rem)", fontWeight: 700, background: "linear-gradient(135deg,#fff 0%,#666 60%,#2a2a2a 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Silence.</span>
            </h1>
          </motion.div>

          <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible">
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.875rem", lineHeight: 1.8, maxWidth: 400, margin: "0 auto 48px", fontWeight: 300 }}>
              Minimal forms. Luxurious fabrics. Designed for those who let the cloth speak.
            </p>
          </motion.div>

          <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible"
            style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/collections" style={{ textDecoration: "none" }}>
              <button style={{ display: "flex", alignItems: "center", gap: 12, background: "white", color: "black", fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", padding: "16px 32px", cursor: "pointer", border: "none", fontWeight: 600 }}
                onMouseEnter={e => e.currentTarget.style.opacity = "0.88"} onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
                Shop Collection <ArrowRight style={{ width: 14, height: 14 }} />
              </button>
            </Link>
            <Link to="/about" style={{ textDecoration: "none" }}>
              <button style={{ background: "transparent", color: "rgba(255,255,255,0.4)", fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", padding: "16px 32px", cursor: "pointer", border: "1px solid rgba(255,255,255,0.1)" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"; e.currentTarget.style.color = "white" }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "rgba(255,255,255,0.4)" }}>
                Our Story
              </button>
            </Link>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.2 }}
          style={{ position: "absolute", bottom: 40, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}
            style={{ width: 1, height: 40, background: "linear-gradient(to bottom,rgba(255,255,255,0.25),transparent)" }} />
          <span style={{ color: "rgba(255,255,255,0.15)", fontSize: "0.55rem", letterSpacing: "0.3em", textTransform: "uppercase" }}>Scroll</span>
        </motion.div>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,#060606 0%,transparent 40%,rgba(6,6,6,0.5) 100%)", pointerEvents: "none" }} />
      </section>

      {/* ── Featured strip ── */}
      <section style={{ background: "#040404", padding: "80px 64px", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 1 }}>
            {[
              ["Limited Runs", "Every piece capped at 200 units worldwide."],
              ["Heritage Fabrics", "Sourced from mills in Japan and Portugal."],
              ["Carbon Neutral", "We offset 100% of our production by 2026."]
            ].map(([title, sub]) => (
              <motion.div key={title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} viewport={{ once: true }}
                style={{ padding: "48px 40px", border: "1px solid rgba(255,255,255,0.04)" }}>
                <p style={{ fontFamily: "'Playfair Display', serif", color: "white", fontSize: "1.1rem", fontWeight: 700, marginBottom: 12 }}>{title}</p>
                <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.8rem", lineHeight: 1.7, margin: 0 }}>{sub}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Preview collections ── */}
      <section style={{ background: "#060606", padding: "100px 64px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }}
            style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 48 }}>
            <div>
              <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.6rem", letterSpacing: "0.35em", textTransform: "uppercase", marginBottom: 12 }}>— Featured</p>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 700, color: "white", margin: 0 }}>New This Season</h2>
            </div>
            <Link to="/collections" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8, color: "rgba(255,255,255,0.35)", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase" }}
              onMouseEnter={e => e.currentTarget.style.color = "white"}
              onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.35)"}>
              View All <ArrowRight style={{ width: 12, height: 12 }} />
            </Link>
          </motion.div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
            {[
              { img: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&q=80", name: "Shadow Hoodie", price: "₹180", col: "Void Series" },
              { img: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80", name: "Slate Bomber", price: "₹420", col: "Slate Form" },
              { img: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&q=80", name: "Obsidian Tee", price: "₹95", col: "Obsidian" },
            ].map((item, i) => (
              <motion.div key={item.name} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: i * 0.1 }} viewport={{ once: true }}>
                <Link to="/collections" style={{ textDecoration: "none", display: "block" }}>
                  <div style={{ position: "relative", overflow: "hidden", height: 380, cursor: "pointer" }}>
                    <img src={item.img} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(100%)", transition: "transform 0.6s ease" }}
                      onMouseEnter={e => e.target.style.transform = "scale(1.04)"}
                      onMouseLeave={e => e.target.style.transform = "scale(1)"} />
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(0,0,0,0.7) 0%,transparent 60%)" }} />
                    <div style={{ position: "absolute", bottom: 20, left: 20 }}>
                      <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.55rem", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 4 }}>{item.col}</p>
                      <p style={{ fontFamily: "'Playfair Display', serif", color: "white", fontSize: "1.1rem", fontWeight: 700, margin: "0 0 4px" }}>{item.name}</p>
                      <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8rem", margin: 0 }}>{item.price}</p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Newsletter strip ── */}
      <section style={{ background: "#040404", padding: "80px 64px", borderTop: "1px solid rgba(255,255,255,0.04)", textAlign: "center" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.8rem,3vw,2.5rem)", fontWeight: 700, color: "white", marginBottom: 12 }}>
            First access. <em>Always.</em>
          </h2>
          <p style={{ color: "rgba(255,255,255,0.28)", fontSize: "0.875rem", marginBottom: 32, fontWeight: 300 }}>
            Join the inner circle.
          </p>
          <div style={{ display: "flex", gap: 8, maxWidth: 420, margin: "0 auto" }}>
            <input type="email" placeholder="your@email.com"
              style={{ flex: 1, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", color: "white", fontSize: "0.8rem", padding: "14px 18px", outline: "none" }}
              onFocus={e => e.target.style.borderColor = "rgba(255,255,255,0.25)"}
              onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"} />
            <button style={{ background: "white", color: "black", border: "none", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", padding: "14px 24px", cursor: "pointer", fontWeight: 600 }}>
              Join
            </button>
          </div>
        </motion.div>
      </section>
    </>
  )
}
