'use client'

const ITEMS = [
  { num: '99.2%', label: 'Detection Accuracy' },
  { num: '<200ms', label: 'Inference Per Frame' },
  { num: '340+', label: 'Active Installations' },
  { num: '2.4M+', label: 'Workers Monitored' },
  { num: '12', label: 'PPE Classes Supported' },
  { num: 'GDPR', label: '& ISO 45001 Compliant' },
  { num: '24/7', label: 'SSE Streaming' },
  { num: 'Zero', label: 'Config Face Enrollment' },
]
const REPEATED = [...ITEMS, ...ITEMS, ...ITEMS]

export default function StatsTicker() {
  return (
    <div style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '20px 0', overflow: 'hidden', position: 'relative' }}>
      {/* Fade edges */}
      <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 80, background: 'linear-gradient(90deg, var(--bg-surface), transparent)', zIndex: 1, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: 80, background: 'linear-gradient(-90deg, var(--bg-surface), transparent)', zIndex: 1, pointerEvents: 'none' }} />

      <div style={{ display: 'flex', width: 'max-content', animation: 'ticker 30s linear infinite' }}
        onMouseEnter={e => (e.currentTarget.style.animationPlayState = 'paused')}
        onMouseLeave={e => (e.currentTarget.style.animationPlayState = 'running')}>
        {REPEATED.map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 28px', whiteSpace: 'nowrap' }}>
            <span style={{ color: 'var(--cyan)', fontSize: 14 }}>⬡</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 15, background: 'var(--grad-text)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{item.num}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--t2)' }}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
