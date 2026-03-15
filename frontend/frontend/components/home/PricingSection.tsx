'use client'
import Link from 'next/link'

const plans = [
  {
    tier: 'STARTER',
    amount: '$299',
    period: 'per month · Up to 50 workers',
    tierColor: 'var(--t1)',
    amountStyle: {},
    borderColor: 'var(--border)',
    features: [
      'PPE Detection Engine',
      'Face Attendance System',
      '10 analysis jobs / month',
      '7-day evidence retention',
      'Email support',
    ],
    checkColor: 'var(--cyan)',
    cta: 'Get Started',
    ctaStyle: { background: 'transparent', border: '1px solid var(--cyan-border)', color: 'var(--cyan)' },
    popular: false,
  },
  {
    tier: 'PROFESSIONAL',
    amount: '$899',
    period: 'per month · Up to 200 workers',
    tierColor: 'var(--c4)',
    amountStyle: {},
    borderColor: 'var(--cyan)',
    features: [
      'Everything in Starter',
      'Unlimited analysis jobs',
      '90-day evidence retention',
      'Admin command panel',
      'Scheduled PDF reports',
      'Full API access',
      'Priority support',
    ],
    checkColor: 'var(--cyan)',
    cta: 'Start Free Trial',
    ctaStyle: { background: 'var(--cyan)', color: '#03040a', border: 'none', fontWeight: 600 },
    popular: true,
  },
  {
    tier: 'ENTERPRISE',
    amount: 'Custom',
    period: 'per agreement · Unlimited workers',
    tierColor: 'var(--c2-bright)',
    amountStyle: { background: 'var(--grad-violet-green)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' },
    borderColor: 'var(--c2-30)',
    features: [
      'Everything in Professional',
      'Custom SLA agreement',
      'Dedicated infrastructure',
      'On-premise deployment',
      'SSO / SAML integration',
      'Custom API integrations',
    ],
    checkColor: 'var(--c2-bright)',
    cta: 'Contact Sales',
    ctaStyle: { background: 'transparent', border: '1px solid var(--c2-30)', color: 'var(--c2-bright)' },
    popular: false,
  },
]

export default function PricingSection() {
  return (
    <section id="pricing" style={{ padding: '100px 48px', background: 'linear-gradient(180deg, var(--bg-surface), var(--bg-base))' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Intro */}
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase' as const, color: 'var(--cyan)', borderLeft: '1px solid var(--cyan-border)', paddingLeft: 12, display: 'inline-block', marginBottom: 20 }}>PRICING</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px,4vw,56px)', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            Simple. <span className="text-gradient-hero">Transparent.</span> Scalable.
          </h2>
        </div>

        {/* Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24, alignItems: 'stretch' }} className="pricing-grid">
          {plans.map((p) => (
            <div key={p.tier} data-reveal="" style={{ background: 'var(--bg-surface)', border: `1px solid ${p.borderColor}`, borderRadius: 16, padding: '32px 28px', display: 'flex', flexDirection: 'column', gap: 0, position: 'relative' as const, boxShadow: p.popular ? '0 0 40px rgba(0,212,255,0.08)' : 'none' }}>
              {p.popular && (
                <div style={{ position: 'absolute' as const, top: -12, left: '50%', transform: 'translateX(-50%)', fontFamily: 'var(--font-mono)', fontSize: 9, color: '#03040a', background: 'var(--cyan)', borderRadius: 4, padding: '4px 12px', letterSpacing: '0.1em', whiteSpace: 'nowrap' as const }}>MOST POPULAR</div>
              )}
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.15em', color: p.tierColor, marginBottom: 16 }}>{p.tier}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 42, fontWeight: 800, marginBottom: 4, background: 'var(--grad-text)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', ...p.amountStyle }}>{p.amount}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--t3)', marginBottom: 28 }}>{p.period}</div>

              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                {p.features.map((f) => (
                  <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--t2)' }}>
                    <span style={{ color: p.checkColor, flexShrink: 0, marginTop: 1 }}>✓</span>{f}
                  </li>
                ))}
              </ul>

              <Link href="/dashboard" style={{ display: 'block', textAlign: 'center' as const, fontFamily: 'var(--font-mono)', fontSize: 13, letterSpacing: '0.05em', borderRadius: 8, padding: '12px 24px', textDecoration: 'none', transition: 'opacity 0.2s', ...p.ctaStyle }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
              >{p.cta}</Link>
            </div>
          ))}
        </div>
      </div>
      <style>{`@media(max-width:900px){.pricing-grid{grid-template-columns:1fr!important;}}`}</style>
    </section>
  )
}
