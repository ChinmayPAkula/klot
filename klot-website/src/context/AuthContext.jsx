import { createContext, useContext, useState, useEffect } from "react"
import { apiFetch } from "../api"

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => sessionStorage.getItem("klot_token"))
  const [loading, setLoading] = useState(true)

  // Verify token on app load
  useEffect(() => {
    if (token) {
      apiFetch("/auth/me", {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      })
        .then(setUser)
        .catch(() => { setToken(null); sessionStorage.removeItem("klot_token") })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const saveSession = (token, user) => {
    setToken(token)
    setUser(user)
    sessionStorage.setItem("klot_token", token)
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    sessionStorage.removeItem("klot_token")
  }

  const register = async (name, email, password) => {
    const res = await apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password })
    })
    saveSession(res.token, res.user)
    return res.user
  }

  const login = async (email, password) => {
    const res = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    })
    saveSession(res.token, res.user)
    return res.user
  }

  const googleLogin = async (credential) => {
    const res = await apiFetch("/auth/google", {
      method: "POST",
      body: JSON.stringify({ credential })
    })
    saveSession(res.token, res.user)
    return res.user
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, googleLogin, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
