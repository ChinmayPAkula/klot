export const API = "http://localhost:8000/api"

export async function apiFetch(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  })

  // 204 No Content — success with no body
  if (res.status === 204) return null

  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || "Something went wrong")
  return data
}