import { useState } from 'react'
import Icon from '../components/Icon'

export default function LandingPage({ onGetStarted }) {
  const [hoveredFeature, setHoveredFeature] = useState(null)

  const features = [
    { icon: 'chat', title: 'AI Chat', desc: 'Have a real conversation with any YouTube video. Ask follow-up questions, get clarifications, and go deep on any topic.', color: '#0d9488' },
    { icon: 'notes', title: 'Smart Notes', desc: 'Auto-generate 6 types of notes — summaries, key points, chapter breakdowns, interview prep, and more.', color: '#7c3aed' },
    { icon: 'brain', title: 'Learn Faster', desc: 'Skip the 2-hour video. Get the essence in minutes with AI-powered summaries and key takeaways.', color: '#d97706' },
    { icon: 'sparkles', title: 'Groq AI Powered', desc: 'Powered by Llama 3.3 70B via Groq — blazing fast responses, completely free to use.', color: '#dc2626' },
    { icon: 'fileText', title: 'Export Notes', desc: 'Download your generated notes as text files to use in your own study materials.', color: '#0284c7' },
    { icon: 'star', title: 'Save Favourites', desc: 'Bookmark videos and access your entire learning history from a single dashboard.', color: '#059669' },
  ]

  const steps = [
    { num: '01', title: 'Paste a YouTube URL', desc: 'Copy any YouTube video link and paste it into VidChat AI.' },
    { num: '02', title: 'AI Analyzes the Video', desc: 'We extract the transcript and run it through Llama 3.3 to generate summaries and insights.' },
    { num: '03', title: 'Chat & Learn', desc: 'Ask anything about the video, generate notes, and learn smarter — not longer.' },
  ]

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', fontFamily:'var(--font-body)', overflowX:'hidden' }}>

      {/* ── Nav ── */}
      <nav style={{ position:'fixed', top:0, left:0, right:0, zIndex:100, background:'rgba(245,247,250,0.85)', backdropFilter:'blur(16px)', borderBottom:'1px solid var(--border)', height:70 }}>
        <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 24px', height:'100%', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:38, height:38, borderRadius:10, background:'linear-gradient(135deg, var(--accent), var(--accent-dark))', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 12px rgba(13,148,136,0.35)' }}>
              <Icon name="youtube" size={19} style={{ color:'white' }} />
            </div>
            <span style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:700, color:'var(--text)', letterSpacing:'-0.02em' }}>
              VidChat <span style={{ color:'var(--accent)', fontStyle:'italic' }}>AI</span>
            </span>
          </div>
          <div style={{ display:'flex', gap:12, alignItems:'center' }}>
            <button onClick={() => onGetStarted('signin')} style={{ padding:'9px 20px', borderRadius:'var(--radius-full)', border:'1.5px solid var(--border)', background:'transparent', color:'var(--text)', fontSize:14, fontWeight:600, cursor:'pointer', transition:'all 0.2s' }}
              onMouseEnter={e => e.target.style.borderColor='var(--accent)'}
              onMouseLeave={e => e.target.style.borderColor='var(--border)'}>
              Sign in
            </button>
            <button onClick={() => onGetStarted('signup')} style={{ padding:'9px 22px', borderRadius:'var(--radius-full)', border:'none', background:'linear-gradient(135deg, var(--accent), var(--accent-dark))', color:'white', fontSize:14, fontWeight:700, cursor:'pointer', boxShadow:'0 4px 14px rgba(13,148,136,0.35)', transition:'all 0.2s' }}
              onMouseEnter={e => e.target.style.transform='translateY(-1px)'}
              onMouseLeave={e => e.target.style.transform='translateY(0)'}>
              Get Started Free
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ paddingTop:140, paddingBottom:100, padding:'140px 24px 100px', textAlign:'center', position:'relative', overflow:'hidden' }}>
        {/* Background blobs */}
        <div style={{ position:'absolute', top:-100, left:'50%', transform:'translateX(-50%)', width:800, height:600, background:'radial-gradient(ellipse, rgba(13,148,136,0.12) 0%, transparent 70%)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', top:100, right:-150, width:400, height:400, background:'radial-gradient(circle, rgba(124,58,237,0.07) 0%, transparent 70%)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', top:200, left:-100, width:350, height:350, background:'radial-gradient(circle, rgba(217,119,6,0.07) 0%, transparent 70%)', pointerEvents:'none' }} />

        <div style={{ maxWidth:820, margin:'0 auto', position:'relative' }}>
          {/* Badge */}
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'7px 16px', borderRadius:'var(--radius-full)', background:'var(--accent-soft)', border:'1px solid var(--accent-soft-border)', marginBottom:28 }}>
            <div style={{ width:7, height:7, borderRadius:'50%', background:'var(--accent)', animation:'pulse 2s ease-in-out infinite' }} />
            <span style={{ fontSize:13, fontWeight:600, color:'var(--accent)' }}>Powered by Llama 3.3 · Free to use</span>
          </div>

          <h1 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(38px, 6vw, 72px)', fontWeight:700, color:'var(--text)', lineHeight:1.1, letterSpacing:'-0.03em', marginBottom:24 }}>
            Chat with any<br />
            <span style={{ color:'var(--accent)', fontStyle:'italic' }}>YouTube video</span>
          </h1>

          <p style={{ fontSize:'clamp(17px, 2.2vw, 21px)', color:'var(--text-sub)', lineHeight:1.65, maxWidth:600, margin:'0 auto 44px' }}>
            Paste a YouTube URL and instantly get AI-powered summaries, generate smart notes, and have a conversation with the video content.
          </p>

          <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap' }}>
            <button onClick={() => onGetStarted('signup')}
              style={{ padding:'15px 36px', borderRadius:'var(--radius-full)', border:'none', background:'linear-gradient(135deg, var(--accent) 0%, var(--accent-dark) 100%)', color:'white', fontSize:17, fontWeight:700, cursor:'pointer', boxShadow:'0 6px 24px rgba(13,148,136,0.4)', transition:'all 0.25s', display:'flex', alignItems:'center', gap:10 }}
              onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 10px 32px rgba(13,148,136,0.5)' }}
              onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 6px 24px rgba(13,148,136,0.4)' }}>
              <Icon name="sparkles" size={18} /> Start for free
            </button>
            <button onClick={() => onGetStarted('signin')}
              style={{ padding:'15px 32px', borderRadius:'var(--radius-full)', border:'2px solid var(--border)', background:'var(--bg-elevated)', color:'var(--text)', fontSize:17, fontWeight:600, cursor:'pointer', transition:'all 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor='var(--accent)'}
              onMouseLeave={e => e.currentTarget.style.borderColor='var(--border)'}>
              Sign in
            </button>
          </div>
        </div>

        {/* Hero visual */}
        <div style={{ maxWidth:900, margin:'70px auto 0', position:'relative' }}>
          <div style={{ background:'var(--bg-elevated)', borderRadius:24, border:'1px solid var(--border)', overflow:'hidden', boxShadow:'var(--shadow-xl)', padding:0 }}>
            {/* Fake browser bar */}
            <div style={{ background:'var(--bg)', padding:'14px 18px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ display:'flex', gap:6 }}>
                <div style={{ width:12, height:12, borderRadius:'50%', background:'#ff5f57' }} />
                <div style={{ width:12, height:12, borderRadius:'50%', background:'#ffbd2e' }} />
                <div style={{ width:12, height:12, borderRadius:'50%', background:'#28c840' }} />
              </div>
              <div style={{ flex:1, background:'var(--bg-card)', borderRadius:6, padding:'6px 14px', fontSize:12, color:'var(--text-faint)', fontFamily:'var(--font-mono)', border:'1px solid var(--border)' }}>
                localhost:5173
              </div>
            </div>

            {/* Mock dashboard */}
            <div style={{ display:'flex', height:400 }}>
              {/* Mock sidebar */}
              <div style={{ width:220, background:'var(--bg)', borderRight:'1px solid var(--border)', padding:'16px 12px', display:'flex', flexDirection:'column', gap:8 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                  <div style={{ width:28, height:28, borderRadius:7, background:'linear-gradient(135deg,var(--accent),var(--accent-dark))', display:'flex', alignItems:'center', justifyContent:'center' }}><Icon name="youtube" size={14} style={{ color:'white' }} /></div>
                  <span style={{ fontFamily:'var(--font-display)', fontSize:14, fontWeight:700, color:'var(--text)' }}>VidChat <span style={{ color:'var(--accent)', fontStyle:'italic' }}>AI</span></span>
                </div>
                {['JavaScript Tutorial', 'React Hooks Deep Dive', 'Node.js Basics'].map((t,i) => (
                  <div key={i} style={{ padding:'9px 10px', borderRadius:8, background: i===0 ? 'var(--accent-soft)' : 'transparent', border:`1px solid ${i===0?'var(--accent-soft-border)':'transparent'}`, cursor:'pointer' }}>
                    <div style={{ fontSize:11, fontWeight:500, color: i===0?'var(--accent)':'var(--text-sub)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{t}</div>
                  </div>
                ))}
              </div>

              {/* Mock chat */}
              <div style={{ flex:1, display:'flex', flexDirection:'column' }}>
                <div style={{ padding:'12px 16px', borderBottom:'1px solid var(--border)', fontSize:13, fontWeight:600, color:'var(--text)' }}>JavaScript Tutorial for Beginners</div>
                <div style={{ flex:1, padding:'16px', display:'flex', flexDirection:'column', gap:12, overflowY:'hidden' }}>
                  <div style={{ alignSelf:'flex-end', background:'var(--msg-user)', border:'1px solid var(--accent-soft-border)', borderRadius:'16px 16px 4px 16px', padding:'10px 14px', maxWidth:'75%', fontSize:13, color:'var(--text)' }}>
                    What are closures in JavaScript?
                  </div>
                  <div style={{ alignSelf:'flex-start', maxWidth:'80%' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:5 }}>
                      <div style={{ width:20, height:20, borderRadius:6, background:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center' }}><Icon name="sparkles" size={10} style={{ color:'white' }} /></div>
                      <span style={{ fontSize:11, fontWeight:700, color:'var(--accent)' }}>VidChat AI</span>
                    </div>
                    <div style={{ background:'var(--msg-ai)', border:'1px solid var(--border)', borderRadius:'4px 16px 16px 16px', padding:'10px 14px', fontSize:12, color:'var(--text-sub)', lineHeight:1.6 }}>
                      Based on the video, a closure is a function that has access to variables from its outer scope even after the outer function has returned. The instructor demonstrates this with a counter example...
                    </div>
                  </div>
                </div>
                <div style={{ padding:'10px 12px', borderTop:'1px solid var(--border)', display:'flex', gap:8, alignItems:'center' }}>
                  <div style={{ flex:1, padding:'9px 14px', borderRadius:10, border:'1.5px solid var(--border)', background:'var(--bg-input)', fontSize:12, color:'var(--text-faint)' }}>Ask anything about this video…</div>
                  <div style={{ width:34, height:34, borderRadius:9, background:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center' }}><Icon name="send" size={14} style={{ color:'white' }} /></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section style={{ padding:'80px 24px', background:'var(--bg-elevated)', borderTop:'1px solid var(--border)', borderBottom:'1px solid var(--border)' }}>
        <div style={{ maxWidth:900, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:56 }}>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(28px,4vw,42px)', fontWeight:700, color:'var(--text)', letterSpacing:'-0.02em', marginBottom:14 }}>How it works</h2>
            <p style={{ fontSize:17, color:'var(--text-sub)', maxWidth:480, margin:'0 auto' }}>From video URL to AI-powered learning in under 30 seconds</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:32 }}>
            {steps.map((s,i) => (
              <div key={i} style={{ textAlign:'center', padding:'32px 24px', borderRadius:'var(--radius-xl)', background:'var(--bg)', border:'1px solid var(--border)', position:'relative', overflow:'hidden' }}>
                <div style={{ position:'absolute', top:16, right:20, fontFamily:'var(--font-mono)', fontSize:42, fontWeight:800, color:'var(--accent-soft)', letterSpacing:'-2px' }}>{s.num}</div>
                <div style={{ width:52, height:52, borderRadius:16, background:'var(--accent-soft)', border:'1px solid var(--accent-soft-border)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 18px', color:'var(--accent)' }}>
                  <Icon name={['link','sparkles','chat'][i]} size={24} />
                </div>
                <h3 style={{ fontFamily:'var(--font-display)', fontSize:20, fontWeight:700, color:'var(--text)', marginBottom:10 }}>{s.title}</h3>
                <p style={{ fontSize:15, color:'var(--text-sub)', lineHeight:1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ padding:'80px 24px' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:56 }}>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(28px,4vw,42px)', fontWeight:700, color:'var(--text)', letterSpacing:'-0.02em', marginBottom:14 }}>Everything you need to learn smarter</h2>
            <p style={{ fontSize:17, color:'var(--text-sub)', maxWidth:500, margin:'0 auto' }}>One tool to summarize, chat, and take notes on any YouTube video</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:20 }}>
            {features.map((f,i) => (
              <div key={i}
                onMouseEnter={() => setHoveredFeature(i)}
                onMouseLeave={() => setHoveredFeature(null)}
                style={{ padding:'28px', borderRadius:'var(--radius-xl)', background:'var(--bg-elevated)', border:`1px solid ${hoveredFeature===i ? f.color+'40' : 'var(--border)'}`, transition:'all 0.25s', cursor:'default', boxShadow: hoveredFeature===i ? `0 8px 32px ${f.color}18` : 'var(--shadow-xs)', transform: hoveredFeature===i ? 'translateY(-3px)' : 'translateY(0)' }}>
                <div style={{ width:48, height:48, borderRadius:14, background:`${f.color}14`, border:`1px solid ${f.color}30`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:18, color:f.color }}>
                  <Icon name={f.icon} size={22} />
                </div>
                <h3 style={{ fontSize:18, fontWeight:700, color:'var(--text)', marginBottom:8, fontFamily:'var(--font-display)' }}>{f.title}</h3>
                <p style={{ fontSize:15, color:'var(--text-sub)', lineHeight:1.65 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding:'80px 24px', background:'linear-gradient(135deg, #0f766e 0%, #0d9488 50%, #14b8a6 100%)', textAlign:'center', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, background:'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.04\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")', pointerEvents:'none' }} />
        <div style={{ position:'relative', maxWidth:640, margin:'0 auto' }}>
          <h2 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(28px,4vw,48px)', fontWeight:700, color:'white', letterSpacing:'-0.02em', marginBottom:18, lineHeight:1.15 }}>
            Start learning smarter today
          </h2>
          <p style={{ fontSize:18, color:'rgba(255,255,255,0.85)', marginBottom:40, lineHeight:1.6 }}>
            Free forever. No credit card required. Powered by Groq's free API.
          </p>
          <button onClick={() => onGetStarted('signup')}
            style={{ padding:'16px 44px', borderRadius:'var(--radius-full)', border:'none', background:'white', color:'var(--accent-dark)', fontSize:18, fontWeight:800, cursor:'pointer', boxShadow:'0 8px 32px rgba(0,0,0,0.2)', transition:'all 0.25s' }}
            onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 12px 40px rgba(0,0,0,0.25)' }}
            onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 8px 32px rgba(0,0,0,0.2)' }}>
            Create free account →
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ padding:'32px 24px', borderTop:'1px solid var(--border)', textAlign:'center' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10, marginBottom:10 }}>
          <div style={{ width:28, height:28, borderRadius:7, background:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Icon name="youtube" size={14} style={{ color:'white' }} />
          </div>
          <span style={{ fontFamily:'var(--font-display)', fontSize:16, fontWeight:700, color:'var(--text)' }}>VidChat AI</span>
        </div>
        <p style={{ color:'var(--text-faint)', fontSize:14 }}>Built with ❤️ using React, Node.js, and Groq AI</p>
      </footer>
    </div>
  )
}
