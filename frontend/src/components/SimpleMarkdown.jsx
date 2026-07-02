export default function SimpleMarkdown({ content, color = 'var(--text)' }) {
  const lines = (content || '').split('\n')
  return (
    <div style={{ fontSize:14, lineHeight:1.7 }}>
      {lines.map((line, i) => {
        if (line.startsWith('## ')) return <h2 key={i} style={{ fontFamily:'var(--font-display)', fontSize:17, fontWeight:600, margin:'18px 0 8px', color, borderBottom:'2px solid var(--accent-soft-border)', paddingBottom:6 }}>{line.slice(3)}</h2>
        if (line.startsWith('### ')) return <h3 key={i} style={{ fontSize:14, fontWeight:700, margin:'14px 0 5px', color }}>{line.slice(4)}</h3>
        if (line.startsWith('- ') || line.startsWith('* ')) return <li key={i} style={{ margin:'3px 0', color, opacity:0.9, marginLeft:18 }} dangerouslySetInnerHTML={{ __html: line.slice(2).replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>') }} />
        if (line.match(/^\d+\. /)) return <li key={i} style={{ margin:'3px 0', color, opacity:0.9, marginLeft:18 }}>{line.replace(/^\d+\. /,'')}</li>
        if (line.trim() === '') return <br key={i} />
        return <p key={i} style={{ margin:'3px 0', color, opacity:0.87 }} dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>').replace(/\*(.*?)\*/g,'<em>$1</em>') }} />
      })}
    </div>
  )
}
