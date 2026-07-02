const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
const getToken = () => localStorage.getItem('vidchat_token')

async function request(method, path, body) {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
    body: body ? JSON.stringify(body) : undefined
  })
  const data = await res.json()
  if (!data.success) { const e = new Error(data.message || 'Request failed'); e.payload = data; throw e }
  return data
}

export const api = {
  post:   (path, body) => request('POST',   path, body),
  get:    (path)       => request('GET',    path),
  patch:  (path, body) => request('PATCH',  path, body),
  delete: (path)       => request('DELETE', path),
}
