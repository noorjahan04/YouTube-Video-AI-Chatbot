import { useState } from 'react'
import Icon from './Icon'
import { useAuth } from '../context/AuthContext'

export default function Sidebar({ open, onClose, videos, currentVideo, page, stats, onSelectVideo, onGoHome, onToggleFavorite, onDeleteVideo }) {
  const { user, logout, theme, toggleTheme } = useAuth()
  const [search, setSearch] = useState('')

  const filtered = videos.filter(v =>
    !search || v.title?.toLowerCase().includes(search.toLowerCase()) || v.channelName?.toLowerCase().includes(search.toLowerCase())
  )

  // On desktop the sidebar is always visible (no close-on-select).
  // On mobile, selecting a video or tapping Home also closes the drawer.
  const isMobile = () => window.innerWidth < 1024
  const pick = (v) => { onSelectVideo(v); if (isMobile()) onClose() }
  const home = () => { onGoHome(); if (isMobile()) onClose() }

  return (
    <>
      {/* Backdrop — mobile only, shown while drawer is open */}
      {open && (
        <div onClick={onClose} className="sidebar-backdrop" style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:98, backdropFilter:'blur(2px)' }} />
      )}

      {/* Panel */}
      <div className={`sidebar-panel ${open ? 'sidebar-open' : ''}`} style={{
        position:'fixed', top:0, left:0,
        height: '100vh',
        width:'var(--sidebar-w)',
        background:'var(--bg-elevated)',
        borderRight:'1px solid var(--border)',
        display:'flex', flexDirection:'column',
        zIndex:99,
        boxShadow: open ? 'var(--shadow-xl)' : 'none',
        overflowY: 'hidden',
      }}>

        {/* Header */}
        <div style={{ padding:'22px 18px 16px', borderBottom:'1px solid var(--border)', flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:11, marginBottom:18 }}>
            <div style={{ width:38, height:38, borderRadius:10, background:'linear-gradient(135deg,var(--accent),var(--accent-dark))', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:'0 3px 10px rgba(13,148,136,0.3)' }}>
              <Icon name="youtube" size={18} style={{ color:'white' }} />
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontFamily:'var(--font-display)', fontSize:17, fontWeight:700, color:'var(--text)' }}>
                VidChat <span style={{ color:'var(--accent)', fontStyle:'italic' }}>AI</span>
              </div>
              <div style={{ fontSize:12, color:'var(--text-sub)' }}>Video intelligence</div>
            </div>
            <button onClick={onClose} className="sidebar-close-btn" style={{ background:'none', border:'none', color:'var(--text-sub)', cursor:'pointer', padding:6, display:'flex', borderRadius:8 }}>
              <Icon name="close" size={20} />
            </button>
          </div>

          <div style={{ position:'relative' }}>
            <Icon name="search" size={15} style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', color:'var(--text-sub)', pointerEvents:'none' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search videos…"
              style={{ width:'100%', padding:'10px 12px 10px 38px', borderRadius:10, border:'1px solid var(--border)', background:'var(--bg-input)', color:'var(--text)', fontSize:14, outline:'none' }} />
          </div>
        </div>

        {/* Stats */}
        <div style={{ padding:'14px 18px', borderBottom:'1px solid var(--border)', display:'flex', gap:10, flexShrink:0 }}>
          <div style={{ flex:1, background:'var(--accent-soft)', borderRadius:10, padding:'10px 12px', textAlign:'center', border:'1px solid var(--accent-soft-border)' }}>
            <div style={{ fontSize:20, fontWeight:800, color:'var(--accent)', fontFamily:'var(--font-mono)' }}>{stats.totalVideos}</div>
            <div style={{ fontSize:12, color:'var(--text-sub)', fontWeight:500 }}>Videos</div>
          </div>
          <div style={{ flex:1, background:'var(--gold-soft)', borderRadius:10, padding:'10px 12px', textAlign:'center', border:'1px solid rgba(217,119,6,0.2)' }}>
            <div style={{ fontSize:20, fontWeight:800, color:'var(--gold)', fontFamily:'var(--font-mono)' }}>{stats.favoriteVideos}</div>
            <div style={{ fontSize:12, color:'var(--text-sub)', fontWeight:500 }}>Favorites</div>
          </div>
        </div>

        {/* Home nav */}
        <div style={{ padding:'10px 12px 4px', flexShrink:0 }}>
          <button onClick={home} style={{ width:'100%', display:'flex', alignItems:'center', gap:11, padding:'11px 12px', borderRadius:10, border:'none', background: page==='home' ? 'var(--accent-soft)' : 'transparent', color: page==='home' ? 'var(--accent)' : 'var(--text-sub)', cursor:'pointer', fontSize:15, fontWeight: page==='home' ? 700 : 500, transition:'all 0.15s', textAlign:'left' }}>
            <Icon name="home" size={18} /> Home
          </button>
        </div>

        {/* Video list */}
        <div style={{ flex:1, overflowY:'auto', padding:'4px 10px 10px' }}>
          <div style={{ fontSize:12, fontWeight:700, color:'var(--text-faint)', padding:'10px 10px 6px', textTransform:'uppercase', letterSpacing:'0.08em' }}>Recent videos</div>

          {filtered.length === 0
            ? <div style={{ padding:'22px 10px', textAlign:'center', color:'var(--text-sub)', fontSize:14 }}>{search ? 'No videos match' : 'No videos yet'}</div>
            : filtered.map(v => (
              <div key={v._id} onClick={() => pick(v)}
                style={{ padding:'10px 11px', borderRadius:10, cursor:'pointer', marginBottom:3, background: currentVideo?._id===v._id ? 'var(--accent-soft)' : 'transparent', border:`1px solid ${currentVideo?._id===v._id ? 'var(--accent-soft-border)' : 'transparent'}`, transition:'all 0.15s' }}
                onMouseEnter={e => { if(currentVideo?._id!==v._id) e.currentTarget.style.background='var(--bg-input)' }}
                onMouseLeave={e => { if(currentVideo?._id!==v._id) e.currentTarget.style.background='transparent' }}>
                <div style={{ display:'flex', alignItems:'flex-start', gap:10 }}>
                  {v.thumbnail && <img src={v.thumbnail} alt="" style={{ width:48, height:32, borderRadius:6, objectFit:'cover', flexShrink:0 }} />}
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:13, fontWeight:600, color:'var(--text)', lineHeight:1.4, overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>{v.title}</div>
                    <div style={{ fontSize:12, color:'var(--text-sub)', marginTop:3 }}>{v.channelName}</div>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:3, flexShrink:0 }}>
                    <button onClick={e => { e.stopPropagation(); onToggleFavorite(v, e) }} style={{ background:'none', border:'none', cursor:'pointer', padding:4, color: v.isFavorite ? 'var(--gold)' : 'var(--text-faint)' }}>
                      <Icon name="star" size={14} />
                    </button>
                    <button onClick={e => { e.stopPropagation(); onDeleteVideo(v, e) }} style={{ background:'none', border:'none', cursor:'pointer', padding:4, color:'var(--text-faint)' }}>
                      <Icon name="trash" size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          }
        </div>

        {/* User footer */}
        <div style={{ padding:'14px 16px', paddingBottom:'max(14px, calc(14px + env(safe-area-inset-bottom)))', borderTop:'1px solid var(--border)', flexShrink:0, background:'var(--bg-elevated)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:11 }}>
            <div style={{ width:36, height:36, borderRadius:'50%', background:'linear-gradient(135deg,var(--accent),var(--accent-dark))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:700, color:'white', flexShrink:0, fontFamily:'var(--font-display)' }}>
              {user.name[0].toUpperCase()}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:14, fontWeight:600, color:'var(--text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user.name}</div>
              <div style={{ fontSize:12, color:'var(--text-sub)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user.email}</div>
            </div>
            <button onClick={toggleTheme} style={{ background:'none', border:'none', cursor:'pointer', padding:7, borderRadius:8, color:'var(--text-sub)', flexShrink:0 }}>
              <Icon name={theme==='dark' ? 'sun' : 'moon'} size={17} />
            </button>
            <button onClick={logout} style={{ background:'none', border:'none', cursor:'pointer', padding:7, borderRadius:8, color:'var(--text-sub)', flexShrink:0 }}>
              <Icon name="logout" size={17} />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        /* Mobile: sidebar is an off-canvas drawer */
        .sidebar-panel {
          transform: translateX(-100%);
          transition: transform 0.26s cubic-bezier(0.4,0,0.2,1);
          max-width: 86vw;
          height: 100vh;
          height: 100dvh;
        }
        .sidebar-panel.sidebar-open {
          transform: translateX(0);
        }
        .sidebar-close-btn { display: flex; }
        .sidebar-backdrop { display: block; }

        /* Desktop: sidebar is always visible, no backdrop, no close button */
        @media (min-width: 1024px) {
          .sidebar-panel {
            transform: translateX(0) !important;
            max-width: var(--sidebar-w);
            box-shadow: none !important;
          }
          .sidebar-close-btn { display: none; }
          .sidebar-backdrop { display: none !important; }
        }
      `}</style>
    </>
  )
}
