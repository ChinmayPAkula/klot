import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google"
import { Eye, EyeOff, Loader2, ArrowRight } from "lucide-react"
import { useAuth } from "../context/AuthContext"

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

export default function Login() {
  const navigate = useNavigate()
  const { login, googleLogin } = useAuth()
  const [form, setForm] = useState({ email: "", password: "" })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async () => {
    if (!form.email || !form.password) { setError("Please fill in all fields."); return }
    setLoading(true); setError(null)
    try {
      await login(form.email, form.password)
      navigate("/")
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async (credentialResponse) => {
    setLoading(true); setError(null)
    try {
      await googleLogin(credentialResponse.credential)
      navigate("/")
    } catch (err) {
      setError("Google login failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const inp = {
    width: "100%", background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.1)", color: "white",
    fontSize: "0.875rem", padding: "14px 18px", outline: "none",
    letterSpacing: "0.04em", boxSizing: "border-box", fontFamily: "inherit"
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div style={{ minHeight: "100vh", background: "#060606", display: "flex", alignItems: "center", justifyContent: "center", padding: "100px 24px 60px" }}>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
          style={{ width: "100%", maxWidth: 420 }}>

          {/* Logo */}
          <Link to="/" style={{ textDecoration: "none", display: "block", textAlign: "center", marginBottom: 48 }}>
            <span style={{ fontFamily: "'Playfair Display', serif", letterSpacing: "0.3em", color: "white", fontSize: "1.4rem", fontWeight: 700 }}>KLOT</span>
          </Link>

          <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.6rem", letterSpacing: "0.35em", textTransform: "uppercase", textAlign: "center", marginBottom: 12 }}>— Welcome back</p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "2.2rem", fontWeight: 700, color: "white", textAlign: "center", marginBottom: 40, lineHeight: 1.1 }}>
            Sign In
          </h1>

          {/* Google button */}
          <div style={{ marginBottom: 24, display: "flex", justifyContent: "center" }}>
            <GoogleLogin
              onSuccess={handleGoogle}
              onError={() => setError("Google login failed.")}
              theme="filled_black"
              shape="rectangular"
              size="large"
              text="signin_with_google"
              width="380"
            />
          </div>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
            <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase" }}>or</span>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
          </div>

          {/* Email/password form */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <label style={{ display: "block", color: "rgba(255,255,255,0.25)", fontSize: "0.55rem", letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: 8 }}>Email</label>
              <input name="email" type="email" placeholder="your@email.com" value={form.email} onChange={handle}
                onKeyDown={e => e.key === "Enter" && submit()}
                style={inp}
                onFocus={e => e.target.style.borderColor = "rgba(255,255,255,0.3)"}
                onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"} />
            </div>

            <div>
              <label style={{ display: "block", color: "rgba(255,255,255,0.25)", fontSize: "0.55rem", letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: 8 }}>Password</label>
              <div style={{ position: "relative" }}>
                <input name="password" type={showPass ? "text" : "password"} placeholder="••••••••" value={form.password} onChange={handle}
                  onKeyDown={e => e.key === "Enter" && submit()}
                  style={{ ...inp, paddingRight: 48 }}
                  onFocus={e => e.target.style.borderColor = "rgba(255,255,255,0.3)"}
                  onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"} />
                <button onClick={() => setShowPass(!showPass)}
                  style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", padding: 0 }}>
                  {showPass ? <EyeOff style={{ width: 15, height: 15 }} /> : <Eye style={{ width: 15, height: 15 }} />}
                </button>
              </div>
            </div>

            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ color: "rgba(255,100,100,0.7)", fontSize: "0.75rem", letterSpacing: "0.04em" }}>
                {error}
              </motion.p>
            )}

            <button onClick={submit} disabled={loading}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, background: "white", color: "black", border: "none", fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", padding: "16px", cursor: loading ? "not-allowed" : "pointer", fontWeight: 600, opacity: loading ? 0.7 : 1, marginTop: 8 }}>
              {loading
                ? <><Loader2 style={{ width: 14, height: 14, animation: "spin 1s linear infinite" }} /> Signing in...</>
                : <>Sign In <ArrowRight style={{ width: 14, height: 14 }} /></>
              }
            </button>
          </div>

          <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.75rem", textAlign: "center", marginTop: 28 }}>
            Don't have an account?{" "}
            <Link to="/register" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none" }}
              onMouseEnter={e => e.target.style.color = "white"}
              onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.6)"}>
              Create one
            </Link>
          </p>
        </motion.div>
      </div>
    </GoogleOAuthProvider>
  )
}
