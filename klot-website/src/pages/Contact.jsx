import { useState } from "react"
import { motion } from "framer-motion"
import { ArrowRight, CheckCircle, Loader2, Mail, MapPin, Clock } from "lucide-react"
import { apiFetch } from "../api"

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" })
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState(null)

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async () => {
    if (!form.name || !form.email || !form.message) { setError("Please fill in name, email and message."); return }
    setError(null)
    setLoading(true)
    try {
      await apiFetch("/contact/submit", { method: "POST", body: JSON.stringify(form) })
      setDone(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const inp = {
    width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)",
    color: "white", fontSize: "0.85rem", padding: "16px 20px", outline: "none",
    letterSpacing: "0.04em", boxSizing: "border-box", fontFamily: "inherit", transition: "border-color 0.3s"
  }

  return (
    <div style={{ paddingTop: 100, minHeight: "100vh", background: "#060606" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "60px 64px 120px" }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
          style={{ marginBottom: 80 }}>
          <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.6rem", letterSpacing: "0.35em", textTransform: "uppercase", marginBottom: 16 }}>— Reach Out</p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(3rem,7vw,6rem)", fontWeight: 700, color: "white", lineHeight: 0.9, margin: 0 }}>
            Let's<br /><em>talk.</em>
          </h1>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: 100, alignItems: "start" }}>

          {/* Left — info */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.1 }}>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.875rem", lineHeight: 1.9, marginBottom: 48, fontWeight: 300 }}>
              Stockists, press, collaborations, sizing questions, or just a note — we read everything and reply within 48 hours.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
              {[
                { Icon: Mail, label: "Email", value: "hello@klot.co" },
                { Icon: MapPin, label: "Studio", value: "Lisbon, Portugal" },
                { Icon: Clock, label: "Response time", value: "Within 48 hours" },
              ].map(({ Icon, label, value }) => (
                <div key={label} style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                  <div style={{ width: 36, height: 36, border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon style={{ width: 14, height: 14, color: "rgba(255,255,255,0.3)" }} />
                  </div>
                  <div>
                    <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.55rem", letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: 4 }}>{label}</p>
                    <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.85rem", margin: 0 }}>{value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Topics */}
            <div style={{ marginTop: 56, paddingTop: 40, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.55rem", letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 20 }}>Common Topics</p>
              {["Stockist enquiries", "Press & editorial", "Collaborations", "Returns & exchanges", "Sizing help"].map(topic => (
                <button key={topic} onClick={() => setForm(f => ({ ...f, subject: topic }))}
                  style={{ display: "block", background: "none", border: "none", color: "rgba(255,255,255,0.25)", fontSize: "0.8rem", cursor: "pointer", padding: "6px 0", textAlign: "left", transition: "color 0.3s", letterSpacing: "0.03em" }}
                  onMouseEnter={e => e.target.style.color = "white"}
                  onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.25)"}>
                  + {topic}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Right — form */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
            {done ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, padding: "100px 0", textAlign: "center" }}>
                <CheckCircle style={{ width: 40, height: 40, color: "rgba(255,255,255,0.4)" }} />
                <h3 style={{ fontFamily: "'Playfair Display', serif", color: "white", fontSize: "1.5rem", fontWeight: 700 }}>Message received.</h3>
                <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.875rem", fontWeight: 300 }}>We'll be in touch within 48 hours. 🖤</p>
              </motion.div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div>
                    <label style={{ display: "block", color: "rgba(255,255,255,0.25)", fontSize: "0.55rem", letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: 8 }}>Name</label>
                    <input name="name" placeholder="Your name" value={form.name} onChange={handle} style={inp}
                      onFocus={e => e.target.style.borderColor = "rgba(255,255,255,0.3)"}
                      onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"} />
                  </div>
                  <div>
                    <label style={{ display: "block", color: "rgba(255,255,255,0.25)", fontSize: "0.55rem", letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: 8 }}>Email</label>
                    <input name="email" type="email" placeholder="your@email.com" value={form.email} onChange={handle} style={inp}
                      onFocus={e => e.target.style.borderColor = "rgba(255,255,255,0.3)"}
                      onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"} />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", color: "rgba(255,255,255,0.25)", fontSize: "0.55rem", letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: 8 }}>Subject</label>
                  <input name="subject" placeholder="What's this about?" value={form.subject} onChange={handle} style={inp}
                    onFocus={e => e.target.style.borderColor = "rgba(255,255,255,0.3)"}
                    onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"} />
                </div>

                <div>
                  <label style={{ display: "block", color: "rgba(255,255,255,0.25)", fontSize: "0.55rem", letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: 8 }}>Message</label>
                  <textarea name="message" placeholder="Your message..." value={form.message} onChange={handle} rows={7}
                    style={{ ...inp, resize: "vertical" }}
                    onFocus={e => e.target.style.borderColor = "rgba(255,255,255,0.3)"}
                    onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"} />
                </div>

                {error && <p style={{ color: "rgba(255,100,100,0.7)", fontSize: "0.75rem", letterSpacing: "0.05em" }}>{error}</p>}

                <button onClick={submit} disabled={loading}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, background: "white", color: "black", border: "none", fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", padding: "18px 32px", cursor: loading ? "not-allowed" : "pointer", fontWeight: 600, opacity: loading ? 0.7 : 1, marginTop: 8 }}>
                  {loading
                    ? <><Loader2 style={{ width: 14, height: 14, animation: "spin 1s linear infinite" }} /> Sending...</>
                    : <>Send Message <ArrowRight style={{ width: 14, height: 14 }} /></>}
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
