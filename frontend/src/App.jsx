import { useState } from 'react'
import { useAuth } from './context/AuthContext'
import LandingPage from './pages/LandingPage'
import AuthPage from './pages/AuthPage'
import Dashboard from './pages/Dashboard'
import Icon from './components/Icon'

export default function App() {
  const { user, loading, login } = useAuth()
  const [authMode, setAuthMode] = useState(null) // null=landing, 'signin', 'signup'

  if (loading) {
    return (
      <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ textAlign:'center' }}>
          <div style={{ width:52, height:52, borderRadius:14, background:'linear-gradient(135deg,var(--accent),var(--accent-dark))', margin:'0 auto 16px', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 6px 20px rgba(13,148,136,0.35)' }}>
            <Icon name="refresh" size={22} style={{ color:'white', animation:'spin 1s linear infinite' }} />
          </div>
          <p style={{ color:'var(--text-sub)', fontSize:16, margin:0 }}>Loading VidChat AI…</p>
        </div>
      </div>
    )
  }

  if (user) return <Dashboard />

  if (authMode) return (
    <AuthPage
      initialMode={authMode}
      onAuth={login}
      onBack={() => setAuthMode(null)}
    />
  )

  return <LandingPage onGetStarted={(mode) => setAuthMode(mode)} />
}
