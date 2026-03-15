'use client'

const pillars = [
  {
    icon: '🔐',
    title: 'JWT Auth',
    body: '15-min access tokens with httpOnly refresh cookies and automatic rotation',
  },
  {
    icon: '🛡️',
    title: 'Role-Based Access',
    body: '4-tier hierarchy with route + API level enforcement and resource scoping',
  },
  {
    icon: '📋',
    title: 'Full Audit Log',
    body: 'Every action logged with IP address, timestamp, and old/new value diffs',
  },
  {
    icon: '🔒',
    title: 'Evidence Integrity',
    body: 'SHA-256 frame checksums with immutable proof URLs and tamper detection',
  },
]

const badges = ['ISO 45001', 'GDPR Ready', 'SOC 2 Type II']

export default function SecuritySection() {
  return (
    <section style={{ padding: '100px 48px', background: 'linear-gradient(180deg, var(--bg-base), var(--bg-surface))' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Intro */}
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <div className="section-label">SECURITY</div>
          <h2 className="section-h2">
            Enterprise-Grade <span className="text-gradient-hero">Security</span>
          </h2>
        </div>

        {/* Pillars */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 24, marginBottom: 48 }} className="security-pillars-grid">
          {pillars.map((p) => (
            <div key={p.title} data-reveal="" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '28px 24px', textAlign: 'center' as const }}>
              <div style={{ fontSize: 32, marginBottom: 16 }}>{p.icon}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, color: 'var(--t1)', marginBottom: 10 }}>{p.title}</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--t2)', lineHeight: 1.7 }}>{p.body}</div>
            </div>
          ))}
        </div>

        {/* Compliance badges */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' as const }}>
          {badges.map((b) => (
            <div key={b} style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--t2)', border: '1px solid var(--border-bright)', borderRadius: 6, padding: '8px 20px', letterSpacing: '0.1em', background: 'var(--bg-elevated)' }}>{b}</div>
          ))}
        </div>
      </div>
      <style>{`@media(max-width:900px){.security-pillars-grid{grid-template-columns:repeat(2,1fr)!important;}}@media(max-width:480px){.security-pillars-grid{grid-template-columns:1fr!important;}}`}</style>
    </section>
  )
}
