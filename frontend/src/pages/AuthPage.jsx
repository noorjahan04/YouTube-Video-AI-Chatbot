import { useState } from 'react'
import { api } from '../lib/api'
import { useToast } from '../context/ToastContext'
import Icon from '../components/Icon'

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/

const passwordChecks = (password) => ([
  { label: 'At least 8 characters',   pass: password.length >= 8 },
  { label: 'One uppercase letter',    pass: /[A-Z]/.test(password) },
  { label: 'One lowercase letter',    pass: /[a-z]/.test(password) },
  { label: 'One number',              pass: /[0-9]/.test(password) },
])

export default function AuthPage({ initialMode = 'signin', onAuth, onBack }) {
  const [mode, setMode]         = useState(initialMode)
  const [form, setForm]         = useState({ name:'', email:'', password:'' })
  const [touched, setTouched]   = useState({ email:false, password:false })
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [showPass, setShowPass] = useState(false)
  const { toast } = useToast()

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  const blur   = e => setTouched(t => ({ ...t, [e.target.name]: true }))

  const emailValid = form.email.length === 0 || EMAIL_REGEX.test(form.email.trim())
  const checks = passwordChecks(form.password)
  const passwordValid = mode === 'signin' ? form.password.length > 0 : checks.every(c => c.pass)
  const canSubmit = form.email.trim().length > 0 && EMAIL_REGEX.test(form.email.trim())
    && passwordValid && (mode === 'signin' || form.name.trim().length > 0)

  const submit = async e => {
    e.preventDefault()
    setTouched({ email:true, password:true })
    if (!canSubmit) { setError('Please fix the highlighted fields before continuing.'); return }
    setLoading(true); setError('')
    try {
      const endpoint = mode === 'signup' ? '/auth/signup' : '/auth/signin'
      const payload  = mode === 'signup' ? { name:form.name.trim(), email:form.email.trim(), password:form.password } : { email:form.email.trim(), password:form.password }
      const data = await api.post(endpoint, payload)
      onAuth(data.token, data.user)
      toast(mode === 'signup' ? `Welcome, ${data.user.name}! 🎉` : `Welcome back, ${data.user.name}!`, 'success')
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight:'100vh', minHeight:'100dvh', display:'flex', fontFamily:'var(--font-body)' }}>
      {/* Left panel — branding (hidden on mobile) */}
      <div style={{ flex:1, background:'linear-gradient(145deg, #0f766e 0%, #0d9488 40%, #14b8a6 100%)', display:'flex', flexDirection:'column', justifyContent:'center', padding:'60px 56px', position:'relative', overflow:'hidden' }}
        className="auth-left-panel">
        <div style={{ position:'absolute', inset:0, background:'url("data:image/svg+xml,%3Csvg width=\'80\' height=\'80\' viewBox=\'0 0 80 80\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M50 50c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10zM10 10c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10S0 25.523 0 20s4.477-10 10-10z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")', pointerEvents:'none' }} />
        <div style={{ position:'relative' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:56 }}>
            <div style={{ width:42, height:42, borderRadius:12, background:'rgba(255,255,255,0.2)', backdropFilter:'blur(10px)', display:'flex', alignItems:'center', justifyContent:'center', border:'1px solid rgba(255,255,255,0.3)' }}>
              <Icon name="youtube" size={20} style={{ color:'white' }} />
            </div>
            <span style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:700, color:'white' }}>VidChat AI</span>
          </div>

          <h2 style={{ fontFamily:'var(--font-display)', fontSize:36, fontWeight:700, color:'white', lineHeight:1.2, marginBottom:20, letterSpacing:'-0.02em' }}>
            Learn from any video,<br />faster than ever.
          </h2>
          <p style={{ fontSize:17, color:'rgba(255,255,255,0.8)', lineHeight:1.7, marginBottom:44 }}>
            Chat with YouTube videos, generate AI notes, and understand complex topics in minutes — not hours.
          </p>

          {[
            { icon:'check', text:'Free forever — powered by Groq AI' },
            { icon:'check', text:'6 types of AI-generated notes' },
            { icon:'check', text:'Chat with any YouTube video' },
          ].map((item, i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
              <div style={{ width:22, height:22, borderRadius:'50%', background:'rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <Icon name="check" size={12} style={{ color:'white' }} />
              </div>
              <span style={{ color:'rgba(255,255,255,0.9)', fontSize:15 }}>{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div style={{ width:'100%', maxWidth:520, background:'var(--bg-elevated)', display:'flex', flexDirection:'column', justifyContent:'center', padding:'48px clamp(24px,5vw,56px)' }}>
        {/* Back button */}
        <button onClick={onBack} style={{ display:'flex', alignItems:'center', gap:8, background:'none', border:'none', color:'var(--text-sub)', cursor:'pointer', fontSize:14, fontWeight:600, marginBottom:40, padding:0, width:'fit-content', transition:'color 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.color='var(--text)'}
          onMouseLeave={e => e.currentTarget.style.color='var(--text-sub)'}>
          <Icon name="back" size={16} /> Back to home
        </button>

        {/* Mobile logo */}
        <div style={{ display:'none', alignItems:'center', gap:10, marginBottom:32 }} className="auth-mobile-logo">
          <div style={{ width:36, height:36, borderRadius:10, background:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Icon name="youtube" size={18} style={{ color:'white' }} />
          </div>
          <span style={{ fontFamily:'var(--font-display)', fontSize:20, fontWeight:700, color:'var(--text)' }}>VidChat <span style={{ color:'var(--accent)', fontStyle:'italic' }}>AI</span></span>
        </div>

        <h1 style={{ fontFamily:'var(--font-display)', color:'var(--text)', fontSize:'clamp(26px,4vw,34px)', fontWeight:700, marginBottom:8, letterSpacing:'-0.02em' }}>
          {mode === 'signup' ? 'Create your account' : 'Welcome back'}
        </h1>
        <p style={{ color:'var(--text-sub)', fontSize:16, marginBottom:36 }}>
          {mode === 'signup' ? 'Start learning from videos in minutes — free forever' : 'Sign in to your VidChat AI account'}
        </p>

        {error && (
          <div style={{ background:'var(--coral-soft)', border:'1px solid var(--coral)', borderRadius:'var(--radius-md)', padding:'12px 16px', marginBottom:20, color:'var(--coral)', fontSize:14, display:'flex', alignItems:'center', gap:10 }}>
            <span style={{ fontSize:16 }}>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:18 }}>
          {mode === 'signup' && (
            <div>
              <label style={{ display:'block', color:'var(--text)', fontSize:14, fontWeight:600, marginBottom:8 }}>Full name</label>
              <input name="name" value={form.name} onChange={handle} placeholder="Jordan Lee" required
                style={{ width:'100%', padding:'14px 16px', borderRadius:'var(--radius-md)', border:'1.5px solid var(--border)', background:'var(--bg-input)', color:'var(--text)', fontSize:15, outline:'none', transition:'all 0.2s', boxSizing:'border-box' }} />
            </div>
          )}

          <div>
            <label style={{ display:'block', color:'var(--text)', fontSize:14, fontWeight:600, marginBottom:8 }}>Email address</label>
            <input name="email" type="email" value={form.email} onChange={handle} onBlur={blur} placeholder="you@example.com" required
              style={{ width:'100%', padding:'14px 16px', borderRadius:'var(--radius-md)', border: `1.5px solid ${touched.email && !emailValid ? 'var(--coral)' : 'var(--border)'}`, background:'var(--bg-input)', color:'var(--text)', fontSize:15, outline:'none', transition:'all 0.2s', boxSizing:'border-box' }} />
            {touched.email && !emailValid && (
              <p style={{ color:'var(--coral)', fontSize:13, marginTop:6 }}>Please enter a valid email address</p>
            )}
          </div>

          <div>
            <label style={{ display:'block', color:'var(--text)', fontSize:14, fontWeight:600, marginBottom:8 }}>Password</label>
            <div style={{ position:'relative' }}>
              <input name="password" type={showPass?'text':'password'} value={form.password} onChange={handle} onBlur={blur}
                placeholder={mode === 'signup' ? 'Min. 8 characters' : 'Enter your password'} required minLength={mode === 'signup' ? 8 : undefined}
                style={{ width:'100%', padding:'14px 16px', paddingRight:50, borderRadius:'var(--radius-md)', border: `1.5px solid ${touched.password && !passwordValid ? 'var(--coral)' : 'var(--border)'}`, background:'var(--bg-input)', color:'var(--text)', fontSize:15, outline:'none', transition:'all 0.2s', boxSizing:'border-box' }} />
              <button type="button" onClick={() => setShowPass(!showPass)} style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'var(--text-sub)', cursor:'pointer', display:'flex', padding:4 }}>
                <Icon name={showPass?'eyeOff':'eye'} size={17} />
              </button>
            </div>

            {mode === 'signup' && (form.password.length > 0 || touched.password) && (
              <div style={{ marginTop:10, display:'flex', flexDirection:'column', gap:5 }}>
                {checks.map((c, i) => (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:8, fontSize:12.5, color: c.pass ? 'var(--accent)' : 'var(--text-sub)' }}>
                    <span style={{ width:14, height:14, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, background: c.pass ? 'var(--accent)' : 'transparent', border: c.pass ? 'none' : '1.5px solid var(--border)' }}>
                      {c.pass && <Icon name="check" size={9} style={{ color:'white' }} />}
                    </span>
                    {c.label}
                  </div>
                ))}
              </div>
            )}
          </div>

          <button type="submit" disabled={loading || (touched.email && touched.password && !canSubmit)}
            style={{ padding:'15px', borderRadius:'var(--radius-md)', border:'none', background: loading ? 'var(--accent-dark)' : (touched.email && touched.password && !canSubmit) ? 'var(--border)' : 'linear-gradient(135deg, var(--accent) 0%, var(--accent-dark) 100%)', color:'white', fontSize:16, fontWeight:700, cursor: (loading || (touched.email && touched.password && !canSubmit))?'default':'pointer', transition:'all 0.2s', boxShadow: loading?'none':'0 4px 16px rgba(13,148,136,0.35)', marginTop:4 }}>
            {loading ? 'One moment…' : mode === 'signup' ? 'Create account →' : 'Sign in →'}
          </button>
        </form>

        <p style={{ textAlign:'center', marginTop:28, fontSize:15, color:'var(--text-sub)' }}>
          {mode === 'signin' ? (
            <>New here? <button onClick={() => { setMode('signup'); setError('') }} style={{ background:'none', border:'none', color:'var(--accent)', cursor:'pointer', fontWeight:700, fontSize:15 }}>Create a free account</button></>
          ) : (
            <>Already have an account? <button onClick={() => { setMode('signin'); setError('') }} style={{ background:'none', border:'none', color:'var(--accent)', cursor:'pointer', fontWeight:700, fontSize:15 }}>Sign in</button></>
          )}
        </p>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .auth-left-panel { display: none !important; }
          .auth-mobile-logo { display: flex !important; }
        }
      `}</style>
    </div>
  )
}