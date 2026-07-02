import { useState, useEffect, useRef } from 'react'
import { api } from '../lib/api'
import { useToast } from '../context/ToastContext'
import Icon from '../components/Icon'
import Sidebar from '../components/Sidebar'
import SimpleMarkdown from '../components/SimpleMarkdown'

const QUICK = ['What is this video about?','Summarize the key concepts','What are the main takeaways?','Generate interview questions','Explain the most complex topic','What examples were given?']
const NOTE_TYPES = [
  { id:'summary',   label:'Summary',       desc:'Concise overview' },
  { id:'detailed',  label:'Detailed notes', desc:'Full structured notes' },
  { id:'keypoints', label:'Key points',     desc:'Important points' },
  { id:'chapters',  label:'Chapter-wise',   desc:'Topic breakdowns' },
  { id:'interview', label:'Interview prep', desc:'Q&A format' },
  { id:'revision',  label:'Revision notes', desc:'Quick review' },
]

export default function Dashboard() {
  const { toast } = useToast()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [page, setPage]               = useState('home')
  const [videos, setVideos]           = useState([])
  const [currentVideo, setCurrentVideo] = useState(null)
  const [activeTab, setActiveTab]     = useState('chat')
  const [urlInput, setUrlInput]       = useState('')
  const [analyzing, setAnalyzing]     = useState(false)
  const [messages, setMessages]       = useState([])
  const [chatInput, setChatInput]     = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const chatEndRef                    = useRef(null)
  const [notes, setNotes]             = useState([])
  const [notesLoading, setNotesLoading] = useState(false)
  const [noteType, setNoteType]       = useState('summary')
  const [selectedNote, setSelectedNote] = useState(null)
  const [showNotesList, setShowNotesList] = useState(false)
  const [stats, setStats]             = useState({ totalVideos:0, favoriteVideos:0 })

  useEffect(() => { loadVideos(); loadStats() }, [])
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior:'smooth' }) }, [messages])
  useEffect(() => { if (currentVideo) { loadChat(); loadNotes() } }, [currentVideo])

  const loadVideos = async () => { try { const d = await api.get('/videos'); setVideos(d.videos) } catch {} }
  const loadStats  = async () => { try { const d = await api.get('/user/stats'); setStats(d.stats) } catch {} }
  const loadChat   = async () => { try { const d = await api.get(`/chat/${currentVideo._id}`); setMessages(d.messages||[]) } catch {} }
  const loadNotes  = async () => { try { const d = await api.get(`/notes/${currentVideo._id}`); setNotes(d.notes||[]) } catch {} }

  const goToVideo = v => { setCurrentVideo(v); setPage('video'); setActiveTab('chat'); setSelectedNote(null) }

  const analyzeVideo = async () => {
    if (!urlInput.trim()) return
    setAnalyzing(true)
    try {
      const data = await api.post('/videos/analyze', { url: urlInput.trim() })
      goToVideo(data.video); setUrlInput(''); loadVideos(); loadStats()
      toast(data.cached ? 'Video loaded from history!' : 'Video analyzed!', 'success')
    } catch (e) { toast(e.message, 'error') }
    finally { setAnalyzing(false) }
  }

  const sendMessage = async () => {
    if (!chatInput.trim() || chatLoading) return
    const q = chatInput.trim(); setChatInput('')
    setMessages(p => [...p, { role:'user', content:q, timestamp:new Date() }])
    setChatLoading(true)
    try {
      const data = await api.post(`/chat/${currentVideo._id}/message`, { question:q })
      setMessages(p => [...p, { role:'assistant', content:data.answer, timestamp:new Date() }])
    } catch (e) { toast(e.message, 'error'); setMessages(p => [...p, { role:'assistant', content:'Sorry, I ran into an error. Please try again.', timestamp:new Date() }]) }
    finally { setChatLoading(false) }
  }

  const generateNotes = async () => {
    setNotesLoading(true)
    try {
      const data = await api.post('/notes/generate', { videoId:currentVideo._id, type:noteType })
      setNotes(p => [data.notes, ...p]); setSelectedNote(data.notes); setShowNotesList(false)
      toast('Notes generated!', 'success')
    } catch (e) { toast(e.message, 'error') }
    finally { setNotesLoading(false) }
  }

  const toggleFavorite = async (video, e) => {
    e.stopPropagation()
    try {
      const data = await api.patch(`/videos/${video._id}/favorite`, {})
      setVideos(p => p.map(v => v._id===video._id ? {...v, isFavorite:data.isFavorite} : v))
      if (currentVideo?._id===video._id) setCurrentVideo(v => ({...v, isFavorite:data.isFavorite}))
      loadStats()
    } catch (e) { toast(e.message,'error') }
  }

  const deleteVideo = async (video, e) => {
    e.stopPropagation()
    if (!window.confirm('Remove this video from history?')) return
    try {
      await api.delete(`/videos/${video._id}`)
      setVideos(p => p.filter(v => v._id!==video._id))
      if (currentVideo?._id===video._id) { setCurrentVideo(null); setPage('home') }
      loadStats(); toast('Video removed','success')
    } catch (e) { toast(e.message,'error') }
  }

  const exportNote = note => {
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([note.content],{type:'text/plain'}))
    a.download = `${note.title||'notes'}.txt`; a.click(); toast('Exported!','success')
  }
  const copyText = text => navigator.clipboard.writeText(text).then(() => toast('Copied!','success'))

  return (
    <div style={{ display:'flex', height:'100vh', height:'100dvh', background:'var(--bg)', color:'var(--text)', overflow:'hidden', fontFamily:'var(--font-body)' }}>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} videos={videos} currentVideo={currentVideo} page={page} stats={stats} onSelectVideo={goToVideo} onGoHome={() => { setPage('home'); setCurrentVideo(null) }} onToggleFavorite={toggleFavorite} onDeleteVideo={deleteVideo} />

      <div className="dashboard-main" style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', minWidth:0, minHeight:0 }}>
        {/* Top bar */}
        <div style={{ height:'var(--topbar-h)', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', padding:'0 20px', gap:12, background:'var(--bg-elevated)', flexShrink:0, boxShadow:'var(--shadow-xs)' }}>
          <button onClick={() => setSidebarOpen(true)} className="hamburger-btn" style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-sub)', padding:8, borderRadius:8, display:'flex', flexShrink:0 }}>
            <Icon name="menu" size={22} />
          </button>

          {page==='video' && currentVideo ? (
            <>
              <button onClick={() => { setPage('home'); setCurrentVideo(null) }} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-sub)', padding:8, borderRadius:8, display:'flex', flexShrink:0 }}>
                <Icon name="back" size={19} />
              </button>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:15, fontWeight:700, color:'var(--text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{currentVideo.title}</div>
                <div style={{ fontSize:13, color:'var(--text-sub)' }}>{currentVideo.channelName}{currentVideo.duration ? ` · ${currentVideo.duration}` : ''}</div>
              </div>
              <a href={currentVideo.url} target="_blank" rel="noreferrer" style={{ color:'var(--text-sub)', display:'flex', padding:8, flexShrink:0, borderRadius:8 }}><Icon name="link" size={17} /></a>
              <button onClick={e => toggleFavorite(currentVideo,e)} style={{ background:'none', border:'none', cursor:'pointer', padding:8, borderRadius:8, color: currentVideo.isFavorite?'var(--gold)':'var(--text-sub)', flexShrink:0 }}>
                <Icon name="star" size={19} />
              </button>
            </>
          ) : (
            <>
              <span style={{ flex:1, fontFamily:'var(--font-display)', fontSize:19, fontWeight:700, color:'var(--text)' }}>Dashboard</span>
              <div style={{ width:32, height:32, borderRadius:9, background:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Icon name="youtube" size={16} style={{ color:'var(--accent-contrast)' }} />
              </div>
            </>
          )}
        </div>

        {/* Content */}
        {page==='home'
          ? <HomeView videos={videos} urlInput={urlInput} setUrlInput={setUrlInput} analyzing={analyzing} analyzeVideo={analyzeVideo} onSelectVideo={goToVideo} onToggleFavorite={toggleFavorite} onDeleteVideo={deleteVideo} />
          : <VideoView activeTab={activeTab} setActiveTab={setActiveTab} currentVideo={currentVideo}
              messages={messages} chatInput={chatInput} setChatInput={setChatInput} chatLoading={chatLoading} sendMessage={sendMessage} chatEndRef={chatEndRef} copyText={copyText}
              notes={notes} notesLoading={notesLoading} noteType={noteType} setNoteType={setNoteType} selectedNote={selectedNote} setSelectedNote={setSelectedNote} showNotesList={showNotesList} setShowNotesList={setShowNotesList} generateNotes={generateNotes} exportNote={exportNote} />
        }
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .dashboard-main { margin-left: var(--sidebar-w); }
          .hamburger-btn { display: none !important; }
        }
      `}</style>
    </div>
  )
}

function HomeView({ videos, urlInput, setUrlInput, analyzing, analyzeVideo, onSelectVideo, onToggleFavorite, onDeleteVideo }) {
  return (
    <div style={{ flex:1, overflowY:'auto', padding:'32px 24px 48px' }}>
      <div style={{ maxWidth:760, margin:'0 auto' }}>
        <div style={{ marginBottom:28 }}>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(24px,5vw,34px)', fontWeight:700, color:'var(--text)', marginBottom:8, lineHeight:1.2, letterSpacing:'-0.02em' }}>What are you watching today?</h1>
          <p style={{ color:'var(--text-sub)', fontSize:16 }}>Paste a YouTube link and start a conversation with it</p>
        </div>

        <div style={{ background:'var(--bg-card)', borderRadius:'var(--radius-xl)', padding:22, border:'1px solid var(--border)', boxShadow:'var(--shadow-md)', marginBottom:28 }}>
          <div style={{ display:'flex', gap:12, alignItems:'center' }}>
            <Icon name="youtube" size={22} style={{ color:'#ff5c4d', flexShrink:0 }} />
            <input value={urlInput} onChange={e => setUrlInput(e.target.value)} onKeyDown={e => e.key==='Enter' && analyzeVideo()} placeholder="https://www.youtube.com/watch?v=…" style={{ flex:1, minWidth:0, background:'transparent', border:'none', color:'var(--text)', fontSize:16, outline:'none' }} />
          </div>
          <button onClick={analyzeVideo} disabled={analyzing||!urlInput.trim()}
            style={{ width:'100%', marginTop:14, padding:'13px', borderRadius:12, border:'none', background: analyzing||!urlInput.trim() ? 'var(--border-strong)' : 'linear-gradient(135deg, var(--accent), var(--accent-dark))', color: analyzing||!urlInput.trim() ? 'var(--text-faint)' : 'white', fontSize:15, fontWeight:700, cursor: analyzing||!urlInput.trim()?'default':'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, transition:'all 0.2s', boxShadow: analyzing||!urlInput.trim() ? 'none' : '0 4px 14px rgba(13,148,136,0.3)' }}>
            {analyzing ? <><Icon name="refresh" size={15} style={{ animation:'spin 1s linear infinite' }} /> Analyzing…</> : <><Icon name="sparkles" size={15} /> Analyze Video</>}
          </button>
          {analyzing && <div style={{ marginTop:12, padding:'10px 14px', background:'var(--accent-soft)', borderRadius:10, fontSize:14, color:'var(--accent)', fontWeight:500 }}>Extracting transcript and generating AI summary…</div>}
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:14, marginBottom:32 }}>
          {[{icon:'chat',title:'AI chat',desc:'Ask anything about the video',color:'#0d9488'},{icon:'notes',title:'Smart notes',desc:'6 types of AI notes',color:'#7c3aed'},{icon:'brain',title:'Learn faster',desc:'Key points & interview prep',color:'#d97706'}].map(f => (
            <div key={f.title} style={{ background:'var(--bg-card)', borderRadius:'var(--radius-lg)', padding:18, border:'1px solid var(--border)', boxShadow:'var(--shadow-xs)', transition:'all 0.2s' }}>
              <div style={{ width:40, height:40, borderRadius:11, background:`${f.color}14`, border:`1px solid ${f.color}30`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:12, color:f.color }}><Icon name={f.icon} size={19} /></div>
              <div style={{ fontSize:15, fontWeight:700, color:'var(--text)', marginBottom:4, fontFamily:'var(--font-display)' }}>{f.title}</div>
              <div style={{ fontSize:13, color:'var(--text-sub)', lineHeight:1.5 }}>{f.desc}</div>
            </div>
          ))}
        </div>

        {videos.length > 0 && (
          <>
            <h3 style={{ fontSize:17, fontWeight:700, color:'var(--text)', marginBottom:14, display:'flex', alignItems:'center', gap:9, fontFamily:'var(--font-display)' }}>
              <Icon name="clock" size={17} style={{ color:'var(--text-sub)' }} /> Recent videos
            </h3>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {videos.slice(0,6).map(v => (
                <div key={v._id} onClick={() => onSelectVideo(v)}
                  style={{ background:'var(--bg-card)', borderRadius:'var(--radius-lg)', padding:14, border:'1px solid var(--border)', cursor:'pointer', display:'flex', alignItems:'center', gap:14, boxShadow:'var(--shadow-xs)', transition:'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor='var(--accent)'; e.currentTarget.style.transform='translateY(-1px)'; e.currentTarget.style.boxShadow='var(--shadow-sm)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='var(--shadow-xs)' }}>
                  {v.thumbnail && <img src={v.thumbnail} alt="" style={{ width:84, height:56, borderRadius:9, objectFit:'cover', flexShrink:0 }} />}
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:15, fontWeight:600, color:'var(--text)', marginBottom:4, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{v.title}</div>
                    <div style={{ fontSize:13, color:'var(--text-sub)' }}>{v.channelName}{v.duration?` · ${v.duration}`:''}</div>
                  </div>
                  <div style={{ display:'flex', gap:4, flexShrink:0 }}>
                    <button onClick={e => onToggleFavorite(v,e)} style={{ background:'none', border:'none', cursor:'pointer', padding:8, color: v.isFavorite?'var(--gold)':'var(--text-faint)', borderRadius:8 }}><Icon name="star" size={17} /></button>
                    <button onClick={e => onDeleteVideo(v,e)} style={{ background:'none', border:'none', cursor:'pointer', padding:8, color:'var(--text-faint)', borderRadius:8 }}><Icon name="trash" size={17} /></button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function VideoView({ activeTab, setActiveTab, currentVideo, messages, chatInput, setChatInput, chatLoading, sendMessage, chatEndRef, copyText, notes, notesLoading, noteType, setNoteType, selectedNote, setSelectedNote, showNotesList, setShowNotesList, generateNotes, exportNote }) {
  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', minHeight:0 }}>
      <div style={{ display:'flex', borderBottom:'1px solid var(--border)', background:'var(--bg-elevated)', flexShrink:0, padding:'0 12px' }}>
        {[{id:'chat',icon:'chat',label:'Chat'},{id:'notes',icon:'notes',label:'Notes'},{id:'summary',icon:'sparkles',label:'Overview'}].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            style={{ flex:1, maxWidth:160, padding:'15px 10px', border:'none', background:'transparent', cursor:'pointer', borderBottom: activeTab===t.id?'2.5px solid var(--accent)':'2.5px solid transparent', color: activeTab===t.id?'var(--accent)':'var(--text-sub)', fontSize:15, fontWeight: activeTab===t.id?700:500, display:'flex', alignItems:'center', justifyContent:'center', gap:7, transition:'all 0.15s' }}>
            <Icon name={t.icon} size={17} /> {t.label}
          </button>
        ))}
      </div>
      {activeTab==='chat'    && <ChatTab messages={messages} chatInput={chatInput} setChatInput={setChatInput} chatLoading={chatLoading} sendMessage={sendMessage} chatEndRef={chatEndRef} copyText={copyText} />}
      {activeTab==='notes'   && <NotesTab notes={notes} notesLoading={notesLoading} noteType={noteType} setNoteType={setNoteType} selectedNote={selectedNote} setSelectedNote={setSelectedNote} showNotesList={showNotesList} setShowNotesList={setShowNotesList} generateNotes={generateNotes} exportNote={exportNote} copyText={copyText} />}
      {activeTab==='summary' && <OverviewTab currentVideo={currentVideo} />}
    </div>
  )
}

function ChatTab({ messages, chatInput, setChatInput, chatLoading, sendMessage, chatEndRef, copyText }) {
  return (
    <div style={{ flex:1, overflow:'hidden', minHeight:0, position:'relative', display:'flex', flexDirection:'column' }}>

      {/* Scrollable messages area */}
      <div style={{ flex:1, overflowY:'auto', WebkitOverflowScrolling:'touch' }}>
        <div style={{ padding:'16px 14px 4px' }}>
          {messages.length === 0 ? (
            <div style={{ textAlign:'center', padding:'32px 16px' }}>
              <div style={{ width:56, height:56, borderRadius:18, background:'var(--accent-soft)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', color:'var(--accent)' }}>
                <Icon name="chat" size={26} />
              </div>
              <h3 style={{ fontFamily:'var(--font-display)', fontSize:18, fontWeight:700, color:'var(--text)', marginBottom:8 }}>Ask anything about this video</h3>
              <p style={{ fontSize:14, color:'var(--text-sub)', maxWidth:300, margin:'0 auto 20px' }}>I've read the full transcript and I'm ready to help.</p>
              <div style={{ display:'flex', flexWrap:'wrap', gap:8, justifyContent:'center' }}>
                {QUICK.map(p => (
                  <button key={p} onClick={() => setChatInput(p)} style={{ padding:'8px 14px', borderRadius:'var(--radius-full)', border:'1px solid var(--border)', background:'var(--bg-card)', color:'var(--text)', fontSize:13, cursor:'pointer' }}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ maxWidth:760, margin:'0 auto', display:'flex', flexDirection:'column', gap:16 }}>
              {messages.map((msg, i) => (
                <div key={i} style={{ display:'flex', flexDirection:'column', alignItems: msg.role==='user' ? 'flex-end' : 'flex-start', animation:'fadeUp 0.25s ease' }}>
                  {msg.role === 'assistant' && (
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                      <div style={{ width:24, height:24, borderRadius:8, background:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <Icon name="sparkles" size={12} style={{ color:'var(--accent-contrast)' }} />
                      </div>
                      <span style={{ fontSize:13, fontWeight:700, color:'var(--accent)' }}>VidChat AI</span>
                    </div>
                  )}
                  <div style={{ maxWidth:'86%', padding:'13px 16px', borderRadius: msg.role==='user' ? '18px 18px 4px 18px' : '4px 18px 18px 18px', background: msg.role==='user' ? 'var(--msg-user)' : 'var(--msg-ai)', border:`1px solid ${msg.role==='user' ? 'var(--accent-soft-border)' : 'var(--border)'}`, boxShadow:'var(--shadow-xs)' }}>
                    {msg.role === 'assistant'
                      ? <SimpleMarkdown content={msg.content} color="var(--text)" />
                      : <p style={{ margin:0, fontSize:15, lineHeight:1.65, color:'var(--text)' }}>{msg.content}</p>}
                  </div>
                  {msg.role === 'assistant' && (
                    <button onClick={() => copyText(msg.content)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-faint)', display:'flex', alignItems:'center', gap:4, fontSize:12, marginTop:6, padding:'2px 6px' }}>
                      <Icon name="copy" size={12} /> Copy
                    </button>
                  )}
                </div>
              ))}
              {chatLoading && (
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ width:24, height:24, borderRadius:8, background:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <Icon name="sparkles" size={12} style={{ color:'var(--accent-contrast)' }} />
                  </div>
                  <div style={{ padding:'13px 16px', borderRadius:'4px 18px 18px 18px', background:'var(--msg-ai)', border:'1px solid var(--border)', display:'flex', gap:5, alignItems:'center' }}>
                    {[0,1,2].map(d => (
                      <div key={d} style={{ width:7, height:7, borderRadius:'50%', background:'var(--accent)', animation:`pulse 1.2s ease-in-out ${d*0.2}s infinite` }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          )}
        </div>

        {/* Input bar INSIDE the scroll container, sticky to bottom viewport */}
        <div style={{
          position:'sticky',
          bottom:0,
          background:'var(--bg-elevated)',
          borderTop:'1px solid var(--border)',
          padding:'12px 14px',
          paddingBottom:'max(14px, env(safe-area-inset-bottom, 14px))',
          zIndex:10,
        }}>
          <div style={{ maxWidth:760, margin:'0 auto' }}>
            {messages.length > 0 && (
              <div style={{ display:'flex', gap:6, marginBottom:10, flexWrap:'wrap' }}>
                {QUICK.slice(0, 3).map(p => (
                  <button key={p} onClick={() => setChatInput(p)} style={{ padding:'5px 12px', borderRadius:'var(--radius-full)', border:'1px solid var(--border)', background:'transparent', color:'var(--text-sub)', fontSize:12, cursor:'pointer' }}>
                    {p}
                  </button>
                ))}
              </div>
            )}
            <div style={{ display:'flex', gap:10, alignItems:'flex-end' }}>
              <textarea
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                placeholder="Ask anything… (Enter to send)"
                rows={1}
                style={{ flex:1, padding:'12px 16px', borderRadius:'var(--radius-lg)', border:'1.5px solid var(--border)', background:'var(--bg-input)', color:'var(--text)', fontSize:15, resize:'none', maxHeight:120, lineHeight:1.55, fontFamily:'inherit', outline:'none', boxSizing:'border-box' }}
                onInput={e => { e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'; }}
              />
              <button
                onClick={sendMessage}
                disabled={chatLoading || !chatInput.trim()}
                style={{ width:46, height:46, borderRadius:'var(--radius-md)', border:'none', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', cursor: chatLoading || !chatInput.trim() ? 'default' : 'pointer', transition:'all 0.2s', background: chatLoading || !chatInput.trim() ? 'var(--border-strong)' : 'var(--accent)', color: chatLoading || !chatInput.trim() ? 'var(--text-faint)' : 'var(--accent-contrast)', boxShadow: chatLoading || !chatInput.trim() ? 'none' : '0 3px 10px rgba(13,148,136,0.3)' }}
              >
                <Icon name="send" size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function NotesTab({ notes, notesLoading, noteType, setNoteType, selectedNote, setSelectedNote, showNotesList, setShowNotesList, generateNotes, exportNote, copyText }) {
  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
      <div style={{ padding:'10px 12px', borderBottom:'1px solid var(--border)', background:'var(--bg-elevated)', flexShrink:0 }}>
        <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
          <select value={noteType} onChange={e => setNoteType(e.target.value)}
            style={{ flex:1, minWidth:130, padding:'9px 12px', borderRadius:8, border:'1px solid var(--border)', background:'var(--bg-input)', color:'var(--text)', fontSize:13, cursor:'pointer', outline:'none' }}>
            {NOTE_TYPES.map(n => <option key={n.id} value={n.id}>{n.label}</option>)}
          </select>
          <button onClick={generateNotes} disabled={notesLoading}
            style={{ padding:'9px 16px', borderRadius:8, border:'none', background:'var(--accent)', color:'var(--accent-contrast)', fontSize:13, fontWeight:700, cursor: notesLoading?'default':'pointer', display:'flex', alignItems:'center', gap:6, flexShrink:0, whiteSpace:'nowrap' }}>
            {notesLoading ? <><Icon name="refresh" size={13} style={{ animation:'spin 1s linear infinite' }} /> Generating…</> : <><Icon name="sparkles" size={13} /> Generate</>}
          </button>
          {notes.length>0 && (
            <button onClick={() => setShowNotesList(!showNotesList)}
              style={{ padding:'9px 12px', borderRadius:8, border:'1px solid var(--border)', background: showNotesList?'var(--accent-soft)':'transparent', color: showNotesList?'var(--accent)':'var(--text-sub)', fontSize:13, cursor:'pointer', display:'flex', alignItems:'center', gap:5, flexShrink:0 }}>
              <Icon name="fileText" size={14} /> Saved ({notes.length})
            </button>
          )}
        </div>
      </div>

      <div style={{ flex:1, display:'flex', overflow:'hidden', position:'relative' }}>
        {showNotesList && (
          <div style={{ position:'absolute', top:0, left:0, bottom:0, width:'min(280px,90%)', background:'var(--bg-elevated)', borderRight:'1px solid var(--border)', zIndex:10, overflowY:'auto', animation:'slideInLeft 0.22s ease', padding:8 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'6px 8px 10px' }}>
              <span style={{ fontSize:12, fontWeight:700, color:'var(--text-sub)', textTransform:'uppercase', letterSpacing:'0.06em' }}>Saved notes</span>
              <button onClick={() => setShowNotesList(false)} style={{ background:'none', border:'none', color:'var(--text-sub)', cursor:'pointer', display:'flex' }}><Icon name="close" size={16} /></button>
            </div>
            {notes.map(n => (
              <button key={n._id} onClick={() => { setSelectedNote(n); setShowNotesList(false) }}
                style={{ width:'100%', padding:'10px', borderRadius:8, border:`1px solid ${selectedNote?._id===n._id?'var(--accent)':'transparent'}`, background: selectedNote?._id===n._id?'var(--accent-soft)':'transparent', color:'var(--text)', cursor:'pointer', textAlign:'left', fontSize:12, marginBottom:2 }}>
                <div style={{ fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{n.title}</div>
                <div style={{ color:'var(--text-sub)', fontSize:11, marginTop:2 }}>{new Date(n.createdAt).toLocaleDateString()}</div>
              </button>
            ))}
          </div>
        )}

        {selectedNote ? (
          <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
            <div style={{ padding:'11px 14px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:8, flexShrink:0, flexWrap:'wrap' }}>
              <h3 style={{ flex:1, fontSize:13, fontWeight:700, color:'var(--text)', margin:0, minWidth:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{selectedNote.title}</h3>
              <button onClick={() => copyText(selectedNote.content)} style={{ background:'none', border:'1px solid var(--border)', borderRadius:7, padding:'5px 10px', color:'var(--text-sub)', fontSize:12, cursor:'pointer', display:'flex', alignItems:'center', gap:4 }}><Icon name="copy" size={12} /> Copy</button>
              <button onClick={() => exportNote(selectedNote)} style={{ background:'var(--accent)', border:'none', borderRadius:7, padding:'5px 10px', color:'var(--accent-contrast)', fontSize:12, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', gap:4 }}><Icon name="download" size={12} /> Export</button>
            </div>
            <div style={{ flex:1, overflowY:'auto', padding:'16px 14px' }}>
              <div style={{ maxWidth:720, margin:'0 auto' }}><SimpleMarkdown content={selectedNote.content} color="var(--text)" /></div>
            </div>
          </div>
        ) : (
          <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:12, padding:24 }}>
            <div style={{ width:50, height:50, borderRadius:15, background:'var(--accent-soft)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--accent)' }}><Icon name="notes" size={22} /></div>
            <h3 style={{ fontFamily:'var(--font-display)', color:'var(--text)', fontSize:16, fontWeight:600, margin:0 }}>Generate notes</h3>
            <p style={{ color:'var(--text-sub)', fontSize:13, textAlign:'center', maxWidth:260, margin:0 }}>Pick a note type above and tap Generate.</p>
          </div>
        )}
      </div>
    </div>
  )
}

function OverviewTab({ currentVideo }) {
  if (!currentVideo) return null
  return (
    <div style={{ flex:1, overflowY:'auto', padding:'16px 12px 40px' }}>
      <div style={{ maxWidth:720, margin:'0 auto' }}>
        <div style={{ background:'var(--bg-card)', borderRadius:'var(--radius-lg)', overflow:'hidden', border:'1px solid var(--border)', marginBottom:14, boxShadow:'var(--shadow-sm)' }}>
          {currentVideo.thumbnail && <img src={currentVideo.thumbnail} alt="" style={{ width:'100%', height:'clamp(140px,40vw,200px)', objectFit:'cover' }} />}
          <div style={{ padding:16 }}>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(15px,3.5vw,19px)', fontWeight:600, color:'var(--text)', margin:'0 0 8px' }}>{currentVideo.title}</h2>
            <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
              {currentVideo.channelName && <span style={{ fontSize:12, color:'var(--text-sub)' }}>{currentVideo.channelName}</span>}
              {currentVideo.duration && <span style={{ fontSize:12, color:'var(--text-sub)', fontFamily:'var(--font-mono)' }}>{currentVideo.duration}</span>}
            </div>
          </div>
        </div>

        {currentVideo.summary && (
          <div style={{ background:'var(--bg-card)', borderRadius:'var(--radius-md)', padding:16, border:'1px solid var(--border)', marginBottom:12, boxShadow:'var(--shadow-sm)' }}>
            <h3 style={{ fontSize:14, fontWeight:700, color:'var(--text)', margin:'0 0 10px', display:'flex', alignItems:'center', gap:7 }}><Icon name="sparkles" size={15} style={{ color:'var(--accent)' }} /> AI summary</h3>
            <SimpleMarkdown content={currentVideo.summary} color="var(--text)" />
          </div>
        )}

        {currentVideo.keyPoints?.length>0 && (
          <div style={{ background:'var(--bg-card)', borderRadius:'var(--radius-md)', padding:16, border:'1px solid var(--border)', marginBottom:12, boxShadow:'var(--shadow-sm)' }}>
            <h3 style={{ fontSize:14, fontWeight:700, color:'var(--text)', margin:'0 0 12px', display:'flex', alignItems:'center', gap:7 }}><Icon name="check" size={15} style={{ color:'var(--accent)' }} /> Key points</h3>
            <div style={{ display:'flex', flexDirection:'column', gap:9 }}>
              {currentVideo.keyPoints.map((pt,i) => (
                <div key={i} style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
                  <div style={{ width:21, height:21, borderRadius:6, background:'var(--accent-soft)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--accent)', fontSize:11, fontWeight:700, flexShrink:0, fontFamily:'var(--font-mono)' }}>{i+1}</div>
                  <span style={{ fontSize:13, color:'var(--text)', lineHeight:1.6 }}>{pt}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentVideo.tags?.length>0 && (
          <div style={{ background:'var(--bg-card)', borderRadius:'var(--radius-md)', padding:16, border:'1px solid var(--border)', boxShadow:'var(--shadow-sm)' }}>
            <h3 style={{ fontSize:14, fontWeight:700, color:'var(--text)', margin:'0 0 10px' }}>Tags</h3>
            <div style={{ display:'flex', flexWrap:'wrap', gap:7 }}>
              {currentVideo.tags.map(t => <span key={t} style={{ padding:'4px 11px', borderRadius:'var(--radius-full)', background:'var(--accent-soft)', color:'var(--accent)', fontSize:12, fontWeight:600 }}>{t}</span>)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
