export const API = "http://localhost:8000/api"

export async function apiFetch(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || "Something went wrong")
  return data
}
