'use client'

const steps = [
  {
    num: '01', title: 'Drop Your Video',
    body: 'Upload MP4 footage directly from your browser. Configure inference parameters — confidence, IoU, preview stride — in seconds.',
    anim: <div style={{ width: 40, height: 40, border: '2px dashed rgba(0,212,255,0.30)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'pulse-dot 2s infinite' }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00d4ff" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
    </div>,
  },
  {
    num: '02', title: 'AI Runs the Job',
    body: 'Our detection engine processes every frame, tracking each worker, identifying PPE status, and streaming live previews back to your browser via SSE.',
    anim: <div style={{ width: '100%' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--t4)', marginBottom: 4 }}>PROCESSING...</div>
      <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ height: '100%', background: 'var(--grad-cyan-violet)', animation: 'progressLoop 2s ease-in-out infinite', borderRadius: 2 }} />
      </div>
    </div>,
  },
  {
    num: '03', title: 'Violations Surface Instantly',
    body: 'Every worker gets a safety profile for the clip. Missing equipment flagged per frame, per worker, with annotated JPEG proof attached.',
    anim: <div style={{ display: 'flex', gap: 6 }}>
      {(['var(--c3)','var(--c3)','var(--c4)','var(--c3)'] as const).map((c, i) => (
        <div key={i} style={{ width: 16, height: 16, borderRadius: '50%', background: `${c}20`, border: `1px solid ${c}`, animation: c === 'var(--c4)' ? 'pulse-dot 1s infinite' : undefined }} />
      ))}
    </div>,
  },
  {
    num: '04', title: 'Export the Evidence',
    body: 'Download the annotated video, generate compliance PDFs, schedule automated reports, and share with auditors in one click.',
    anim: <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--t3)', border: '1px solid var(--border)', padding: '6px 12px', borderRadius: 6, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
      EVIDENCE.PDF
    </div>,
  },
]

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" style={{ padding: '100px 48px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <div className="section-label">WORKFLOW</div>
          <h2 className="section-h2">
            From <span className="text-gradient-hero">Upload</span> to Evidence — in Minutes.
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 40, position: 'relative' }} className="steps-grid">
          {/* Connecting dashed line */}
          <div style={{ position: 'absolute', top: 28, left: 'calc(12.5% + 28px)', right: 'calc(12.5% + 28px)', borderTop: '1px dashed rgba(0,212,255,0.20)', zIndex: 0 }} className="steps-line" />

          {steps.map((s, i) => (
            <div key={i} data-reveal="" style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column' as const, gap: 16 }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', border: '2px solid rgba(0,212,255,0.30)', background: 'rgba(0,212,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 700, background2: 'var(--grad-text)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' } as React.CSSProperties}>
                <span className="text-gradient-hero">{s.num}</span>
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--t1)' }}>{s.title}</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--t2)', lineHeight: 1.7 }}>{s.body}</div>
              <div style={{ marginTop: 8 }}>{s.anim}</div>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        @media (max-width: 1024px) { .steps-grid { grid-template-columns: repeat(2,1fr) !important; } .steps-line { display: none !important; } }
        @media (max-width: 640px)  { .steps-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  )
}
