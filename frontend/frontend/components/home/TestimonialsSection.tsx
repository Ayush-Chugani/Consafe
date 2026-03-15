'use client'

const testimonials = [
  {
    quote: 'Before PPE Analytics, our monthly audits took 3 days. Now we have real-time proof of compliance at every shift.',
    name: 'Rajesh Nair',
    role: 'HSE Director',
    company: 'TATA STEEL',
    avatarGrad: 'linear-gradient(135deg, var(--cyan), var(--c2))',
  },
  {
    quote: 'The face attendance system replaced our manual register overnight. We haven\'t missed an attendance discrepancy in 6 months.',
    name: 'Chen Wei',
    role: 'Safety Manager',
    company: 'FOXCONN INDUSTRIAL',
    avatarGrad: 'linear-gradient(135deg, var(--c2), var(--c3))',
  },
  {
    quote: 'The evidence vault has been invaluable for insurance claims. Having annotated frames with timestamps is game-changing.',
    name: 'Priya Sharma',
    role: 'Plant Manager',
    company: 'RELIANCE INDUSTRIES',
    avatarGrad: 'linear-gradient(135deg, var(--c3), var(--c4))',
  },
]

export default function TestimonialsSection() {
  return (
    <section style={{ padding: '100px 48px', background: 'var(--bg-base)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Intro */}
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase' as const, color: 'var(--cyan)', borderLeft: '1px solid var(--cyan-border)', paddingLeft: 12, display: 'inline-block', marginBottom: 20 }}>TRUSTED BY SAFETY TEAMS</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px,4vw,56px)', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            What HSE <span className="text-gradient-hero">Directors</span> Say.
          </h2>
        </div>

        {/* Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }} className="testimonials-grid">
          {testimonials.map((t) => (
            <div key={t.name} data-reveal="" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 32, display: 'flex', flexDirection: 'column', gap: 20, position: 'relative' as const }}>
              {/* Quote mark */}
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 60, lineHeight: 1, color: 'var(--cyan)', opacity: 0.25, position: 'absolute' as const, top: 20, right: 28 }}>"</div>
              {/* Body */}
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--t1)', lineHeight: 1.75, fontStyle: 'italic' as const }}>"{t.quote}"</p>
              {/* Author */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 'auto' }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: t.avatarGrad, flexShrink: 0 }} />
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600, color: 'var(--t1)' }}>{t.name}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--t3)', marginTop: 2 }}>{t.role}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--cyan)', letterSpacing: '0.06em' }}>{t.company}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <style>{`@media(max-width:900px){.testimonials-grid{grid-template-columns:1fr!important;}}`}</style>
    </section>
  )
}
