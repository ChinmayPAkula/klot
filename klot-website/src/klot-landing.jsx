import { motion } from "framer-motion";
import { Circle, ArrowRight, Instagram, Twitter, ShoppingBag, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";

// ── API config ────────────────────────────────────────────────────────────────
const API = "http://localhost:8000/api";

async function apiFetch(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Something went wrong");
  return data;
}

function cn(...classes) { return classes.filter(Boolean).join(" "); }

// ── Floating shapes ───────────────────────────────────────────────────────────
function ElegantShape({ className, delay = 0, width = 400, height = 100, rotate = 0, gradient = "from-white/[0.08]" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -150, rotate: rotate - 15 }}
      animate={{ opacity: 1, y: 0, rotate }}
      transition={{ duration: 2.4, delay, ease: [0.23, 0.86, 0.39, 0.96], opacity: { duration: 1.2 } }}
      className={cn("absolute", className)}
    >
      <motion.div animate={{ y: [0, 15, 0] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        style={{ width, height }} className="relative">
        <div className={cn(
          "absolute inset-0 rounded-full bg-gradient-to-r to-transparent", gradient,
          "backdrop-blur-[2px] border-2 border-white/[0.06]",
          "after:absolute after:inset-0 after:rounded-full after:bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.08),transparent_70%)]"
        )} />
      </motion.div>
    </motion.div>
  );
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ message, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, []);
  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      style={{
        position: "fixed", bottom: 32, right: 32, zIndex: 999,
        background: type === "success" ? "rgba(255,255,255,0.06)" : "rgba(255,80,80,0.1)",
        border: `1px solid ${type === "success" ? "rgba(255,255,255,0.12)" : "rgba(255,80,80,0.2)"}`,
        backdropFilter: "blur(12px)", padding: "14px 20px",
        display: "flex", alignItems: "center", gap: 10, maxWidth: 340
      }}>
      {type === "success"
        ? <CheckCircle style={{ width: 14, height: 14, color: "rgba(255,255,255,0.6)", flexShrink: 0 }} />
        : <AlertCircle style={{ width: 14, height: 14, color: "rgba(255,100,100,0.8)", flexShrink: 0 }} />}
      <span style={{ color: type === "success" ? "rgba(255,255,255,0.6)" : "rgba(255,120,120,0.9)", fontSize: "0.75rem", letterSpacing: "0.05em" }}>
        {message}
      </span>
    </motion.div>
  );
}

// ── Navbar ────────────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <motion.nav initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
      style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        display: "flex", alignItems: "center", justifyContent: "space-between", padding: "24px 64px",
        background: scrolled ? "rgba(8,8,8,0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.05)" : "none",
        transition: "all 0.5s ease"
      }}>
      <span onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        style={{ fontFamily: "'Playfair Display', serif", letterSpacing: "0.3em", color: "white", fontSize: "1.1rem", fontWeight: 700, cursor: "pointer" }}>
        KLOT
      </span>
      <div style={{ display: "flex", gap: 40 }}>
        {[["Collections", "collections"], ["About", "about"], ["Contact", "contact"]].map(([label, id]) => (
          <button key={id} onClick={() => scrollTo(id)}
            style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", cursor: "pointer" }}
            onMouseEnter={e => e.target.style.color = "white"} onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.4)"}>
            {label}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <ShoppingBag style={{ width: 16, height: 16, color: "rgba(255,255,255,0.4)", cursor: "pointer" }} />
        <button onClick={() => scrollTo("collections")}
          style={{ border: "1px solid rgba(255,255,255,0.2)", color: "white", background: "transparent", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", padding: "8px 20px", cursor: "pointer" }}
          onMouseEnter={e => { e.currentTarget.style.background = "white"; e.currentTarget.style.color = "black"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "white"; }}>
          SHOP NOW
        </button>
      </div>
    </motion.nav>
  );
}

// ── Hero ──────────────────────────────────────────────────────────────────────
function HeroSection() {
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i) => ({ opacity: 1, y: 0, transition: { duration: 1, delay: 0.6 + i * 0.2, ease: [0.25, 0.4, 0.25, 1] } })
  };
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
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
        <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible" style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={() => scrollTo("collections")}
            style={{ display: "flex", alignItems: "center", gap: 12, background: "white", color: "black", fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", padding: "16px 32px", cursor: "pointer", border: "none", fontWeight: 600 }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.88"} onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
            Shop Collection <ArrowRight style={{ width: 14, height: 14 }} />
          </button>
          <button onClick={() => scrollTo("contact")}
            style={{ background: "transparent", color: "rgba(255,255,255,0.4)", fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", padding: "16px 32px", cursor: "pointer", border: "1px solid rgba(255,255,255,0.1)" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"; e.currentTarget.style.color = "white"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}>
            Contact Us
          </button>
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
  );
}

// ── Collections — live from API ───────────────────────────────────────────────
function CollectionsSection() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiFetch("/products/")
      .then(setProducts)
      .catch(() => setError("Couldn't load products. Is the backend running on port 8000?"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section id="collections" style={{ background: "#060606", padding: "112px 64px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }}
          style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 64 }}>
          <div>
            <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.6rem", letterSpacing: "0.35em", textTransform: "uppercase", marginBottom: 12 }}>— 2025</p>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2.5rem,5vw,4rem)", fontWeight: 700, color: "white", margin: 0 }}>Collections</h2>
          </div>
          <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "0.65rem", letterSpacing: "0.15em" }}>
            {loading ? "Loading..." : `${products.length} pieces`}
          </span>
        </motion.div>

        {error && (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <AlertCircle style={{ width: 24, height: 24, color: "rgba(255,100,100,0.5)", margin: "0 auto 16px", display: "block" }} />
            <p style={{ color: "rgba(255,100,100,0.6)", fontSize: "0.8rem" }}>{error}</p>
          </div>
        )}

        {loading && !error && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ height: 320, background: "rgba(255,255,255,0.03)", animation: "pulse 1.5s ease-in-out infinite", animationDelay: `${i * 0.1}s` }} />
            ))}
          </div>
        )}

        {!loading && !error && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, gridAutoRows: 320 }}>
            {products.map((product, i) => (
              <motion.div key={product.id}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: i * 0.08 }} viewport={{ once: true }}
                style={{ position: "relative", overflow: "hidden", cursor: "pointer", gridColumn: i === 0 ? "span 2" : "span 1", gridRow: i === 0 ? "span 2" : "span 1" }}>
                {product.image_url
                  ? <img src={product.image_url} alt={product.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(100%)", transition: "transform 0.7s ease" }}
                      onMouseEnter={e => e.target.style.transform = "scale(1.05)"}
                      onMouseLeave={e => e.target.style.transform = "scale(1)"} />
                  : <div style={{ width: "100%", height: "100%", background: "rgba(255,255,255,0.02)" }} />
                }
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(0,0,0,0.85) 0%,rgba(0,0,0,0.1) 50%,transparent 100%)" }} />
                <div style={{ position: "absolute", top: 16, left: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {product.tag && <span style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.6)", fontSize: "0.55rem", letterSpacing: "0.2em", textTransform: "uppercase", padding: "4px 12px" }}>{product.tag}</span>}
                  {product.stock === 0 && <span style={{ background: "rgba(255,60,60,0.1)", border: "1px solid rgba(255,60,60,0.2)", color: "rgba(255,100,100,0.7)", fontSize: "0.55rem", letterSpacing: "0.2em", textTransform: "uppercase", padding: "4px 12px" }}>Sold Out</span>}
                </div>
                <div style={{ position: "absolute", bottom: 20, left: 20, right: 20, display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
                  <div>
                    <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.55rem", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 4 }}>{product.collection}</p>
                    <h3 style={{ fontFamily: "'Playfair Display', serif", color: "white", fontSize: i === 0 ? "1.5rem" : "1rem", fontWeight: 700, margin: "0 0 4px" }}>{product.name}</h3>
                    <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8rem", margin: 0, fontWeight: 300 }}>£{product.price}</p>
                  </div>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap", justifyContent: "flex-end", maxWidth: 100 }}>
                    {product.sizes?.slice(0, 3).map(s => (
                      <span key={s} style={{ border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.4)", fontSize: "0.5rem", padding: "2px 5px" }}>{s}</span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ── About ─────────────────────────────────────────────────────────────────────
function AboutSection() {
  return (
    <section id="about" style={{ background: "#040404", padding: "128px 64px", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 100, alignItems: "center" }}>
        <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.9 }} viewport={{ once: true }}
          style={{ position: "relative" }}>
          <div style={{ aspectRatio: "3/4", overflow: "hidden" }}>
            <img src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80&auto=format&fit=crop" alt="KLOT atelier"
              style={{ width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(100%)" }} />
          </div>
          <div style={{ position: "absolute", bottom: -24, right: -24, width: 144, height: 144, border: "1px solid rgba(255,255,255,0.08)", zIndex: -1 }} />
          <div style={{ position: "absolute", bottom: 32, right: -40, background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.08)", padding: 20 }}>
            <p style={{ fontFamily: "'Playfair Display', serif", color: "white", fontSize: "2rem", fontWeight: 700, margin: 0 }}>08</p>
            <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", margin: "4px 0 0" }}>Years of craft</p>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.9, delay: 0.15 }} viewport={{ once: true }}>
          <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.6rem", letterSpacing: "0.35em", textTransform: "uppercase", marginBottom: 20 }}>— Our Story</p>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 700, color: "white", marginBottom: 32, lineHeight: 1.2 }}>
            Clothes that<br /><em>say nothing,<br />mean everything.</em>
          </h2>
          <p style={{ color: "rgba(255,255,255,0.38)", fontSize: "0.875rem", lineHeight: 1.9, marginBottom: 16, maxWidth: 420, fontWeight: 300 }}>
            KLOT was born from a single belief — that luxury doesn't announce itself. Rooted in restraint, we design garments that outlive trends. Each piece is crafted in limited runs, using fabrics sourced from heritage mills across Europe and Japan.
          </p>
          <p style={{ color: "rgba(255,255,255,0.22)", fontSize: "0.875rem", lineHeight: 1.9, marginBottom: 40, maxWidth: 420, fontWeight: 300 }}>
            No logos. No noise. Just form, weight, and drape — the three pillars of everything we make.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24, borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 32 }}>
            {[["Limited", "Each run is capped at 200 units"], ["Sustainable", "Carbon-neutral by 2026"], ["Handcrafted", "Stitched in Portugal"]].map(([title, sub]) => (
              <div key={title}>
                <p style={{ fontFamily: "'Playfair Display', serif", color: "white", fontSize: "1rem", fontWeight: 700, marginBottom: 6 }}>{title}</p>
                <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.7rem", lineHeight: 1.6, margin: 0 }}>{sub}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ── Contact — POST to /api/contact/submit ─────────────────────────────────────
function ContactSection({ onToast }) {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async () => {
    if (!form.name || !form.email || !form.message) { onToast("Please fill in name, email and message.", "error"); return; }
    setLoading(true);
    try {
      await apiFetch("/contact/submit", { method: "POST", body: JSON.stringify(form) });
      setDone(true);
      onToast("Message sent. We'll be in touch within 48 hours. 🖤", "success");
    } catch (err) { onToast(err.message, "error"); }
    finally { setLoading(false); }
  };

  const inp = { width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", color: "white", fontSize: "0.8rem", padding: "14px 18px", outline: "none", letterSpacing: "0.05em", boxSizing: "border-box", fontFamily: "inherit" };

  return (
    <section id="contact" style={{ background: "#060606", padding: "128px 64px", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }}>
          <p style={{ color: "rgba(255,255,255,0.2)", fontSize: "0.6rem", letterSpacing: "0.35em", textTransform: "uppercase", marginBottom: 16 }}>— Get In Touch</p>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2.5rem,5vw,3.5rem)", fontWeight: 700, color: "white", marginBottom: 12, lineHeight: 1.1 }}>Let's talk.</h2>
          <p style={{ color: "rgba(255,255,255,0.28)", fontSize: "0.875rem", marginBottom: 48, lineHeight: 1.8, fontWeight: 300 }}>
            Stockists, press, collaborations, or just a question — we read everything.
          </p>
          {done ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "60px 0", textAlign: "center" }}>
              <CheckCircle style={{ width: 32, height: 32, color: "rgba(255,255,255,0.4)" }} />
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.875rem", letterSpacing: "0.1em" }}>Message received. Talk soon.</p>
            </motion.div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <input name="name" placeholder="Your name" value={form.name} onChange={handle} style={inp}
                  onFocus={e => e.target.style.borderColor = "rgba(255,255,255,0.25)"} onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"} />
                <input name="email" type="email" placeholder="your@email.com" value={form.email} onChange={handle} style={inp}
                  onFocus={e => e.target.style.borderColor = "rgba(255,255,255,0.25)"} onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"} />
              </div>
              <input name="subject" placeholder="Subject (optional)" value={form.subject} onChange={handle} style={inp}
                onFocus={e => e.target.style.borderColor = "rgba(255,255,255,0.25)"} onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"} />
              <textarea name="message" placeholder="Your message..." value={form.message} onChange={handle} rows={5}
                style={{ ...inp, resize: "vertical" }}
                onFocus={e => e.target.style.borderColor = "rgba(255,255,255,0.25)"} onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"} />
              <button onClick={submit} disabled={loading}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, background: "white", color: "black", border: "none", fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", padding: "16px 32px", cursor: loading ? "not-allowed" : "pointer", fontWeight: 600, opacity: loading ? 0.7 : 1, alignSelf: "flex-start", marginTop: 4 }}>
                {loading ? <><Loader2 style={{ width: 14, height: 14, animation: "spin 1s linear infinite" }} /> Sending...</> : <>Send Message <ArrowRight style={{ width: 14, height: 14 }} /></>}
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}

// ── Newsletter — POST to /api/newsletter/signup ───────────────────────────────
function NewsletterSection({ onToast }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async () => {
    if (!email) return;
    setLoading(true);
    try {
      const res = await apiFetch("/newsletter/signup", { method: "POST", body: JSON.stringify({ email }) });
      setDone(true);
      onToast(res.message, "success");
    } catch (err) {
      onToast(err.message === "Email already subscribed." ? "Already on the list. 🖤" : err.message,
        err.message === "Email already subscribed." ? "success" : "error");
    } finally { setLoading(false); }
  };

  return (
    <section style={{ background: "#040404", padding: "128px 64px", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
      <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }}>
          <p style={{ color: "rgba(255,255,255,0.2)", fontSize: "0.6rem", letterSpacing: "0.35em", textTransform: "uppercase", marginBottom: 24 }}>— Stay Close</p>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2.5rem,5vw,3.5rem)", fontWeight: 700, color: "white", marginBottom: 16, lineHeight: 1.1 }}>
            First access.<br /><em>Always.</em>
          </h2>
          <p style={{ color: "rgba(255,255,255,0.28)", fontSize: "0.875rem", maxWidth: 340, margin: "0 auto 48px", lineHeight: 1.8, fontWeight: 300 }}>
            New drops sell out in hours. Join the inner circle — no spam, just early access.
          </p>
          {done ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, color: "rgba(255,255,255,0.45)", fontSize: "0.7rem", letterSpacing: "0.15em", textTransform: "uppercase" }}>
              <Circle style={{ width: 8, height: 8, fill: "rgba(255,255,255,0.4)", color: "rgba(255,255,255,0.4)" }} />
              You're in. Watch your inbox.
            </motion.div>
          ) : (
            <div style={{ display: "flex", gap: 8, maxWidth: 460, margin: "0 auto" }}>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com"
                onKeyDown={e => e.key === "Enter" && submit()}
                style={{ flex: 1, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", color: "white", fontSize: "0.8rem", padding: "16px 20px", outline: "none", letterSpacing: "0.05em" }}
                onFocus={e => e.target.style.borderColor = "rgba(255,255,255,0.25)"}
                onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"} />
              <button onClick={submit} disabled={loading}
                style={{ background: "white", color: "black", border: "none", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", padding: "16px 28px", cursor: loading ? "not-allowed" : "pointer", fontWeight: 600, whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 8, opacity: loading ? 0.7 : 1 }}>
                {loading ? <Loader2 style={{ width: 12, height: 12, animation: "spin 1s linear infinite" }} /> : "Join"}
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  return (
    <footer style={{ background: "#040404", borderTop: "1px solid rgba(255,255,255,0.05)", padding: "56px 64px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 40 }}>
        <div>
          <span style={{ fontFamily: "'Playfair Display', serif", letterSpacing: "0.25em", color: "white", fontSize: "1.1rem", fontWeight: 700 }}>KLOT</span>
          <p style={{ color: "rgba(255,255,255,0.18)", fontSize: "0.7rem", marginTop: 12, maxWidth: 240, lineHeight: 1.7 }}>High-end streetwear. Made for those who know.</p>
        </div>
        <div style={{ display: "flex", gap: 60, flexWrap: "wrap" }}>
          {[
            { heading: "Shop", links: [["New Arrivals", "collections"], ["Collections", "collections"]] },
            { heading: "Brand", links: [["About", "about"], ["Contact", "contact"]] },
            { heading: "Help", links: [["Returns", "contact"], ["Contact", "contact"]] }
          ].map(({ heading, links }) => (
            <div key={heading}>
              <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.55rem", letterSpacing: "0.28em", textTransform: "uppercase", marginBottom: 16 }}>{heading}</p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                {links.map(([label, id]) => (
                  <li key={label}>
                    <button onClick={() => scrollTo(id)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.2)", fontSize: "0.7rem", cursor: "pointer", padding: 0, letterSpacing: "0.05em" }}
                      onMouseEnter={e => e.target.style.color = "rgba(255,255,255,0.5)"}
                      onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.2)"}>{label}</button>
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
              <button key={i} style={{ width: 32, height: 32, border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", cursor: "pointer", color: "rgba(255,255,255,0.3)" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"; e.currentTarget.style.color = "white"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "rgba(255,255,255,0.3)"; }}>
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
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function KlotLanding() {
  const [toast, setToast] = useState(null);
  const showToast = (message, type = "success") => setToast({ message, type });

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    const style = document.createElement("style");
    style.textContent = `
      @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      @keyframes pulse { 0%,100% { opacity:0.3; } 50% { opacity:0.6; } }
      * { margin:0; padding:0; box-sizing:border-box; }
      body { background:#060606; }
      ::placeholder { color:rgba(255,255,255,0.2) !important; }
    `;
    document.head.appendChild(style);
  }, []);

  return (
    <div style={{ background: "#060606", minHeight: "100vh" }}>
      <Navbar />
      <HeroSection />
      <CollectionsSection />
      <AboutSection />
      <ContactSection onToast={showToast} />
      <NewsletterSection onToast={showToast} />
      <Footer />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
