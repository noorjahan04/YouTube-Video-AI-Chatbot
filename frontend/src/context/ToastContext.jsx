import { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext(null)
export const useToast = () => useContext(ToastContext)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const toast = useCallback((msg, type = 'info') => {
    const id = Date.now() + Math.random()
    setToasts(p => [...p, { id, msg, type }])
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500)
  }, [])

  const bg = { success: 'var(--accent-strong)', error: 'var(--coral)', info: 'var(--violet)' }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div style={{ position:'fixed', bottom:20, right:16, left:16, zIndex:9999, display:'flex', flexDirection:'column', gap:8, alignItems:'flex-end', pointerEvents:'none' }}>
        {toasts.map(t => (
          <div key={t.id} style={{ padding:'11px 16px', borderRadius:10, fontSize:14, fontWeight:600, background: bg[t.type] || bg.info, color: t.type === 'success' ? 'var(--accent-contrast)' : '#fff', boxShadow:'var(--shadow-lg)', animation:'toastIn 0.25s ease', maxWidth:340, width:'100%' }}>
            {t.msg}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
