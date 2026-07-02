import { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../lib/api'

const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [user, setUser]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [theme, setTheme] = useState('light')

  useEffect(() => {
    const token = localStorage.getItem('vidchat_token')
    const saved = localStorage.getItem('vidchat_user')
    if (token && saved) {
      try { const u = JSON.parse(saved); setUser(u); setTheme(u.preferences?.theme || 'light') } catch {}
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const login = (token, userData) => {
    localStorage.setItem('vidchat_token', token)
    localStorage.setItem('vidchat_user', JSON.stringify(userData))
    setUser(userData)
    setTheme(userData.preferences?.theme || 'light')
  }

  const logout = () => {
    localStorage.removeItem('vidchat_token')
    localStorage.removeItem('vidchat_user')
    setUser(null)
    setTheme('light')
  }

  const toggleTheme = async () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    if (user) {
      try {
        await api.patch('/user/preferences', { theme: next })
        const updated = { ...user, preferences: { ...user.preferences, theme: next } }
        setUser(updated)
        localStorage.setItem('vidchat_user', JSON.stringify(updated))
      } catch {}
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, theme, toggleTheme }}>
      {children}
    </AuthContext.Provider>
  )
}
